"""
Services module for prompts app
"""

from .ai_service import OllamaService
from .guardrails_service import NemoGuardrailsService

# Create service instances
ollama_service = OllamaService()
nemo_guardrails_service = NemoGuardrailsService()
