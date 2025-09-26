import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiPlus, FiEdit, FiTrash2, FiHeart, FiEye, FiRefreshCw, FiShield, FiCheck, FiClock } from 'react-icons/fi';
import { promptsAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';

const PromptCard = ({ prompt, onEdit, onDelete, onToggleFavorite, onUse }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
      {/* Guardrails validation indicator */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
          <FiShield className="h-3 w-3" />
          <FiCheck className="h-3 w-3" />
          <span className="font-medium">Validated</span>
        </div>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {prompt.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {prompt.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <FiEye className="h-4 w-4 mr-1" />
              {prompt.usage_count}
            </span>
            <span className="flex items-center">
              <FiClock className="h-4 w-4 mr-1" />
              v{prompt.current_version || 1}
            </span>
            <span>{prompt.category_name}</span>
            <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleFavorite(prompt.id)}
            className={`p-2 rounded-full transition-colors ${prompt.is_favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          >
            <FiHeart className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {prompt.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              {tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUse(prompt.id)}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            Use
          </button>
          <button
            onClick={() => onEdit(prompt.id)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PromptList = () => {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrompts();
    fetchCategories();

    // Check if we should refresh prompts (e.g., after creating a new prompt)
    const shouldRefresh = location.state?.refresh || location.search.includes('refresh=true');
    if (shouldRefresh) {
      // Clear the refresh flag from URL to prevent infinite loops
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state?.refresh, location.search]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await promptsAPI.getPrompts({
        page: currentPage,
        search: searchTerm,
        category: selectedCategory,
        all: 'true' // Request all prompts regardless of user
      });
      setPrompts(response.data.results || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPrompts();
  };

  const handleEdit = (id) => {
    // Navigate to edit page
    console.log('Edit prompt:', id);
    navigate(`/prompts/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      try {
        await promptsAPI.deletePrompt(id);
        toast.success('Prompt deleted successfully');
        fetchPrompts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting prompt:', error);
        toast.error('Failed to delete prompt');
      }
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      // Optimistic update - update UI immediately
      setPrompts(prevPrompts =>
        prevPrompts.map(prompt =>
          prompt.id === id
            ? { ...prompt, is_favorite: !prompt.is_favorite }
            : prompt
        )
      );

      await promptsAPI.toggleFavorite(id);
      toast.success('Favorite status updated');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      setPrompts(prevPrompts =>
        prevPrompts.map(prompt =>
          prompt.id === id
            ? { ...prompt, is_favorite: !prompt.is_favorite }
            : prompt
        )
      );
      toast.error('Failed to update favorite status');
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    fetchPrompts();
  };

  const handleUse = (id) => {
    // Copy prompt to clipboard and increment usage count
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      navigator.clipboard.writeText(prompt.content).then(() => {
        toast.success('Prompt copied to clipboard');
      }).catch(() => {
        toast.error('Failed to copy prompt');
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Prompts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and organize your prompts
          </p>
        </div>
        <Link
          to="/prompts/new"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="h-5 w-5" />
          <span>New Prompt</span>
        </Link>
        <button
          onClick={fetchPrompts}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search prompts..."
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Prompts Grid */}
      {prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onUse={handleUse}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No prompts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedCategory
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first prompt'
            }
          </p>
          {!searchTerm && !selectedCategory && (
            <Link
              to="/prompts/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="h-5 w-5" />
              <span>Create Prompt</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptList;
