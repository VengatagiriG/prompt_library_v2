import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiBarChart, FiPieChart, FiActivity, FiUsers, FiClock, FiFileText } from 'react-icons/fi';
import { promptsAPI, categoriesAPI } from '../services/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    total_prompts: 0,
    total_categories: 0,
    favorite_prompts: 0,
    total_usage: 0,
    prompts_by_category: [],
    usage_over_time: [],
    top_prompts: [],
    user_activity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch prompt statistics
      let stats = { total_prompts: 0, favorite_prompts: 0, total_usage: 0 };
      try {
        const statsResponse = await promptsAPI.getPromptStats();
        stats = statsResponse.data;
      } catch (error) {
        console.warn('Failed to fetch prompt stats:', error);
      }

      // Fetch category statistics
      let categories = { total_categories: 0 };
      try {
        const categoryResponse = await categoriesAPI.getCategoryStats();
        categories = categoryResponse.data;
      } catch (error) {
        console.warn('Failed to fetch category stats:', error);
      }

      // Fetch recent prompts for usage analysis
      let recentPrompts = [];
      try {
        const recentResponse = await promptsAPI.getPrompts({ limit: 10 });
        recentPrompts = recentResponse.data.results || [];
      } catch (error) {
        console.warn('Failed to fetch recent prompts:', error);
      }

      // Calculate analytics data
      const promptsByCategory = recentPrompts.reduce((acc, prompt) => {
        const categoryName = prompt.category_name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {});

      const usageOverTime = recentPrompts.reduce((acc, prompt) => {
        const date = new Date(prompt.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + prompt.usage_count;
        return acc;
      }, {});

      const topPrompts = recentPrompts
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 5);

      setAnalytics({
        total_prompts: stats.total_prompts || 0,
        total_categories: categories.total_categories || 0,
        favorite_prompts: stats.favorite_prompts || 0,
        total_usage: stats.total_usage || 0,
        prompts_by_category: Object.entries(promptsByCategory).map(([name, count]) => ({ name, count })),
        usage_over_time: Object.entries(usageOverTime).map(([date, usage]) => ({ date, usage })),
        top_prompts: topPrompts,
        user_activity: [] // Placeholder for user activity data
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <FiActivity className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FiBarChart className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Insights and statistics about your prompt library
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Prompts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total_prompts}</p>
            </div>
            <FiFileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total_categories}</p>
            </div>
            <FiPieChart className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.favorite_prompts}</p>
            </div>
            <FiUsers className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total_usage}</p>
            </div>
            <FiTrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompts by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Prompts by Category
            </h3>
          </div>
          <div className="p-6">
            {analytics.prompts_by_category.length > 0 ? (
              <div className="space-y-4">
                {analytics.prompts_by_category.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {category.count} prompts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiPieChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Prompts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Prompts
            </h3>
          </div>
          <div className="p-6">
            {analytics.top_prompts.length > 0 ? (
              <div className="space-y-4">
                {analytics.top_prompts.map((prompt, index) => (
                  <div key={prompt.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {prompt.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {prompt.category_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <FiClock className="h-3 w-3" />
                      <span>{prompt.usage_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiTrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No usage data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Over Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Usage Over Time
          </h3>
        </div>
        <div className="p-6">
          {analytics.usage_over_time.length > 0 ? (
            <div className="space-y-4">
              {analytics.usage_over_time.slice(0, 10).map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 dark:text-white">{data.date}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((data.usage / Math.max(...analytics.usage_over_time.map(d => d.usage))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{data.usage}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No usage timeline data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
