import React, { useState, useEffect } from 'react';
import { FiClock, FiUser, FiRotateCcw, FiDownload, FiEye } from 'react-icons/fi';
import { promptsAPI } from '../services/api';
import toast from 'react-hot-toast';

const PromptVersionHistory = ({ promptId, currentVersion, onVersionRestore }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [promptId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await promptsAPI.getPromptVersions(promptId);
      setVersions(response.data);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (versionNumber) => {
    try {
      await promptsAPI.restorePromptVersion(promptId, { version: versionNumber });
      toast.success(`Prompt restored to version ${versionNumber}`);
      onVersionRestore && onVersionRestore();
      fetchVersions(); // Refresh the list
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Failed to restore version');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getVersionDiff = (version) => {
    // This would compare the version with the current version
    // For now, just return a placeholder
    return {
      title: version.title !== 'Current Version' ? 'Title changed' : null,
      content: 'Content changes detected',
      summary: version.change_summary || 'No change summary available'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Version History
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Current Version: {currentVersion}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {versions.map((version) => {
          const diff = getVersionDiff(version);
          const isCurrentVersion = version.version_number === currentVersion;

          return (
            <div
              key={version.id}
              className={`border rounded-lg p-4 transition-colors ${
                isCurrentVersion
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCurrentVersion
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {version.version_number}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Version {version.version_number}
                      </span>
                      {isCurrentVersion && (
                        <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center">
                        <FiUser className="h-3 w-3 mr-1" />
                        {version.author_name}
                      </span>
                      <span className="flex items-center">
                        <FiClock className="h-3 w-3 mr-1" />
                        {formatDate(version.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedVersion(version);
                      setShowDiff(!showDiff);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="View changes"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>

                  {!isCurrentVersion && (
                    <button
                      onClick={() => handleRestoreVersion(version.version_number)}
                      className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      title="Restore this version"
                    >
                      <FiRotateCcw className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {version.change_summary && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Changes:</strong> {version.change_summary}
                  </p>
                </div>
              )}

              {showDiff && selectedVersion?.id === version.id && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Version Changes
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {diff.summary}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Title:</strong> {version.title}
                  </div>
                  <div>
                    <strong>Category:</strong> {version.category_name || 'None'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {versions.length === 0 && (
        <div className="text-center py-8">
          <FiClock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No version history available
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptVersionHistory;
