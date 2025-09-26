import React, { useState } from 'react';
import { FiSettings, FiCheck, FiX } from 'react-icons/fi';
import { useTheme } from '../hooks/useTheme';

const ColorPicker = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(color);

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
  };

  const handleApply = () => {
    onChange(selectedColor);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setSelectedColor(color);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
        style={{ backgroundColor: color }}
        title="Pick custom color"
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={selectedColor}
              onChange={handleColorChange}
              className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="#000000"
            />
          </div>

          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <FiX className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleApply}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              <FiCheck className="h-4 w-4" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdvancedThemeSwitcher = () => {
  const { currentTheme, darkMode, themes, changeTheme, createCustomTheme, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = Object.entries(themes).map(([key, theme]) => ({
    key,
    name: theme.name,
    baseColor: theme.baseColor,
    colors: theme.colors
  }));

  const handleCustomColorSelect = (color) => {
    createCustomTheme(color);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Advanced Theme Settings"
      >
        <FiSettings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {themes[currentTheme].name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Advanced Theme Settings
            </h3>

            {/* Predefined Themes */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Predefined Themes
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
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
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
                          <FiCheck className="h-3 w-3 text-primary-500" />
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

            {/* Custom Color Picker */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Create Custom Theme
              </h4>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pick a color:
                </span>
                <ColorPicker
                  color={themes[currentTheme].baseColor || '#3b82f6'}
                  onChange={handleCustomColorSelect}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Select any color to generate a custom theme
                </div>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  {darkMode && <div className="w-2 h-2 rounded-full bg-primary-600"></div>}
                </div>
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
                  darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Color Palette Display */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Current Theme Colors
              </h4>
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center">
                  <div className="w-6 h-6 rounded mx-auto mb-1" style={{ backgroundColor: 'var(--color-primary-500)' }}></div>
                  <div className="text-xs text-gray-500">Primary</div>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 rounded mx-auto mb-1" style={{ backgroundColor: 'var(--color-secondary-500)' }}></div>
                  <div className="text-xs text-gray-500">Secondary</div>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 rounded mx-auto mb-1 bg-success-500"></div>
                  <div className="text-xs text-gray-500">Success</div>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 rounded mx-auto mb-1 bg-warning-500"></div>
                  <div className="text-xs text-gray-500">Warning</div>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 rounded mx-auto mb-1 bg-error-500"></div>
                  <div className="text-xs text-gray-500">Error</div>
                </div>
              </div>
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

export default AdvancedThemeSwitcher;
