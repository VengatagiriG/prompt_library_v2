import React, { useState, useEffect } from 'react';
import { FiHeart, FiFileText, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { promptsAPI } from '../services/api';

const FavoritePromptCard = ({ prompt, onEdit, onDelete, onToggleFavorite, onUse }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {prompt.title}
            </h3>
            <FiHeart className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {prompt.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <FiEye className="h-4 w-4 mr-1" />
              {prompt.usage_count}
            </span>
            <span>{prompt.category_name}</span>
            <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {prompt.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full">
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

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await promptsAPI.getFavorites();
      setFavorites(response.data.results || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    console.log('Edit favorite:', id);
  };

  const handleDelete = (id) => {
    console.log('Delete favorite:', id);
  };

  const handleToggleFavorite = (id) => {
    console.log('Toggle favorite:', id);
  };

  const handleUse = (id) => {
    console.log('Use favorite:', id);
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
            Favorite Prompts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your starred and most-loved prompts
          </p>
        </div>
      </div>

      {/* Favorites Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((prompt) => (
            <FavoritePromptCard
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
          <FiHeart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No favorite prompts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Star prompts you love to see them here
          </p>
          <a
            href="/prompts"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiFileText className="h-5 w-5" />
            <span>Browse Prompts</span>
          </a>
        </div>
      )}

      {/* Quick Stats */}
      {favorites.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Favorites Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {favorites.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Favorites
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {favorites.reduce((sum, prompt) => sum + (prompt.usage_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Usage
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(favorites.reduce((sum, prompt) => sum + (prompt.usage_count || 0), 0) / Math.max(favorites.length, 1))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Usage/Fav
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
