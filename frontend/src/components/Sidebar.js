import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiFileText, FiFolder, FiStar, FiBarChart2, FiUser, FiPlus, FiSearch, FiX, FiShield
} from 'react-icons/fi';

const Sidebar = ({ open, onClose, collapsed = false }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'All Prompts', href: '/prompts', icon: FiFileText },
    { name: 'Categories', href: '/categories', icon: FiFolder },
    { name: 'Favorites', href: '/favorites', icon: FiStar },
    { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
  ];

  const quickActions = [
    { name: 'New Prompt', href: '/prompts/new', icon: FiPlus },
    { name: 'Search', href: '/search', icon: FiSearch },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${collapsed ? 'px-2' : ''}`}>
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Menu
          </h2>
        )}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <div className={`p-4 ${collapsed ? 'px-2' : ''}`}>
        {/* Navigation */}
        <nav className="space-y-2">
          <div className={`${collapsed ? 'mb-4' : 'mb-4'}`}>
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Navigation
              </p>
            )}
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  onClick={onClose}
                  title={collapsed ? item.name : ''}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div>
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Quick Actions
              </p>
            )}
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                  onClick={onClose}
                  title={collapsed ? item.name : ''}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className={`mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 ${collapsed ? 'px-2' : ''}`}>
          <Link
            to="/profile"
            className={`
              flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${isActive('/profile')
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            onClick={onClose}
            title={collapsed ? 'Profile' : ''}
          >
            <FiUser className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Profile</span>}
          </Link>

          <Link
            to="/audit-logs"
            className={`
              flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${isActive('/audit-logs')
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            onClick={onClose}
            title={collapsed ? 'Audit Logs' : ''}
          >
            <FiShield className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Audit Logs</span>}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
