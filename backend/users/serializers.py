from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with additional info"""
    prompt_count = serializers.SerializerMethodField()
    favorite_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'prompt_count', 'favorite_count', 'date_joined'
        ]
        read_only_fields = ['id', 'username', 'date_joined']

    def get_prompt_count(self, obj):
        try:
            # Use get_or_create to avoid import issues
            from prompts.models import Prompt
            return Prompt.objects.filter(author=obj).count()
        except:
            return 0

    def get_favorite_count(self, obj):
        try:
            # Use get_or_create to avoid import issues
            from prompts.models import Prompt
            return Prompt.objects.filter(author=obj, is_favorite=True).count()
        except:
            return 0
