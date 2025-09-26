import React, { useState } from 'react';
import { FiSettings, FiSun, FiMoon, FiCheck } from 'react-icons/fi';
import { useTheme } from '../hooks/useTheme';

const ThemeSwitcher = () => {
  const { currentTheme, darkMode, themes, changeTheme, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = Object.entries(themes).map(([key, theme]) => ({
    key,
    name: theme.name,
    colors: theme.colors
  }));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Theme Settings"
      >
        <FiSettings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {themes[currentTheme].name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Theme Settings
            </h3>

            {/* Color Theme Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Color Theme
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.key}
                    onClick={() => {
                      changeTheme(theme.key);
                      setIsOpen(false);
                    }}
                    className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      currentTheme === theme.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors.primary[500] }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {theme.name}
                      </div>
                      <div className="flex justify-center mt-1">
                        {currentTheme === theme.key && (
                          <FiCheck className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </div>

                    {/* Color palette preview */}
                    <div className="flex justify-center space-x-1 mt-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.primary[300] }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.primary[500] }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.primary[700] }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {darkMode ? (
                  <FiMoon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <FiSun className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Toggle dark/light appearance
                  </div>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeSwitcher;
