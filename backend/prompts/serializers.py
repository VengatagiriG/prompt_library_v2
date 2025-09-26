from rest_framework import serializers
from .models import Category, Prompt, PromptVersion, GuardrailsConfig, GuardrailsLog
from django.contrib.auth.models import User


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CategoryListSerializer(serializers.ModelSerializer):
    """Simplified serializer for category lists"""
    prompt_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'prompt_count', 'created_at']

    def get_prompt_count(self, obj):
        return obj.prompts.filter(is_active=True).count()


class PromptSerializer(serializers.ModelSerializer):
    """Serializer for Prompt model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    tags = serializers.JSONField()
    version_count = serializers.SerializerMethodField()

    class Meta:
        model = Prompt
        fields = [
            'id', 'title', 'description', 'content', 'category', 'category_name',
            'tags', 'author', 'author_name', 'is_favorite', 'usage_count',
            'last_used_at', 'is_active', 'current_version', 'version_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'usage_count', 'last_used_at', 'created_at', 'updated_at', 'current_version', 'version_count']

    def get_version_count(self, obj):
        return obj.versions.count()

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class PromptVersionSerializer(serializers.ModelSerializer):
    """Serializer for PromptVersion model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = PromptVersion
        fields = [
            'id', 'version_number', 'title', 'description', 'content',
            'category', 'category_name', 'tags', 'author', 'author_name',
            'change_summary', 'created_at'
        ]
        read_only_fields = ['id', 'version_number', 'created_at']


class PromptListSerializer(serializers.ModelSerializer):
    """Simplified serializer for prompt lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    version_count = serializers.SerializerMethodField()

    class Meta:
        model = Prompt
        fields = [
            'id', 'title', 'description', 'category_name', 'author_name',
            'tags', 'is_favorite', 'usage_count', 'is_active', 'current_version',
            'version_count', 'created_at', 'updated_at'
        ]

    def get_version_count(self, obj):
        return obj.versions.count()


class PromptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating prompts"""

    class Meta:
        model = Prompt
        fields = ['id', 'title', 'description', 'content', 'category', 'tags', 'is_favorite']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class PromptUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating prompts"""
    create_version = serializers.BooleanField(default=True, write_only=True)
    change_summary = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Prompt
        fields = ['title', 'description', 'content', 'category', 'tags', 'is_favorite', 'create_version', 'change_summary']

    def update(self, instance, validated_data):
        create_version = validated_data.pop('create_version', True)
        change_summary = validated_data.pop('change_summary', '')

        # Check if user can update this prompt
        if instance.author != self.context['request'].user and not self.context['request'].user.is_staff:
            raise serializers.ValidationError("You can only update your own prompts.")

        # Create a new version if requested and content changed
        if create_version and self._has_content_changed(instance, validated_data):
            PromptVersion.objects.create(
                prompt=instance,
                title=instance.title,
                description=instance.description,
                content=instance.content,
                category=instance.category,
                tags=instance.tags,
                author=instance.author,
                change_summary=change_summary or "Updated prompt content"
            )
            instance.current_version += 1

        return super().update(instance, validated_data)

    def _has_content_changed(self, instance, validated_data):
        """Check if the main content fields have changed"""
        fields_to_check = ['title', 'description', 'content', 'category', 'tags']
        return any(
            str(validated_data.get(field, getattr(instance, field))) != str(getattr(instance, field))
            for field in fields_to_check
        )


class GuardrailsConfigSerializer(serializers.ModelSerializer):
    """Serializer for GuardrailsConfig model"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    yaml_config = serializers.SerializerMethodField()

    class Meta:
        model = GuardrailsConfig
        fields = [
            'id', 'name', 'description', 'config_type', 'configuration',
            'is_active', 'created_by', 'created_by_name', 'yaml_config',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_yaml_config(self, obj):
        """Convert JSON config to YAML format"""
        import yaml
        return yaml.dump(obj.configuration, default_flow_style=False)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class GuardrailsLogSerializer(serializers.ModelSerializer):
    """Serializer for GuardrailsLog model"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    prompt_title = serializers.CharField(source='prompt.title', read_only=True)

    class Meta:
        model = GuardrailsLog
        fields = [
            'id', 'user', 'user_name', 'action_type', 'log_level', 'message',
            'details', 'prompt', 'prompt_title', 'ip_address', 'user_agent',
            'allowed', 'risk_level', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class GuardrailsConfigListSerializer(serializers.ModelSerializer):
    """Simplified serializer for guardrails config lists"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = GuardrailsConfig
        fields = [
            'id', 'name', 'description', 'config_type', 'is_active',
            'created_by_name', 'created_at'
        ]
