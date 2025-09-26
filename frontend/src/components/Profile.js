import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiCalendar, FiFileText, FiHeart, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { promptsAPI } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPrompts: 0,
    favoritePrompts: 0,
    totalUsage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await promptsAPI.getPromptStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and view your statistics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FiUser className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Username
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FiMail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Email
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Member Since
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user?.date_joined).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Statistics
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <FiFileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_prompts}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Prompts
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiHeart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.favorite_prompts}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Favorites
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiBarChart2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_usage}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Usage
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FiFileText className="h-4 w-4" />
                <span>View All Prompts</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <FiHeart className="h-4 w-4" />
                <span>View Favorites</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
