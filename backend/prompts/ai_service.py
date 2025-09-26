"""
AI Service for LLM integration with Ollama
"""

import os
import requests
import json
import asyncio
from typing import Optional, Dict, List, Any
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

class OllamaService:
    """Service for interacting with Ollama LLM"""

    def __init__(self):
        self.base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
        self.default_model = getattr(settings, 'OLLAMA_DEFAULT_MODEL', 'gpt-oss:20b')
        self.timeout = getattr(settings, 'OLLAMA_TIMEOUT', 1200)  # 20 minutes timeout

    def is_ollama_available(self) -> bool:
        """Check if Ollama service is available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except requests.RequestException as e:
            logger.warning(f"Ollama service not available: {e}")
            return False

    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available models from Ollama"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=self.timeout)
            if response.status_code == 200:
                data = response.json()
                return data.get('models', [])
            return []
        except requests.RequestException as e:
            logger.error(f"Error fetching models from Ollama: {e}")
            return []

    async def generate_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_message: Optional[str] = None,
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate text completion using Ollama"""
        model = model or self.default_model

        payload = {
            "model": model,
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False
        }

        if system_message:
            payload["system"] = system_message

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=self.timeout
            )

            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "error": f"HTTP {response.status_code}",
                    "response": "Failed to generate completion"
                }
        except requests.RequestException as e:
            logger.error(f"Error generating completion: {e}")
            return {
                "error": str(e),
                "response": "Service unavailable"
            }

    async def generate_prompt_suggestions(
        self,
        context: str,
        suggestion_type: str = "general",
        num_suggestions: int = 3
    ) -> List[str]:
        """Generate prompt suggestions based on context"""
        if not self.is_ollama_available():
            return ["Ollama service is not available. Please ensure Ollama is running locally."]

        system_messages = {
            "general": "You are a helpful AI assistant that generates creative and effective prompt suggestions for various use cases.",
            "writing": "You are a creative writing assistant that helps generate engaging prompts for content creation.",
            "coding": "You are a programming assistant that helps generate technical prompts for software development.",
            "analysis": "You are a data analysis assistant that helps generate prompts for research and analysis tasks.",
            "business": "You are a business strategy assistant that helps generate prompts for professional and business use cases."
        }

        system_message = system_messages.get(suggestion_type, system_messages["general"])

        prompt = f"""
        Based on the following context, generate {num_suggestions} diverse and creative prompt suggestions:

        Context: {context}

        Please provide each suggestion as a complete, standalone prompt that would be useful for AI language models. Make each suggestion unique and tailored to different aspects of the context.
        """

        try:
            result = await self.generate_completion(
                prompt=prompt,
                system_message=system_message,
                max_tokens=800,
                temperature=0.8
            )

            if "error" in result:
                return [f"Error generating suggestions: {result['error']}"]

            response_text = result.get("response", "")

            # Parse the response to extract individual suggestions
            suggestions = []
            lines = response_text.strip().split('\n')

            for line in lines:
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('*') or line.isdigit()):
                    # Remove bullet points and numbering
                    suggestion = line.lstrip('-*123456789. ').strip()
                    if suggestion:
                        suggestions.append(suggestion)

            return suggestions[:num_suggestions]

        except Exception as e:
            logger.error(f"Error in generate_prompt_suggestions: {e}")
            return [f"Unexpected error: {str(e)}"]

    async def improve_prompt(
        self,
        current_prompt: str,
        improvement_type: str = "clarity",
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Improve an existing prompt based on specific criteria"""
        if not self.is_ollama_available():
            return {
                "error": "Ollama service is not available",
                "improved_prompt": current_prompt
            }

        improvement_instructions = {
            "clarity": "Make the prompt clearer and more specific",
            "creativity": "Make the prompt more creative and engaging",
            "specificity": "Make the prompt more detailed and specific",
            "conciseness": "Make the prompt more concise while retaining meaning",
            "structure": "Improve the structure and flow of the prompt"
        }

        instruction = improvement_instructions.get(improvement_type, improvement_instructions["clarity"])

        prompt = f"""
        {instruction}:

        Current prompt: {current_prompt}

        {f'Additional context: {context}' if context else ''}

        Please provide an improved version of this prompt that is more effective for AI language models.
        """

        try:
            result = await self.generate_completion(
                prompt=prompt,
                system_message="You are an expert at crafting effective AI prompts. Help improve prompts to be clearer, more specific, and more engaging.",
                max_tokens=600,
                temperature=0.7
            )

            if "error" in result:
                return {
                    "error": result["error"],
                    "improved_prompt": current_prompt
                }

            improved_prompt = result.get("response", current_prompt).strip()

            return {
                "original_prompt": current_prompt,
                "improved_prompt": improved_prompt,
                "improvement_type": improvement_type
            }

        except Exception as e:
            logger.error(f"Error in improve_prompt: {e}")
            return {
                "error": str(e),
                "improved_prompt": current_prompt
            }

    async def analyze_prompt_effectiveness(
        self,
        prompt: str
    ) -> Dict[str, Any]:
        """Analyze a prompt for effectiveness and provide suggestions"""
        if not self.is_ollama_available():
            return {
                "error": "Ollama service is not available",
                "analysis": "Service unavailable"
            }

        analysis_prompt = f"""
        Analyze the following prompt for effectiveness and provide detailed feedback:

        Prompt: {prompt}

        Please evaluate:
        1. Clarity: Is the prompt clear and unambiguous?
        2. Specificity: Does it provide enough detail for good results?
        3. Structure: Is it well-organized and logical?
        4. Creativity: Does it encourage creative responses?
        5. Completeness: Does it include all necessary elements?

        Provide specific suggestions for improvement.
        """

        try:
            result = await self.generate_completion(
                prompt=analysis_prompt,
                system_message="You are an expert AI prompt engineer. Provide detailed, constructive feedback on prompt effectiveness.",
                max_tokens=1000,
                temperature=0.6
            )

            if "error" in result:
                return {
                    "error": result["error"],
                    "analysis": "Analysis unavailable"
                }

            return {
                "prompt": prompt,
                "analysis": result.get("response", "").strip(),
                "timestamp": "2024-01-01T00:00:00Z"  # In real implementation, use actual timestamp
            }

        except Exception as e:
            logger.error(f"Error in analyze_prompt_effectiveness: {e}")
            return {
                "error": str(e),
                "analysis": "Analysis unavailable"
            }

# Global service instance
ollama_service = OllamaService()
