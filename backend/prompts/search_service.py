"""
Advanced Search Service for Prompt Library
Provides comprehensive search capabilities including:
- Semantic search with embeddings
- Advanced search operators (AND, OR, NOT, quotes)
- Search result highlighting and snippets
- Caching and performance optimization
- Real-time search suggestions
"""

import re
import json
import hashlib
from typing import List, Dict, Tuple, Optional, Any
from django.db.models import Q, Value, TextField, FloatField
from django.db.models.functions import Concat
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import logging

from ..models import Prompt, Category
from .ai_service import ollama_service

logger = logging.getLogger(__name__)


class SearchService:
    """Advanced search service with semantic capabilities"""

    def __init__(self):
        self.cache_timeout = getattr(settings, 'SEARCH_CACHE_TIMEOUT', 300)  # 5 minutes
        self.max_results = getattr(settings, 'SEARCH_MAX_RESULTS', 100)
        self.semantic_threshold = getattr(settings, 'SEMANTIC_SEARCH_THRESHOLD', 0.3)

        # Initialize TF-IDF vectorizer for text search
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )

    def search(self, query: str, filters: Dict = None, semantic: bool = False) -> Dict[str, Any]:
        """
        Main search method that orchestrates different search strategies

        Args:
            query: Search query string
            filters: Additional filters (category, author, tags, etc.)
            semantic: Whether to use semantic search

        Returns:
            Dict containing search results and metadata
        """
        if not query.strip():
            return {
                'results': [],
                'total': 0,
                'query': query,
                'search_type': 'empty',
                'execution_time': 0
            }

        # Generate cache key
        cache_key = self._generate_cache_key(query, filters, semantic)

        # Check cache first
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for query: {query}")
            return cached_result

        start_time = timezone.now()

        try:
            # Parse advanced search operators
            parsed_query = self._parse_advanced_query(query)

            if semantic:
                results = self._semantic_search(parsed_query, filters)
            else:
                results = self._text_search(parsed_query, filters)

            # Apply post-processing
            results = self._post_process_results(results, query)

            # Add search metadata
            result_data = {
                'results': results[:self.max_results],
                'total': len(results),
                'query': query,
                'search_type': 'semantic' if semantic else 'text',
                'execution_time': (timezone.now() - start_time).total_seconds(),
                'filters_applied': filters or {},
                'suggestions': self._generate_suggestions(query, results[:5])
            }

            # Cache the results
            cache.set(cache_key, result_data, self.cache_timeout)

            return result_data

        except Exception as e:
            logger.error(f"Search error for query '{query}': {e}")
            return {
                'results': [],
                'total': 0,
                'query': query,
                'search_type': 'error',
                'execution_time': (timezone.now() - start_time).total_seconds(),
                'error': str(e)
            }

    def _parse_advanced_query(self, query: str) -> Dict[str, Any]:
        """
        Parse advanced search operators from query string

        Supports:
        - AND, OR, NOT operators
        - Quoted phrases
        - Field-specific searches (title:, content:, etc.)
        """
        parsed = {
            'must': [],      # Terms that must be present
            'should': [],    # Terms that should be present (OR)
            'must_not': [],  # Terms that must not be present
            'phrases': [],   # Exact phrases
            'fields': {}     # Field-specific searches
        }

        # Remove extra whitespace
        query = re.sub(r'\s+', ' ', query.strip())

        # Find quoted phrases first
        phrase_pattern = r'"([^"]*)"'
        phrases = re.findall(phrase_pattern, query)
        for phrase in phrases:
            parsed['phrases'].append(phrase.strip())
            query = query.replace(f'"{phrase}"', '')

        # Parse operators
        terms = query.split()

        i = 0
        while i < len(terms):
            term = terms[i].lower()

            if term in ['and', 'or', 'not']:
                operator = term.upper()
                i += 1
                if i < len(terms):
                    next_term = ' '.join(terms[i:])
                    if operator == 'NOT':
                        parsed['must_not'].append(next_term)
                    elif operator == 'OR':
                        parsed['should'].append(next_term)
                    else:  # AND
                        parsed['must'].append(next_term)
                    break
            elif ':' in term:
                # Field-specific search
                field, value = term.split(':', 1)
                if field in ['title', 'content', 'description', 'tags', 'category']:
                    if field not in parsed['fields']:
                        parsed['fields'][field] = []
                    parsed['fields'][field].append(value)
            else:
                # Regular term
                if i == 0:
                    parsed['must'].append(term)
                else:
                    parsed['should'].append(term)

            i += 1

        return parsed

    def _text_search(self, parsed_query: Dict, filters: Dict = None) -> List[Dict]:
        """Perform traditional text-based search"""
        queryset = Prompt.objects.select_related('category', 'author').filter(is_active=True)

        # Apply filters
        if filters:
            if filters.get('category'):
                queryset = queryset.filter(category_id=filters['category'])
            if filters.get('author'):
                queryset = queryset.filter(author__username__icontains=filters['author'])
            if filters.get('tags'):
                for tag in filters['tags']:
                    queryset = queryset.filter(tags__icontains=tag)

        # Build search query
        search_q = Q()

        # Must terms (AND)
        for term in parsed_query['must']:
            search_q &= (
                Q(title__icontains=term) |
                Q(description__icontains=term) |
                Q(content__icontains=term) |
                Q(tags__icontains=term)
            )

        # Should terms (OR)
        if parsed_query['should']:
            should_q = Q()
            for term in parsed_query['should']:
                should_q |= (
                    Q(title__icontains=term) |
                    Q(description__icontains=term) |
                    Q(content__icontains=term) |
                    Q(tags__icontains=term)
                )
            search_q |= should_q

        # Must not terms (NOT)
        for term in parsed_query['must_not']:
            search_q &= ~(
                Q(title__icontains=term) |
                Q(description__icontains=term) |
                Q(content__icontains=term) |
                Q(tags__icontains=term)
            )

        # Field-specific searches
        for field, values in parsed_query['fields'].items():
            field_q = Q()
            for value in values:
                if field == 'category':
                    field_q |= Q(category__name__icontains=value)
                else:
                    field_q |= Q(**{f'{field}__icontains': value})
            search_q &= field_q

        # Exact phrases
        for phrase in parsed_query['phrases']:
            search_q &= (
                Q(title__icontains=phrase) |
                Q(description__icontains=phrase) |
                Q(content__icontains=phrase)
            )

        queryset = queryset.filter(search_q).distinct()

        # Annotate with relevance scores
        queryset = self._annotate_relevance(queryset, parsed_query)

        # Order by relevance and usage
        queryset = queryset.order_by('-relevance_score', '-usage_count', '-created_at')

        results = []
        for prompt in queryset[:self.max_results * 2]:  # Get more for post-processing
            results.append({
                'id': str(prompt.id),
                'title': prompt.title,
                'description': prompt.description or '',
                'content': prompt.content[:500] + '...' if len(prompt.content) > 500 else prompt.content,
                'category': prompt.category.name if prompt.category else None,
                'author': prompt.author.username,
                'tags': prompt.tags,
                'usage_count': prompt.usage_count,
                'created_at': prompt.created_at.isoformat(),
                'relevance_score': getattr(prompt, 'relevance_score', 0),
                'match_snippets': self._generate_snippets(prompt, parsed_query)
            })

        return results

    def _semantic_search(self, parsed_query: Dict, filters: Dict = None) -> List[Dict]:
        """Perform semantic search using AI embeddings"""
        try:
            # Get base query for semantic search
            base_query = ' '.join(parsed_query['must'] + parsed_query['should'] + parsed_query['phrases'])

            if not base_query.strip():
                return []

            # Get embeddings for the query
            query_embedding = self._get_text_embedding(base_query)

            if query_embedding is None:
                # Fallback to text search if embeddings fail
                logger.warning("Semantic search failed, falling back to text search")
                return self._text_search(parsed_query, filters)

            # Get all prompts with their embeddings (simplified for demo)
            queryset = Prompt.objects.select_related('category', 'author').filter(is_active=True)

            if filters:
                if filters.get('category'):
                    queryset = queryset.filter(category_id=filters['category'])

            results = []
            for prompt in queryset:
                # Generate embedding for prompt content (simplified)
                prompt_text = f"{prompt.title} {prompt.description or ''} {prompt.content[:1000]}"
                prompt_embedding = self._get_text_embedding(prompt_text)

                if prompt_embedding is not None:
                    # Calculate cosine similarity
                    similarity = cosine_similarity(
                        [query_embedding],
                        [prompt_embedding]
                    )[0][0]

                    if similarity >= self.semantic_threshold:
                        results.append({
                            'id': str(prompt.id),
                            'title': prompt.title,
                            'description': prompt.description or '',
                            'content': prompt.content[:500] + '...' if len(prompt.content) > 500 else prompt.content,
                            'category': prompt.category.name if prompt.category else None,
                            'author': prompt.author.username,
                            'tags': prompt.tags,
                            'usage_count': prompt.usage_count,
                            'created_at': prompt.created_at.isoformat(),
                            'relevance_score': float(similarity),
                            'match_snippets': self._generate_snippets(prompt, parsed_query)
                        })

            # Sort by similarity score
            results.sort(key=lambda x: x['relevance_score'], reverse=True)

            return results[:self.max_results]

        except Exception as e:
            logger.error(f"Semantic search error: {e}")
            # Fallback to text search
            return self._text_search(parsed_query, filters)

    def _get_text_embedding(self, text: str) -> Optional[List[float]]:
        """Get text embedding using AI service"""
        try:
            # For demo purposes, create a simple hash-based embedding
            # In production, this would use a real embedding model
            import hashlib
            hash_obj = hashlib.md5(text.encode('utf-8'))
            hash_bytes = hash_obj.digest()

            # Convert to simple vector representation
            embedding = [b / 255.0 for b in hash_bytes[:50]]  # Use first 50 bytes as 50-dim vector

            return embedding

        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return None

    def _annotate_relevance(self, queryset, parsed_query: Dict):
        """Add relevance scoring to queryset"""
        # Simple relevance scoring based on field matches
        annotations = {}

        for term in parsed_query['must'] + parsed_query['should']:
            term_lower = term.lower()
            annotations[f'title_score_{hash(term_lower)}'] = Value(
                3 if term_lower in queryset.model._meta.get_field('title').value_from_object else 0,
                output_field=FloatField()
            )

        # For demo, just return queryset as-is
        # In production, this would use more sophisticated scoring
        return queryset

    def _generate_snippets(self, prompt, parsed_query: Dict) -> Dict[str, str]:
        """Generate highlighted snippets for search results"""
        snippets = {}

        search_terms = parsed_query['must'] + parsed_query['should'] + parsed_query['phrases']

        for field in ['title', 'description', 'content']:
            text = getattr(prompt, field, '')
            if text:
                snippet = self._highlight_text(text, search_terms)
                snippets[field] = snippet

        return snippets

    def _highlight_text(self, text: str, terms: List[str], max_length: int = 200) -> str:
        """Highlight search terms in text"""
        if not text or not terms:
            return text[:max_length] + '...' if len(text) > max_length else text

        highlighted = text

        for term in terms:
            if len(term) > 2:  # Only highlight terms longer than 2 chars
                pattern = re.compile(re.escape(term), re.IGNORECASE)
                highlighted = pattern.sub(f'<mark>{term}</mark>', highlighted)

        # Truncate if too long
        if len(highlighted) > max_length:
            # Find a good breaking point
            truncated = highlighted[:max_length]
            last_mark = truncated.rfind('<mark>')
            if last_mark > max_length * 0.7:  # If mark is in last 30%, include it
                truncated = highlighted[:last_mark + len('<mark>') + 10]  # Include start of highlight
                truncated += '...'
            else:
                truncated += '...'

            return truncated

        return highlighted

    def _post_process_results(self, results: List[Dict], query: str) -> List[Dict]:
        """Post-process search results"""
        # Remove duplicates based on title similarity
        unique_results = []
        seen_titles = set()

        for result in results:
            title_lower = result['title'].lower()
            if title_lower not in seen_titles:
                seen_titles.add(title_lower)
                unique_results.append(result)

        return unique_results

    def _generate_suggestions(self, query: str, results: List[Dict]) -> List[str]:
        """Generate search suggestions based on results"""
        suggestions = []

        # Extract tags from results
        all_tags = []
        for result in results:
            all_tags.extend(result.get('tags', []))

        # Get unique tags and sort by frequency
        tag_counts = {}
        for tag in all_tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

        # Suggest top tags
        top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        suggestions.extend([f'Add tag: "{tag}"' for tag, count in top_tags])

        # Suggest related searches
        if len(results) > 0:
            top_category = results[0].get('category')
            if top_category:
                suggestions.append(f'Search in category: "{top_category}"')

        return suggestions[:5]

    def _generate_cache_key(self, query: str, filters: Dict, semantic: bool) -> str:
        """Generate cache key for search results"""
        key_data = {
            'query': query.lower().strip(),
            'filters': filters or {},
            'semantic': semantic,
            'version': '1.0'  # Cache invalidation version
        }

        key_string = json.dumps(key_data, sort_keys=True)
        cache_key = f"search_{hashlib.md5(key_string.encode()).hexdigest()}"

        return cache_key

    def clear_cache(self, query: str = None):
        """Clear search cache"""
        if query:
            # Clear specific query cache
            cache_key = self._generate_cache_key(query, {}, False)
            cache.delete(cache_key)
            cache_key = self._generate_cache_key(query, {}, True)
            cache.delete(cache_key)
        else:
            # Clear all search cache (use with caution)
            cache.delete_pattern('search_*')

    def get_search_analytics(self) -> Dict[str, Any]:
        """Get search analytics data"""
        # This would integrate with your analytics system
        return {
            'total_searches': 0,
            'popular_queries': [],
            'search_trends': [],
            'performance_metrics': {}
        }


# Global search service instance
search_service = SearchService()
