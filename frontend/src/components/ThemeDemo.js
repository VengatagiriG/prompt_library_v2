import React from 'react';
import { FiSettings } from 'react-icons/fi';

const ThemeDemo = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FiSettings className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Theme Color Demo
        </h2>
      </div>

      <div className="space-y-4">
        {/* Primary Color Palette */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Colors
          </h3>
          <div className="flex space-x-2">
            <div className="w-8 h-8 rounded bg-primary-50 border"></div>
            <div className="w-8 h-8 rounded bg-primary-100 border"></div>
            <div className="w-8 h-8 rounded bg-primary-200 border"></div>
            <div className="w-8 h-8 rounded bg-primary-300 border"></div>
            <div className="w-8 h-8 rounded bg-primary-400 border"></div>
            <div className="w-8 h-8 rounded bg-primary-500 border"></div>
            <div className="w-8 h-8 rounded bg-primary-600 border"></div>
            <div className="w-8 h-8 rounded bg-primary-700 border"></div>
            <div className="w-8 h-8 rounded bg-primary-800 border"></div>
            <div className="w-8 h-8 rounded bg-primary-900 border"></div>
          </div>
        </div>

        {/* Secondary Color Palette */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Secondary Colors
          </h3>
          <div className="flex space-x-2">
            <div className="w-8 h-8 rounded bg-secondary-50 border"></div>
            <div className="w-8 h-8 rounded bg-secondary-100 border"></div>
            <div className="w-8 h-8 rounded bg-secondary-200 border"></div>
            <div className="w-8 h-8 rounded bg-secondary-300 border"></div>
            <div className="w-8 h-8 rounded bg-secondary-400 border"></div>
            <div className="w-8 h-8 rounded bg-secondary-500 border"></div>
            <div className="w-8 h-8 rounded bg-secondary-600 border"></div>
            <div className="w-8 h-8 rounded bg-secondary-700 border"></div>
            <div className="w-8 h-8 rounded bg-secondary-800 border"></div>
            <div className="w-8 h-8 rounded bg-secondary-900 border"></div>
          </div>
        </div>

        {/* Sample Components */}
        <div className="space-y-3">
          <button className="btn btn-primary">
            Primary Button
          </button>
          <button className="btn btn-secondary ml-3">
            Secondary Button
          </button>
        </div>

        <div className="flex space-x-2">
          <span className="badge badge-primary">Primary Badge</span>
          <span className="badge badge-success">Success Badge</span>
          <span className="badge badge-warning">Warning Badge</span>
          <span className="badge badge-danger">Danger Badge</span>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
