import React, { useEffect } from 'react';
import { FiCommand, FiSave, FiX, FiSearch, FiEdit, FiEye, FiHeart, FiTag, FiZap, FiFileText } from 'react-icons/fi';

const KeyboardShortcuts = ({ onClose }) => {
  const shortcuts = [
    { keys: ['Ctrl', 'S'], description: 'Save prompt', icon: FiSave },
    { keys: ['Ctrl', 'Q'], description: 'Quick save and exit', icon: FiX },
    { keys: ['Ctrl', 'K'], description: 'Search prompts', icon: FiSearch },
    { keys: ['Ctrl', 'E'], description: 'Edit mode', icon: FiEdit },
    { keys: ['Ctrl', 'F'], description: 'Toggle favorite', icon: FiHeart },
    { keys: ['Ctrl', 'T'], description: 'Add tag', icon: FiTag },
    { keys: ['Ctrl', 'I'], description: 'AI suggestions', icon: FiZap },
    { keys: ['Ctrl', 'M'], description: 'Open templates', icon: FiFileText },
    { keys: ['Esc'], description: 'Close modals/dropdowns', icon: FiX },
    { keys: ['Ctrl', 'H'], description: 'Show/hide help', icon: FiCommand },
  ];

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Handle global shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'k':
            event.preventDefault();
            // Focus search or open search modal
            const searchInput = document.querySelector('input[placeholder*="Search"]');
            if (searchInput) {
              searchInput.focus();
            }
            break;
          case 'h':
            event.preventDefault();
            // Toggle help modal
            onClose();
            break;
        }
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiCommand className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Power up your productivity with keyboard shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortcuts.map((shortcut, index) => {
            const Icon = shortcut.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {shortcut.description}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded border">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="text-gray-400">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Use <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs">Ctrl+K</kbd> to quickly search prompts</li>
            <li>• Press <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs">Esc</kbd> to close any open modals</li>
            <li>• Use <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs">Ctrl+H</kbd> to toggle this help anytime</li>
            <li>• Shortcuts work across the entire application</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
