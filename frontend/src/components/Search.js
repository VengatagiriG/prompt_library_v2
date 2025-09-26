import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiTag, FiUser, FiClock, FiEye, FiTrendingUp, FiStar, FiZap, FiRefreshCw, FiX, FiHelpCircle } from 'react-icons/fi';
import { promptsAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [searchAnalytics, setSearchAnalytics] = useState({
    totalSearches: 0,
    popularQueries: [],
    recentSearches: []
  });
  const [filters, setFilters] = useState({
    category: '',
    author: '',
    dateRange: '',
    tags: [],
    sortBy: 'relevance',
    minUsage: '',
    maxUsage: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchCache, setSearchCache] = useState(new Map());
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSearchHelp, setShowSearchHelp] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);

  useEffect(() => {
    fetchCategories();
    loadSearchAnalytics();

    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Debounced search effect
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim() && !loading) {
        handleSearch({ preventDefault: () => {} }, useSemanticSearch);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, useSemanticSearch, filters, loading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[type="text"]').focus();
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchTerm) {
        setSearchTerm('');
        setResults([]);
        clearAllFilters();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadSearchAnalytics = () => {
    // Load search analytics from localStorage or API
    const analytics = localStorage.getItem('searchAnalytics');
    if (analytics) {
      setSearchAnalytics(JSON.parse(analytics));
    }
  };

  const saveSearchAnalytics = (query) => {
    const analytics = {
      totalSearches: searchAnalytics.totalSearches + 1,
      popularQueries: [...searchAnalytics.popularQueries, query],
      recentSearches: [query, ...searchAnalytics.recentSearches.slice(0, 9)]
    };
    setSearchAnalytics(analytics);
    localStorage.setItem('searchAnalytics', JSON.stringify(analytics));
  };

  const handleSearch = useCallback(async (e, useSemantic = false) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setLoading(true);

    // Check cache first
    const cacheKey = `${searchTerm.trim()}-${useSemantic}-${JSON.stringify(filters)}`;
    if (searchCache.has(cacheKey)) {
      const cachedResults = searchCache.get(cacheKey);
      setResults(cachedResults);
      setLoading(false);

      // Update search history
      updateSearchHistory(searchTerm.trim());
      saveSearchAnalytics(searchTerm);
      toast.success(`Found ${cachedResults.length} cached results for "${searchTerm}"`);
      return;
    }

    saveSearchAnalytics(searchTerm);

    try {
      const searchParams = {
        q: searchTerm.trim(),
        category: filters.category,
        sort_by: filters.sortBy,
        semantic: useSemantic,
        author: filters.author,
        tags: filters.tags,
        min_usage: filters.minUsage,
        max_usage: filters.maxUsage,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
      };

      const response = await promptsAPI.searchPrompts(searchTerm, searchParams);

      if (response.data && response.data.results) {
        setResults(response.data.results);

        // Cache the results
        const newCache = new Map(searchCache);
        newCache.set(cacheKey, response.data.results);
        // Keep only last 10 searches in cache
        if (newCache.size > 10) {
          const firstKey = newCache.keys().next().value;
          newCache.delete(firstKey);
        }
        setSearchCache(newCache);

        if (response.data.results.length === 0) {
          toast.info(`No prompts found for "${searchTerm}". Try adjusting your filters or using different keywords.`);
        } else {
          toast.success(`Found ${response.data.results.length} prompt${response.data.results.length !== 1 ? 's' : ''} for "${searchTerm}"`);
        }
      } else {
        setResults([]);
        toast.warning('Search completed but no results found');
      }

      // Get recommendations based on search
      if (response.data.results?.length > 0) {
        await getRecommendations(response.data.results[0]);
      }

      // Update search history
      updateSearchHistory(searchTerm.trim());

    } catch (error) {
      console.error('Error searching prompts:', error);
      let errorMessage = 'Failed to search prompts';

      if (error.response?.status === 400) {
        errorMessage = 'Invalid search parameters. Please check your filters.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Search endpoint not found. Please try again later.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error.message) {
        errorMessage = `Search failed: ${error.message}`;
      }

      toast.error(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, searchCache]);

  const updateSearchHistory = (query) => {
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleSemanticSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term before using AI search');
      return;
    }

    setSemanticLoading(true);
    try {
      const searchParams = {
        q: searchTerm.trim(),
        semantic: true,
        category: filters.category,
        sort_by: filters.sortBy,
        author: filters.author,
        tags: filters.tags,
        min_usage: filters.minUsage,
        max_usage: filters.maxUsage,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
      };

      const response = await promptsAPI.searchPrompts(searchTerm, searchParams);

      if (response.data && response.data.results) {
        setResults(response.data.results);
        if (response.data.results.length === 0) {
          toast.info('AI search completed but no relevant results found. Try regular search instead.');
        } else {
          toast.success(`AI search found ${response.data.results.length} prompt${response.data.results.length !== 1 ? 's' : ''} for "${searchTerm}"`);
        }
      } else {
        setResults([]);
        toast.warning('AI search completed but no results found');
      }
    } catch (error) {
      console.error('Error in semantic search:', error);
      let errorMessage = 'AI search failed';

      if (error.response?.status === 400) {
        errorMessage = 'Invalid search parameters for AI search. Please check your filters.';
      } else if (error.response?.status === 404) {
        errorMessage = 'AI search service not available. Please try regular search.';
      } else if (error.response?.status === 500) {
        errorMessage = 'AI search server error. Please try again later.';
      } else if (error.message) {
        errorMessage = `AI search failed: ${error.message}`;
      }

      toast.error(errorMessage);
    } finally {
      setSemanticLoading(false);
    }
  };

  const getRecommendations = async (basePrompt) => {
    try {
      const response = await promptsAPI.getPrompts({
        category: basePrompt.category,
        limit: 5,
        exclude_id: basePrompt.id
      });
      setRecommendations(response.data.results || []);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      author: '',
      dateRange: '',
      tags: [],
      sortBy: 'relevance',
      minUsage: '',
      maxUsage: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const generateSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Generate suggestions based on popular searches and categories
      const mockSuggestions = [
        `Search: "${query}" in all prompts`,
        `Search: "${query}" with AI semantic search`,
        `Browse prompts by category`,
        `Search by tags: "${query}"`,
        `Advanced search with filters`
      ];

      // Add category-based suggestions
      const matchingCategories = categories
        .filter(cat => cat.name.toLowerCase().includes(query.toLowerCase()))
        .map(cat => `Browse category: "${cat.name}"`);

      const allSuggestions = [...mockSuggestions, ...matchingCategories];
      setSuggestions(allSuggestions.slice(0, 6));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.includes('category:')) {
      const categoryName = suggestion.match(/"([^"]+)"/)[1];
      const category = categories.find(c => c.name === categoryName);
      if (category) {
        setFilters(prev => ({ ...prev, category: category.id }));
        setSearchTerm('');
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRelevanceScore = (prompt) => {
    // Simple relevance scoring based on search term matching
    const searchLower = searchTerm.toLowerCase();
    const titleScore = prompt.title.toLowerCase().includes(searchLower) ? 3 : 0;
    const descScore = prompt.description.toLowerCase().includes(searchLower) ? 2 : 0;
    const contentScore = prompt.content.toLowerCase().includes(searchLower) ? 1 : 0;

    return titleScore + descScore + contentScore;
  };

  const sortedResults = [...results].sort((a, b) => {
    if (filters.sortBy === 'relevance') {
      return getRelevanceScore(b) - getRelevanceScore(a);
    } else if (filters.sortBy === 'usage') {
      return b.usage_count - a.usage_count;
    } else if (filters.sortBy === 'date') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FiSearch className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Advanced Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Search with AI-powered semantic understanding and smart recommendations
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowSearchHelp(!showSearchHelp)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
          >
            <FiHelpCircle className="h-4 w-4" />
            <span>Search Help</span>
          </button>
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            <FiTrendingUp className="h-4 w-4" />
            <span>Recommendations</span>
          </button>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={(e) => handleSearch(e, useSemanticSearch)} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      generateSuggestions(e.target.value);
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicks
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="Search prompts by title, description, content, or meaning..."
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setResults([]);
                        clearAllFilters();
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  )}

                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                        >
                          <FiSearch className="inline h-4 w-4 mr-2 text-gray-400" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-3 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiFilter className="h-4 w-4" />
                  <span>Filters</span>
                </button>
                <button
                  type="button"
                  onClick={handleSemanticSearch}
                  disabled={semanticLoading || !searchTerm.trim()}
                  className="flex items-center space-x-2 px-4 py-3 text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors disabled:opacity-50"
                >
                  {semanticLoading ? (
                    <FiRefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FiZap className="h-4 w-4" />
                  )}
                  <span>AI Search</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSearch className="h-4 w-4" />
                  )}
                  <span>{loading ? 'Searching...' : 'Search'}</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date Created</option>
                    <option value="usage">Usage Count</option>
                    <option value="title">Title</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Usage
                  </label>
                  <input
                    type="number"
                    value={filters.minUsage}
                    onChange={(e) => handleFilterChange('minUsage', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Usage
                  </label>
                  <input
                    type="number"
                    value={filters.maxUsage}
                    onChange={(e) => handleFilterChange('maxUsage', e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </form>

          {/* Search Help */}
          {showSearchHelp && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Search Syntax Help</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-800 dark:text-blue-200">
                <div>
                  <h5 className="font-medium mb-1">Basic Operators:</h5>
                  <ul className="space-y-1">
                    <li><code>term1 AND term2</code> - Both terms required</li>
                    <li><code>term1 OR term2</code> - Either term</li>
                    <li><code>term1 NOT term2</code> - Exclude term2</li>
                    <li><code>"exact phrase"</code> - Exact match</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-1">Field Searches:</h5>
                  <ul className="space-y-1">
                    <li><code>title:keyword</code> - Search in titles</li>
                    <li><code>content:keyword</code> - Search in content</li>
                    <li><code>tags:keyword</code> - Search in tags</li>
                    <li><code>category:keyword</code> - Search in categories</li>
                  </ul>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                <strong>Examples:</strong> <code>"machine learning" AND python NOT beginner</code> |
                <code>title:"data science" OR content:algorithm</code>
              </div>
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 px-2">
            <span className="inline-flex items-center">
              💡 Tip: Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded mx-1">Ctrl+K</kbd> to focus search, <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded mx-1">Esc</kbd> to clear
            </span>
          </div>
        </div>

        {/* Search Results and Recommendations */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Searching...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Results */}
              <div className="lg:col-span-2">
                {sortedResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Found {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''} for "{searchTerm}"
                      </p>
                    </div>

                    {sortedResults.map((prompt) => (
                      <div key={prompt.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {prompt.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                              {prompt.description}
                            </p>

                            {/* Highlighted content snippet */}
                            {prompt.match_snippets && prompt.match_snippets.content && (
                              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
                                <div
                                  className="text-sm text-gray-700 dark:text-gray-300"
                                  dangerouslySetInnerHTML={{
                                    __html: prompt.match_snippets.content.replace(/<mark>/g, '<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">')
                                  }}
                                />
                              </div>
                            )}

                            {/* Tags */}
                            {prompt.tags && prompt.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {prompt.tags.slice(0, 5).map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                    <FiTag className="h-3 w-3 inline mr-1" />
                                    {tag}
                                  </span>
                                ))}
                                {prompt.tags.length > 5 && (
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                    +{prompt.tags.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Metadata */}
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <FiUser className="h-4 w-4 mr-1" />
                                {prompt.author}
                              </span>
                              <span className="flex items-center">
                                <FiClock className="h-4 w-4 mr-1" />
                                {formatDate(prompt.created_at)}
                              </span>
                              <span className="flex items-center">
                                <FiEye className="h-4 w-4 mr-1" />
                                {prompt.usage_count} uses
                              </span>
                              {prompt.category && (
                                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                  {prompt.category}
                                </span>
                              )}
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                {(prompt.relevance_score * 100).toFixed(0)}% match
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-12">
                    <FiSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Try AI-powered semantic search or adjust your filters
                    </p>
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setResults([]);
                          clearAllFilters();
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Clear search
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={handleSemanticSearch}
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                      >
                        Try AI Search
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Start your search
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Enter a search term above to find prompts with AI-powered understanding
                    </p>
                  </div>
                )}
              </div>

              {/* Recommendations Sidebar */}
              {showRecommendations && (
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        You Might Also Like
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Based on your search
                      </p>
                    </div>
                    <div className="p-6">
                      {recommendations.length > 0 ? (
                        <div className="space-y-4">
                          {recommendations.map((prompt) => (
                            <div key={prompt.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {prompt.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {prompt.description}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>{prompt.category_name}</span>
                                <span>{prompt.usage_count} uses</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <FiStar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            No recommendations available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
