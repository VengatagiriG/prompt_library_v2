import React, { useState, useEffect } from 'react';
import { FiCpu, FiZap, FiTrendingUp, FiBarChart, FiRefreshCw, FiSettings, FiPlay, FiPause, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AIProviders = ({ onProviderChange, currentProvider, onOptimizePrompt, onCompareModels }) => {
  const [providers, setProviders] = useState([
    {
      id: 'openai',
      name: 'OpenAI GPT-4',
      model: 'gpt-4',
      description: 'Most capable model with advanced reasoning',
      cost: '$0.03/1K tokens',
      speed: 'Fast',
      quality: 'Excellent',
      status: 'active',
      icon: '🤖',
      color: 'green'
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      model: 'claude-3',
      description: 'Balanced performance with safety focus',
      cost: '$0.008/1K tokens',
      speed: 'Very Fast',
      quality: 'Excellent',
      status: 'active',
      icon: '🧠',
      color: 'blue'
    },
    {
      id: 'google',
      name: 'Google Gemini',
      model: 'gemini-pro',
      description: 'Google\'s latest multimodal model',
      cost: '$0.001/1K tokens',
      speed: 'Fast',
      quality: 'Good',
      status: 'active',
      icon: '🔍',
      color: 'orange'
    },
    {
      id: 'local',
      name: 'Local LLM',
      model: 'llama-2-7b',
      description: 'Run models locally for privacy',
      cost: 'Free',
      speed: 'Medium',
      quality: 'Good',
      status: 'inactive',
      icon: '💻',
      color: 'gray'
    }
  ]);

  const [selectedProvider, setSelectedProvider] = useState(currentProvider || 'openai');
  const [aiAnalytics, setAiAnalytics] = useState({
    totalRequests: 0,
    totalCost: 0,
    averageResponseTime: 0,
    favoriteModel: 'GPT-4',
    usageByModel: {}
  });

  const [optimizationSuggestions, setOptimizationSuggestions] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Reduce Prompt Length',
      description: 'Your prompt is quite long. Consider shortening it to reduce costs and improve response time.',
      impact: 'High',
      savings: '$0.02 per request'
    },
    {
      id: 2,
      type: 'info',
      title: 'Add Context',
      description: 'Including more specific context could improve the quality of responses.',
      impact: 'Medium',
      improvement: '15% better results'
    },
    {
      id: 3,
      type: 'success',
      title: 'Good Structure',
      description: 'Your prompt structure follows best practices.',
      impact: 'None',
      status: 'Already optimized'
    }
  ]);

  useEffect(() => {
    // Load AI analytics from localStorage
    const savedAnalytics = localStorage.getItem('aiAnalytics');
    if (savedAnalytics) {
      setAiAnalytics(JSON.parse(savedAnalytics));
    }
  }, []);

  const handleProviderSelect = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider && provider.status === 'active') {
      setSelectedProvider(providerId);
      onProviderChange(provider);
      toast.success(`Switched to ${provider.name}`);
    } else {
      toast.error('This AI provider is not available');
    }
  };

  const handleOptimizePrompt = () => {
    onOptimizePrompt(selectedProvider);
    toast.success('Prompt optimization suggestions generated');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'inactive': return 'text-gray-600 dark:text-gray-400';
      case 'maintenance': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Excellent': return 'text-green-600 dark:text-green-400';
      case 'Good': return 'text-blue-600 dark:text-blue-400';
      case 'Fair': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiCpu className="h-6 w-6 text-purple-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Provider Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Switch between AI providers and optimize your prompts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Providers */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Available AI Providers
            </h3>
            <div className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedProvider === provider.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  } ${provider.status !== 'active' ? 'opacity-50' : ''}`}
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {provider.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                    <div className={`text-xs ${getStatusColor(provider.status)}`}>
                      {provider.status === 'active' ? '✓ Active' : '○ Inactive'}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Cost</p>
                      <p className="font-medium text-gray-900 dark:text-white">{provider.cost}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Speed</p>
                      <p className="font-medium text-gray-900 dark:text-white">{provider.speed}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Quality</p>
                      <p className={`font-medium ${getQualityColor(provider.quality)}`}>
                        {provider.quality}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analytics */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              AI Usage Analytics
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {aiAnalytics.totalRequests}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    ${aiAnalytics.totalCost.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {aiAnalytics.averageResponseTime}ms
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Favorite Model</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {aiAnalytics.favoriteModel}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  🚀 Optimization Opportunities
                </h4>
                <div className="space-y-2">
                  {optimizationSuggestions.slice(0, 2).map((suggestion) => (
                    <div key={suggestion.id} className="flex items-start space-x-2 text-sm">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <div>
                        <p className="text-blue-900 dark:text-blue-100 font-medium">
                          {suggestion.title}
                        </p>
                        <p className="text-blue-800 dark:text-blue-200">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOptimizePrompt}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FiZap className="h-4 w-4" />
              <span>Optimize Current Prompt</span>
            </button>

            <button
              onClick={onCompareModels}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <FiBarChart className="h-4 w-4" />
              <span>Compare Models</span>
            </button>

            <button
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiSettings className="h-4 w-4" />
              <span>AI Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProviders;
