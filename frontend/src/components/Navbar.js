import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiSun, FiMoon, FiUser, FiLogOut, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import AdvancedThemeSwitcher from './AdvancedThemeSwitcher';

const Navbar = ({ onMenuClick, darkMode, onDarkModeToggle, sidebarCollapsed, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center space-x-2 ml-4 lg:ml-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PL</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Prompt Library
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search - Desktop only */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Advanced Theme Switcher */}
            <AdvancedThemeSwitcher />

            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                title="User menu"
              >
                <FiUser className="h-5 w-5" />
                <span className="hidden md:block text-sm font-medium">
                  {user?.username || 'User'}
                </span>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block">
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiUser className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>⭐</span>
                    <span>Favorites</span>
                  </Link>
                  <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiLogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
