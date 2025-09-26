import React, { useState } from 'react';
import { FiEdit3, FiRefreshCw, FiCheck, FiArrowRight, FiTarget } from 'react-icons/fi';
import { promptsAPI } from '../services/api';
import toast from 'react-hot-toast';

const PromptImprovement = ({ currentPrompt, onApplyImprovement, context = '' }) => {
  const [improvedPrompt, setImprovedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [improvementType, setImprovementType] = useState('clarity');
  const [applied, setApplied] = useState(false);

  const improvementTypes = [
    { value: 'clarity', label: 'Clarity', description: 'Make it clearer and more specific' },
    { value: 'creativity', label: 'Creativity', description: 'Make it more creative and engaging' },
    { value: 'specificity', label: 'Specificity', description: 'Make it more detailed and specific' },
    { value: 'conciseness', label: 'Conciseness', description: 'Make it more concise while retaining meaning' },
    { value: 'structure', label: 'Structure', description: 'Improve the structure and flow' }
  ];

  const improvePrompt = async () => {
    if (!currentPrompt.trim()) {
      toast.error('Please provide a prompt to improve');
      return;
    }

    setLoading(true);
    setError(null);
    setImprovedPrompt('');

    try {
      // 1) Validate current prompt with guardrails (pre-check)
      try {
        const preCheck = await promptsAPI.validateWithGuardrails({
          content: currentPrompt,
          content_type: 'prompt'
        });
        if (!preCheck.data?.validation_result?.valid) {
          const msg = preCheck.data?.validation_result?.message || 'Guardrails check failed for input prompt';
          setError(msg);
          toast.error('Guardrails blocked the input prompt');
          return;
        }
      } catch (grErr) {
        // If the service errors, surface a friendly message but stop the flow
        setError('Guardrails validation failed for input');
        toast.error('Guardrails validation failed for input');
        return;
      }

      const response = await promptsAPI.improvePrompt({
        prompt: currentPrompt,
        improvement_type: improvementType,
        context: context
      });

      if (response.data.improved_prompt) {
        const candidate = response.data.improved_prompt;

        // 2) Validate improved result with guardrails (post-check)
        try {
          const postCheck = await promptsAPI.validateWithGuardrails({
            content: candidate,
            content_type: 'prompt'
          });
          if (!postCheck.data?.validation_result?.valid) {
            const msg = postCheck.data?.validation_result?.message || 'Guardrails check failed for improved prompt';
            setError(msg);
            toast.error('Guardrails blocked the improved prompt');
            return;
          }
        } catch (grErr) {
          setError('Guardrails validation failed for improved prompt');
          toast.error('Guardrails validation failed for improved prompt');
          return;
        }

        setImprovedPrompt(candidate);
        toast.success('Prompt improved successfully');
      } else {
        setError('No improvement generated');
      }
    } catch (err) {
      console.error('Error improving prompt:', err);
      setError(err.response?.data?.error || 'Failed to improve prompt');
      toast.error('Failed to improve prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyImprovement = () => {
    if (improvedPrompt) {
      onApplyImprovement(improvedPrompt);
      setApplied(true);
      toast.success('Improvement applied to prompt');
    }
  };

  const handleCopyImproved = () => {
    navigator.clipboard.writeText(improvedPrompt);
    toast.success('Improved prompt copied to clipboard');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiEdit3 className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Prompt Improvement
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={improvementType}
              onChange={(e) => setImprovementType(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {improvementTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <button
              onClick={improvePrompt}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 min-w-fit"
            >
              {loading ? (
                <FiRefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FiTarget className="h-4 w-4" />
              )}
              <span>{loading ? 'Improving...' : 'Improve'}</span>
            </button>
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <strong>Current:</strong> {currentPrompt.length > 80 ? `${currentPrompt.substring(0, 80)}...` : currentPrompt}
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {improvedPrompt && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FiCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Improved Version ({improvementTypes.find(t => t.value === improvementType)?.label})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyImproved}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy improved prompt"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  {!applied && (
                    <button
                      onClick={handleApplyImprovement}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      <FiArrowRight className="h-3 w-3" />
                      <span>Apply</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                {improvedPrompt}
              </p>
            </div>

            {applied && (
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <FiCheck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Improvement applied to your prompt!
                </p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <FiRefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Improving your prompt...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              This may take a few moments
            </p>
          </div>
        )}

        {!improvedPrompt && !loading && !error && (
          <div className="text-center py-8">
            <FiEdit3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              No improvements generated yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Select an improvement type and click "Improve" to enhance your prompt
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptImprovement;
