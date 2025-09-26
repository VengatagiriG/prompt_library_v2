import React, { useState, useEffect } from 'react';
import { FiFolder, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { categoriesAPI, promptsAPI } from '../services/api';

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const [promptCount, setPromptCount] = useState(0);

  useEffect(() => {
    fetchPromptCount();
  }, [category.id]);

  const fetchPromptCount = async () => {
    try {
      const response = await promptsAPI.getPrompts({ category: category.id });
      setPromptCount(response.data.results?.length || 0);
    } catch (error) {
      console.error('Error fetching prompt count:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <FiFolder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {promptCount} prompts
            </p>
          </div>
        </div>
      </div>

      {category.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {category.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Created {new Date(category.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(category.id)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getCategories();
      setCategories(response.data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    console.log('Edit category:', id);
  };

  const handleDelete = (id) => {
    console.log('Delete category:', id);
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
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your prompts by category
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FiPlus className="h-5 w-5" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiFolder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No categories found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get started by creating your first category
          </p>
          <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FiPlus className="h-5 w-5" />
            <span>Create Category</span>
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Category Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Categories
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {categories.reduce((sum, cat) => sum + (cat.prompt_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Prompts
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(categories.reduce((sum, cat) => sum + (cat.prompt_count || 0), 0) / Math.max(categories.length, 1))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg Prompts/Category
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
