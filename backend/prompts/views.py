from rest_framework import viewsets, status, serializers
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum
import asyncio
from asgiref.sync import sync_to_async
from .models import Category, Prompt, PromptVersion, AuditLog
from .serializers import (
    CategorySerializer, CategoryListSerializer,
    PromptSerializer, PromptListSerializer, PromptVersionSerializer,
    PromptCreateSerializer, PromptUpdateSerializer,
    GuardrailsConfigSerializer, GuardrailsConfigListSerializer,
    GuardrailsLogSerializer
)
from .search_service import search_service


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category CRUD operations"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return CategoryListSerializer
        return CategorySerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get category statistics"""
        stats = Category.objects.annotate(
            prompt_count=Count('prompts', filter=Q(prompts__is_active=True))
        ).values('name', 'prompt_count')

        return Response({
            'categories': list(stats),
            'total_categories': Category.objects.count(),
            'total_prompts': Prompt.objects.filter(is_active=True).count()
        })


class PromptViewSet(viewsets.ModelViewSet):
    """ViewSet for Prompt CRUD operations"""
    serializer_class = PromptSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PromptFilter
    search_fields = ['title', 'description', 'content']
    ordering_fields = ['title', 'created_at', 'updated_at', 'usage_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Prompt.objects.select_related('category', 'author').filter(is_active=True)

        # Filter by user if not admin and not requesting all prompts
        request_all = self.request.query_params.get('all', '').lower() == 'true'
        if not self.request.user.is_staff and not request_all:
            queryset = queryset.filter(author=self.request.user)

        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return PromptListSerializer
        elif self.action == 'create':
            return PromptCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PromptUpdateSerializer
        return PromptSerializer

    def perform_create(self, serializer):
        prompt = serializer.save(author=self.request.user)

        # Log prompt creation
        AuditLog.log_user_action(
            user=self.request.user,
            action='PROMPT_CREATE',
            resource_type='prompt',
            resource_id=str(prompt.id),
            details={
                'title': prompt.title,
                'category': prompt.category.name if prompt.category else None,
                'tags': prompt.tags
            },
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_update(self, serializer):
        prompt = serializer.save()

        # Log prompt update
        AuditLog.log_user_action(
            user=self.request.user,
            action='PROMPT_UPDATE',
            resource_type='prompt',
            resource_id=str(prompt.id),
            details={
                'title': prompt.title,
                'category': prompt.category.name if prompt.category else None,
                'tags': prompt.tags
            },
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_destroy(self, instance):
        # Log prompt deletion before deleting
        AuditLog.log_user_action(
            user=self.request.user,
            action='PROMPT_DELETE',
            resource_type='prompt',
            resource_id=str(instance.id),
            details={
                'title': instance.title,
                'category': instance.category.name if instance.category else None
            },
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

        instance.delete()

    def _get_client_ip(self):
        """Get the client IP address from the request"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of a prompt"""
        prompt = self.get_object()
        versions = prompt.versions.all()
        serializer = PromptVersionSerializer(versions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def version(self, request, pk=None):
        """Get a specific version of a prompt"""
        prompt = self.get_object()
        version_number = request.query_params.get('version')

        if not version_number:
            return Response({'error': 'Version number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            version_number = int(version_number)
            version = prompt.versions.get(version_number=version_number)
            serializer = PromptVersionSerializer(version)
            return Response(serializer.data)
        except (ValueError, PromptVersion.DoesNotExist):
            return Response({'error': 'Version not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def restore_version(self, request, pk=None):
        """Restore a prompt to a previous version"""
        prompt = self.get_object()
        version_number = request.data.get('version')

        if not version_number:
            return Response({'error': 'Version number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            version_number = int(version_number)
            version = prompt.versions.get(version_number=version_number)

            # Check permissions
            if prompt.author != request.user and not request.user.is_staff:
                return Response({'error': 'You can only restore your own prompts'}, status=status.HTTP_403_FORBIDDEN)

            # Create new version with current content
            PromptVersion.objects.create(
                prompt=prompt,
                title=prompt.title,
                description=prompt.description,
                content=prompt.content,
                category=prompt.category,
                tags=prompt.tags,
                author=prompt.author,
                change_summary=f"Restored to version {version_number}"
            )

            # Update prompt to match the restored version
            prompt.title = version.title
            prompt.description = version.description
            prompt.content = version.content
            prompt.category = version.category
            prompt.tags = version.tags
            prompt.current_version += 1
            prompt.save()

            return Response({'message': f'Prompt restored to version {version_number}'})

        except (ValueError, PromptVersion.DoesNotExist):
            return Response({'error': 'Version not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def favorite(self, request, pk=None):
        """Toggle favorite status of a prompt"""
        prompt = self.get_object()

        if prompt.author != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only favorite your own prompts'},
                status=status.HTTP_403_FORBIDDEN
            )

        prompt.is_favorite = not prompt.is_favorite
        prompt.save()
        return Response({'is_favorite': prompt.is_favorite})

    @action(detail=True, methods=['post'])
    def use(self, request, pk=None):
        """Increment usage count for a prompt"""
        prompt = self.get_object()
        prompt.increment_usage()

        serializer = self.get_serializer(prompt)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """Get user's favorite prompts"""
        favorites = self.get_queryset().filter(is_favorite=True)
        page = self.paginate_queryset(favorites)

        if page is not None:
            serializer = PromptListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = PromptListSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search with semantic capabilities and comprehensive filtering"""
        query = request.query_params.get('q', '').strip()
        category_id = request.query_params.get('category')
        sort_by = request.query_params.get('sort_by', 'relevance')
        semantic = request.query_params.get('semantic', '').lower() == 'true'

        # Build filters dict
        filters = {}
        if category_id:
            filters['category'] = category_id

        # Additional filters from query params
        filter_params = [
            'author', 'tags', 'min_usage', 'max_usage',
            'date_from', 'date_to', 'category_name'
        ]

        for param in filter_params:
            value = request.query_params.get(param)
            if value:
                if param == 'tags':
                    # Handle multiple tags
                    filters['tags'] = request.query_params.getlist('tags')
                else:
                    filters[param] = value

        # Use the search service
        search_results = search_service.search(
            query=query,
            filters=filters,
            semantic=semantic
        )

        # Log the search
        AuditLog.log_user_action(
            user=request.user,
            action='PROMPT_SEARCH',
            resource_type='search',
            details={
                'query': query,
                'semantic': semantic,
                'filters': filters,
                'results_count': search_results['total']
            },
            ip_address=self._get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # Return paginated results if needed
        page = self.paginate_queryset(search_results['results'])
        if page is not None:
            serializer = PromptListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = PromptListSerializer(search_results['results'], many=True, context={'request': request})
        return Response(search_results)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get prompt statistics"""
        queryset = self.get_queryset()

        stats = {
            'total_prompts': queryset.count(),
            'favorite_prompts': queryset.filter(is_favorite=True).count(),
            'total_usage': queryset.aggregate(total=Sum('usage_count'))['total'] or 0,
            'by_category': queryset.values('category__name').annotate(
                count=Count('id')
            ).order_by('-count')
        }

        return Response(stats)

    # AI-powered endpoints
    @action(detail=False, methods=['post'])
    def generate_suggestions(self, request):
        """Generate AI-powered prompt suggestions"""
        context = request.data.get('context', '')
        suggestion_type = request.data.get('type', 'general')
        num_suggestions = request.data.get('num_suggestions', 3)

        if not context:
            return Response(
                {'error': 'Context is required for generating suggestions'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            suggestions = loop.run_until_complete(
                ollama_service.generate_prompt_suggestions(
                    context=context,
                    suggestion_type=suggestion_type,
                    num_suggestions=num_suggestions
                )
            )
            loop.close()

            # Log AI suggestion generation
            AuditLog.log_user_action(
                user=request.user,
                action='AI_SUGGESTION',
                resource_type='ai',
                details={
                    'context_length': len(context),
                    'suggestion_type': suggestion_type,
                    'num_suggestions': num_suggestions
                },
                ip_address=self._get_client_ip(),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            return Response({
                'context': context,
                'suggestions': suggestions,
                'suggestion_type': suggestion_type
            })

        except Exception as e:
            return Response(
                {'error': f'Failed to generate suggestions: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def improve_prompt(self, request):
        """Improve an existing prompt using AI"""
        current_prompt = request.data.get('prompt', '')
        improvement_type = request.data.get('improvement_type', 'clarity')
        context = request.data.get('context', '')

        if not current_prompt:
            return Response(
                {'error': 'Current prompt is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                ollama_service.improve_prompt(
                    current_prompt=current_prompt,
                    improvement_type=improvement_type,
                    context=context
                )
            )
            loop.close()

            if 'error' in result:
                return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Log AI prompt improvement
            AuditLog.log_user_action(
                user=request.user,
                action='AI_IMPROVEMENT',
                resource_type='ai',
                details={
                    'improvement_type': improvement_type,
                    'original_length': len(current_prompt),
                    'improved_length': len(result.get('improved_prompt', ''))
                },
                ip_address=self._get_client_ip(),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            return Response(result)

        except Exception as e:
            return Response(
                {'error': f'Failed to improve prompt: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def analyze_prompt(self, request):
        """Analyze a prompt for effectiveness using AI"""
        prompt_text = request.data.get('prompt', '')

        if not prompt_text:
            return Response(
                {'error': 'Prompt text is required for analysis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                ollama_service.analyze_prompt_effectiveness(prompt_text)
            )
            loop.close()

            if 'error' in result:
                return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Log AI prompt analysis
            AuditLog.log_user_action(
                user=request.user,
                action='AI_ANALYSIS',
                resource_type='ai',
                details={
                    'prompt_length': len(prompt_text)
                },
                ip_address=self._get_client_ip(),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            return Response(result)

        except Exception as e:
            return Response(
                {'error': f'Failed to analyze prompt: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def ai_status(self, request):
        """Check the status of AI services"""
        available = ollama_service.is_ollama_available()
        models = ollama_service.get_available_models()

        return Response({
            'ollama_available': available,
            'available_models': models,
            'default_model': getattr(ollama_service, 'default_model', 'llama2')
        })

    @action(detail=False, methods=['post'])
    def validate_with_guardrails(self, request):
        """Validate prompt content using Nemo Guardrails"""
        content = request.data.get('content', '')
        content_type = request.data.get('content_type', 'prompt')  # 'prompt', 'title', 'description'

        if not content:
            return Response(
                {'error': 'Content is required for validation'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                nemo_guardrails_service.validate_input(content)
            )
            loop.close()

            # Log the validation
            GuardrailsLog.log_validation(
                user=request.user,
                action_type='input_validation',
                message=f"Content validation: {result.get('message', 'Validation completed')}",
                details={
                    'content_type': content_type,
                    'content_length': len(content),
                    'risk_level': result.get('risk_level', 'unknown'),
                    'violations': result.get('violations', [])
                },
                ip_address=self._get_client_ip(),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                allowed=result.get('valid', True),
                risk_level=result.get('risk_level', 'low')
            )

            return Response({
                'content': content,
                'validation_result': result,
                'content_type': content_type
            })

        except Exception as e:
            # Log the error
            GuardrailsLog.log_validation(
                user=request.user,
                action_type='input_validation',
                message=f"Validation failed: {str(e)}",
                details={'error': str(e)},
                log_level='error',
                allowed=False,
                risk_level='error'
            )

            return Response(
                {'error': f'Guardrails validation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def guardrails_status(self, request):
        """Get guardrails service status and configuration"""
        status_info = nemo_guardrails_service.get_guardrails_status()
        config = nemo_guardrails_service.get_guardrails_config()

        return Response({
            'service_status': status_info,
            'current_config': config,
            'active_configs': GuardrailsConfig.objects.filter(is_active=True).count(),
            'total_logs': GuardrailsLog.objects.count()
        })

    @action(detail=False, methods=['post'])
    def update_guardrails_config(self, request):
        """Update guardrails configuration (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can update guardrails configuration'},
                status=status.HTTP_403_FORBIDDEN
            )

        config = request.data.get('config', {})
        config_name = request.data.get('name', 'Default Configuration')
        config_type = request.data.get('config_type', 'custom_rules')

        if not config:
            return Response(
                {'error': 'Configuration data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Save configuration to database
            guardrails_config = GuardrailsConfig.objects.create(
                name=config_name,
                description=request.data.get('description', ''),
                config_type=config_type,
                configuration=config,
                created_by=request.user
            )

            # Update the service configuration
            success = nemo_guardrails_service.update_guardrails_config(config)

            if success:
                # Activate this configuration
                guardrails_config.activate()

                # Log the configuration update
                AuditLog.log_user_action(
                    user=request.user,
                    action='PERMISSION_CHANGE',
                    resource_type='guardrails',
                    details={
                        'config_name': config_name,
                        'config_type': config_type,
                        'activated': True
                    },
                    ip_address=self._get_client_ip(),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )

                return Response({
                    'message': 'Guardrails configuration updated successfully',
                    'config_id': guardrails_config.id,
                    'activated': True
                })
            else:
                guardrails_config.delete()
                return Response(
                    {'error': 'Failed to apply guardrails configuration'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            return Response(
                {'error': f'Failed to update guardrails configuration: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing audit logs (admin only)"""
    serializer_class = None  # Will be set dynamically
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return GuardrailsLogSerializer
        return GuardrailsLogSerializer

    def get_queryset(self):
        queryset = GuardrailsLog.objects.select_related('user', 'prompt').all()

        # Filter based on user permissions
        if not self.request.user.is_staff:
            # Regular users can only see their own logs
            queryset = queryset.filter(user=self.request.user)

        # Filter by action type
        action_type = self.request.query_params.get('action_type', None)
        if action_type:
            queryset = queryset.filter(action_type=action_type)

        # Filter by risk level
        risk_level = self.request.query_params.get('risk_level', None)
        if risk_level:
            queryset = queryset.filter(risk_level=risk_level)

        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)

        # Filter by log level
        log_level = self.request.query_params.get('log_level', None)
        if log_level:
            queryset = queryset.filter(log_level=log_level)

        return queryset.order_by('-timestamp')

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get audit log statistics"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can view audit statistics'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = self.get_queryset()

        stats = {
            'total_logs': queryset.count(),
            'by_action_type': queryset.values('action_type').annotate(
                count=Count('id')
            ).order_by('-count'),
            'by_risk_level': queryset.values('risk_level').annotate(
                count=Count('id')
            ).order_by('-count'),
            'by_log_level': queryset.values('log_level').annotate(
                count=Count('id')
            ).order_by('-count'),
            'by_user': queryset.values('user__username').annotate(
                count=Count('id')
            ).order_by('-count')[:10],
            'recent_activity': queryset[:20].values(
                'timestamp', 'action_type', 'log_level', 'user__username', 'risk_level'
            )
        }

        return Response(stats)

    @action(detail=False, methods=['get'])
    def security_events(self, request):
        """Get security-related audit logs"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can view security events'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get high-risk events
        security_events = self.get_queryset().filter(
            Q(risk_level='high') |
            Q(log_level__in=['error', 'critical']) |
            Q(action_type__in=['jailbreak_attempt', 'content_violation', 'rate_limit'])
        )

        page = self.paginate_queryset(security_events)
        if page is not None:
            serializer = GuardrailsLogSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = GuardrailsLogSerializer(security_events, many=True, context={'request': request})
        return Response(serializer.data)


class GuardrailsConfigViewSet(viewsets.ModelViewSet):
    """ViewSet for managing guardrails configurations (admin only)"""
    queryset = GuardrailsConfig.objects.all()
    serializer_class = GuardrailsConfigSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return GuardrailsConfigListSerializer
        return GuardrailsConfigSerializer

    def get_queryset(self):
        queryset = GuardrailsConfig.objects.select_related('created_by').all()

        # Only staff can see all configs, others can only see active ones
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        return queryset

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise serializers.ValidationError("Only administrators can create guardrails configurations")

        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        if not self.request.user.is_staff:
            raise serializers.ValidationError("Only administrators can update guardrails configurations")

        serializer.save()

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a guardrails configuration"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can activate guardrails configurations'},
                status=status.HTTP_403_FORBIDDEN
            )

        config = self.get_object()

        try:
            config.activate()

            # Log the activation
            AuditLog.log_user_action(
                user=request.user,
                action='PERMISSION_CHANGE',
                resource_type='guardrails_config',
                resource_id=str(config.id),
                details={
                    'config_name': config.name,
                    'config_type': config.config_type,
                    'activated': True
                },
                ip_address=self._get_client_ip(),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            return Response({
                'message': f'Guardrails configuration "{config.name}" activated successfully',
                'config_id': config.id,
                'is_active': True
            })

        except Exception as e:
            return Response(
                {'error': f'Failed to activate configuration: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
