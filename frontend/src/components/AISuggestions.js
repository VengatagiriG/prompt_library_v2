import React, { useState } from 'react';
import { FiZap, FiRefreshCw, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { promptsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AISuggestions = ({ onSelectSuggestion, context = '', suggestionType = 'general' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const generateSuggestions = async () => {
    if (!context.trim()) {
      toast.error('Please provide some context for generating suggestions');
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);
    setSelectedIndex(-1);

    try {
      const response = await promptsAPI.generateSuggestions({
        context: context,
        type: suggestionType,
        num_suggestions: 5
      });

      if (response.data.suggestions) {
        setSuggestions(response.data.suggestions);
        toast.success(`Generated ${response.data.suggestions.length} suggestions`);
      } else {
        setError('No suggestions generated');
      }
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError(err.response?.data?.error || 'Failed to generate suggestions');
      toast.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion, index) => {
    setSelectedIndex(index);
    onSelectSuggestion(suggestion);
    toast.success('Suggestion selected');
  };

  const handleCopySuggestion = (suggestion) => {
    navigator.clipboard.writeText(suggestion);
    toast.success('Suggestion copied to clipboard');
  };

  const getSuggestionTypeLabel = (type) => {
    const labels = {
      'general': 'General',
      'writing': 'Writing',
      'coding': 'Coding',
      'analysis': 'Analysis',
      'business': 'Business'
    };
    return labels[type] || 'General';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiEye className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Suggestions
            </h3>
            <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
              {getSuggestionTypeLabel(suggestionType)}
            </span>
          </div>
          <button
            onClick={generateSuggestions}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <FiRefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <FiZap className="h-4 w-4" />
            )}
            <span>{loading ? 'Generating...' : 'Generate'}</span>
          </button>
        </div>

        {context && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <strong>Context:</strong> {context.length > 100 ? `${context.substring(0, 100)}...` : context}
          </div>
        )}
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center space-x-2">
              <FiX className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click on a suggestion to use it, or click the copy button to copy to clipboard:
            </p>

            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedIndex === index
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleSelectSuggestion(suggestion, index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Suggestion {index + 1}
                      </span>
                      {selectedIndex === index && (
                        <FiCheck className="h-3 w-3 text-primary-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {suggestion}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopySuggestion(suggestion);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy to clipboard"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <FiEye className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              No suggestions generated yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Click "Generate" to get AI-powered prompt suggestions based on your context
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <FiRefreshCw className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Generating AI suggestions...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              This may take a few moments
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestions;
