import django_filters
from django_filters.rest_framework import FilterSet
from .models import Prompt, Category


class PromptFilter(FilterSet):
    """Custom filter for Prompt model to handle JSONField tags"""

    # Custom filter for tags field (JSONField)
    tags = django_filters.CharFilter(method='filter_tags')

    class Meta:
        model = Prompt
        fields = {
            'title': ['icontains'],
            'description': ['icontains'],
            'content': ['icontains'],
            'category': ['exact'],
            'author': ['exact'],
            'is_favorite': ['exact'],
            'is_active': ['exact'],
            'created_at': ['gte', 'lte', 'exact'],
            'updated_at': ['gte', 'lte', 'exact'],
        }

    def filter_tags(self, queryset, name, value):
        """Custom filter for tags JSONField"""
        # Filter prompts where tags array contains the specified value
        return queryset.filter(tags__icontains=value)
