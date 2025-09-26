from django.contrib import admin
from .models import Category, Prompt


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(Prompt)
class PromptAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'is_favorite', 'usage_count', 'created_at')
    list_filter = ('category', 'is_favorite', 'created_at', 'author')
    search_fields = ('title', 'description', 'content')
    readonly_fields = ('usage_count', 'last_used_at', 'created_at', 'updated_at')
    raw_id_fields = ('author',)
    ordering = ('-created_at',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category', 'author')
