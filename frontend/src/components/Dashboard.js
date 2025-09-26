import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { promptsAPI, categoriesAPI } from '../services/api';
import {
  FiFileText,
  FiFolder,
  FiStar,
  FiTrendingUp,
  FiPlus,
  FiEye,
  FiHeart,
  FiClock
} from 'react-icons/fi';
import ThemeDemo from './ThemeDemo';

const StatCard = ({ title, value, icon: Icon, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'bg-primary-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  const cardClasses = onClick
    ? "bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
    : "bg-white dark:bg-gray-800 rounded-lg shadow p-6";

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]} bg-opacity-10`}>
          <Icon className={`h-6 w-6 text-primary-600 dark:text-primary-400`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const RecentPrompt = ({ prompt, onUse }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {prompt.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {prompt.category_name}
          </p>
          <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <FiEye className="h-3 w-3 mr-1" />
              {prompt.usage_count}
            </span>
            <span className="flex items-center">
              <FiClock className="h-3 w-3 mr-1" />
              {new Date(prompt.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {prompt.is_favorite && (
            <FiHeart className="h-4 w-4 text-red-500" />
          )}
          <button
            onClick={() => onUse(prompt.id)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            Use
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalCategories: 0,
    favoritePrompts: 0,
    totalUsage: 0,
  });
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch prompt statistics (with error handling)
      let promptStats = { total_prompts: 0, favorite_prompts: 0, total_usage: 0 };
      try {
        const promptStatsResponse = await promptsAPI.getPromptStats();
        promptStats = promptStatsResponse.data;
      } catch (error) {
        console.warn('Failed to fetch prompt stats:', error);
        // Continue with default values
      }

      // Fetch category statistics (with error handling)
      let categoryStats = { total_categories: 0 };
      try {
        const categoryStatsResponse = await categoriesAPI.getCategoryStats();
        categoryStats = categoryStatsResponse.data;
      } catch (error) {
        console.warn('Failed to fetch category stats:', error);
        // Continue with default values
      }

      // Fetch recent prompts (with error handling)
      let recentPromptsData = [];
      try {
        const recentResponse = await promptsAPI.getPrompts({ limit: 5 });
        recentPromptsData = recentResponse.data.results || [];
      } catch (error) {
        console.warn('Failed to fetch recent prompts:', error);
        // Continue with empty array
      }

      setStats({
        totalPrompts: promptStats.total_prompts || 0,
        totalCategories: categoryStats.total_categories || 0,
        favoritePrompts: promptStats.favorite_prompts || 0,
        totalUsage: promptStats.total_usage || 0,
      });

      setRecentPrompts(recentPromptsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on complete failure
      setStats({
        totalPrompts: 0,
        totalCategories: 0,
        favoritePrompts: 0,
        totalUsage: 0,
      });
      setRecentPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (statType) => {
    switch (statType) {
      case 'prompts':
        navigate('/prompts');
        break;
      case 'categories':
        navigate('/categories');
        break;
      case 'favorites':
        navigate('/favorites');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      default:
        break;
    }
  };

  const handleUsePrompt = async (promptId) => {
    try {
      await promptsAPI.usePrompt(promptId);
      // Update usage count in recent prompts
      setRecentPrompts(prev =>
        prev.map(prompt =>
          prompt.id === promptId
            ? { ...prompt, usage_count: prompt.usage_count + 1 }
            : prompt
        )
      );
    } catch (error) {
      console.error('Error using prompt:', error);
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
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your prompts.
          </p>
        </div>
        <Link
          to="/prompts/new"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="h-5 w-5" />
          <span>New Prompt</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Prompts"
          value={stats.totalPrompts}
          icon={FiFileText}
          color="blue"
          onClick={() => handleStatClick('prompts')}
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon={FiFolder}
          color="green"
          onClick={() => handleStatClick('categories')}
        />
        <StatCard
          title="Favorites"
          value={stats.favoritePrompts}
          icon={FiStar}
          color="yellow"
          onClick={() => handleStatClick('favorites')}
        />
        <StatCard
          title="Total Usage"
          value={stats.totalUsage}
          icon={FiTrendingUp}
          color="purple"
          onClick={() => handleStatClick('analytics')}
        />
      </div>

      {/* Recent Prompts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Prompts
            </h2>
            <Link
              to="/prompts"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentPrompts.length > 0 ? (
            <div className="space-y-4">
              {recentPrompts.map((prompt) => (
                <RecentPrompt
                  key={prompt.id}
                  prompt={prompt}
                  onUse={handleUsePrompt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No prompts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by creating your first prompt.
              </p>
              <Link
                to="/prompts/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="h-5 w-5" />
                <span>Create Prompt</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Theme Demo */}
      <div className="mt-6">
        <ThemeDemo />
      </div>
    </div>
  );
};

export default Dashboard;
