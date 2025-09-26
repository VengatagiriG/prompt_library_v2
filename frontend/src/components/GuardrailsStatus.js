import React, { useState, useEffect } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiSettings, FiRefreshCw } from 'react-icons/fi';
import { promptsAPI } from '../services/api';
import toast from 'react-hot-toast';

const GuardrailsStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGuardrailsStatus();
  }, []);

  const fetchGuardrailsStatus = async () => {
    try {
      setLoading(true);
      const response = await promptsAPI.getGuardrailsStatus();
      setStatus(response.data);
    } catch (err) {
      console.error('Error fetching guardrails status:', err);
      setError('Failed to load guardrails status');
      toast.error('Failed to load guardrails status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (available) => {
    if (available) {
      return <FiCheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <FiAlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const formatUptime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <FiRefreshCw className="h-8 w-8 text-primary-500 animate-spin" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading guardrails status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
          <FiAlertTriangle className="h-5 w-5" />
          <span>{error}</span>
          <button
            onClick={fetchGuardrailsStatus}
            className="ml-auto px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiShield className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Guardrails Status
            </h3>
          </div>
          <button
            onClick={fetchGuardrailsStatus}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiRefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {status && (
          <div className="space-y-6">
            {/* Service Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Service Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Guardrails Service</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status.service_status?.available)}
                      <span className={`text-sm font-medium ${getStatusColor(status.service_status?.available ? 'low' : 'high')}`}>
                        {status.service_status?.available ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Configuration</span>
                    <div className="flex items-center space-x-2">
                      {status.service_status?.config_exists ? (
                        <FiCheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <FiAlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm text-gray-900 dark:text-white">
                        {status.service_status?.config_exists ? 'Loaded' : 'Default'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Statistics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Configurations</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {status.active_configs || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Logs</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {status.total_logs || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Default Model</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {status.service_status?.default_model || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Models */}
            {status.service_status?.available_models && status.service_status.available_models.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Available Models</h4>
                <div className="flex flex-wrap gap-2">
                  {status.service_status.available_models.map((model, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                    >
                      {model.name || model}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration Path */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Configuration</h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Config Path:</strong> {status.service_status?.config_path || 'Not configured'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Guardrails protect your AI interactions from harmful content and jailbreak attempts.
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                <FiSettings className="h-4 w-4" />
                <span>Manage Guardrails</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuardrailsStatus;
