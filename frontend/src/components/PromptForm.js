import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiPlus, FiZap, FiEdit3, FiSave, FiX, FiMinus, FiFileText, FiCpu, FiCommand, FiShield } from 'react-icons/fi';
import PromptTemplates from './PromptTemplates';
import KeyboardShortcuts from './KeyboardShortcuts';
import AIGuide from './AIGuide';
import AISuggestions from './AISuggestions';
import AIProviders from './AIProviders';
import PromptVersionHistory from './PromptVersionHistory';
import PromptImprovement from './PromptImprovement';
import { promptsAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { sanitizeContent, checkContentSafety, validatePrompt } from '../utils/validation';

const PromptForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    is_favorite: false
  });
  const [tagInput, setTagInput] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [createVersion] = useState(true);
  const [changeSummary] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [guardrailsEnabled, setGuardrailsEnabled] = useState(true);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showPromptImprovement, setShowPromptImprovement] = useState(false);
  const [showAIProviders, setShowAIProviders] = useState(false);
  const [currentAIProvider, setCurrentAIProvider] = useState({
    id: 'openai',
    name: 'OpenAI GPT-4',
    model: 'gpt-4'
  });
  const [showAIGuide, setShowAIGuide] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchPrompt();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getCategories();
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrompt = async () => {
    try {
      const response = await promptsAPI.getPrompt(id);
      const promptData = {
        title: response.data.title,
        description: response.data.description,
        content: response.data.content,
        category: response.data.category,
        tags: response.data.tags || [],
        is_favorite: response.data.is_favorite
      };
      setFormData(promptData);
      setOriginalFormData(promptData); // Store original data for comparison
    } catch (error) {
      console.error('Error fetching prompt:', error);
      toast.error('Failed to load prompt');
    }
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Handle Ctrl+S for save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (!loading && !isValidating) {
          document.getElementById('prompt-form')?.requestSubmit();
        }
      }
      // Handle Ctrl+H for help
      else if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
        event.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      // Handle Ctrl+M for templates
      else if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        setShowTemplates(!showTemplates);
      }
      // Handle Ctrl+F for favorites
      else if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        setFormData(prev => ({ ...prev, is_favorite: !prev.is_favorite }));
      }
      // Handle Ctrl+G for AI guide
      else if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        setShowAIGuide(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loading, isValidating, showKeyboardShortcuts, showTemplates, showAISuggestions]);

  const hasChanges = () => {
    if (!originalFormData) return true;

    return (
      formData.title !== originalFormData.title ||
      formData.description !== originalFormData.description ||
      formData.content !== originalFormData.content ||
      formData.category !== originalFormData.category ||
      formData.is_favorite !== originalFormData.is_favorite ||
      JSON.stringify(formData.tags) !== JSON.stringify(originalFormData.tags)
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Validate field in real-time for better UX
    if (name === 'content' && newValue.length > 5000) {
      // Show warning for very long content
      setFieldErrors(prev => ({
        ...prev,
        content: 'Content is getting quite long. Consider if this could be shortened.'
      }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if anything changed when editing
    const hasDataChanged = isEditing && hasChanges();

    // If editing and nothing changed, just show success
    if (isEditing && !hasDataChanged) {
      toast.success('No changes detected - prompt remains unchanged');
      navigate('/prompts', { state: { refresh: true } });
      return;
    }

    // Sanitize content before validation
    const sanitizedFormData = {
      ...formData,
      content: sanitizeContent(formData.content),
      title: sanitizeContent(formData.title),
      description: sanitizeContent(formData.description),
    };

    // Comprehensive validation
    setIsValidating(true);
    const validation = validatePrompt(sanitizedFormData);

    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors);
      setIsValidating(false);

      // Show first error as toast
      const firstError = Object.values(validation.fieldErrors).find(field => !field.isValid);
      if (firstError) {
        toast.error(firstError.errors[0]);
      }
      return;
    }

    if (!checkContentSafety(sanitizedFormData.content)) {
      setFieldErrors({
        content: {
          isValid: false,
          errors: ['Content contains potentially unsafe patterns']
        }
      });
      setIsValidating(false);
      toast.error('Content contains potentially unsafe patterns');
      return;
    }

    // Guardrails validation (only if enabled)
    if (guardrailsEnabled) {
      try {
        const guardrailsResult = await promptsAPI.validateWithGuardrails({
          content: sanitizedFormData.content,
          content_type: 'prompt'
        });

        if (!guardrailsResult.data.validation_result.valid) {
          setFieldErrors({
            content: {
              isValid: false,
              errors: [`Guardrails violation: ${guardrailsResult.data.validation_result.message}`]
            }
          });
          setIsValidating(false);
          toast.error('Content violates guardrails policies');
          return;
        }
      } catch (error) {
        console.error('Guardrails validation error:', error);
        // Don't block submission if guardrails service is unavailable
        toast.warning('Guardrails validation unavailable, proceeding with basic validation');
      }
    }

    setLoading(true);
    setFieldErrors({}); // Clear any existing errors

    try {
      const submitData = {
        ...sanitizedFormData,
        create_version: hasDataChanged ? true : createVersion, // Force new version if changes detected
        change_summary: hasDataChanged ? changeSummary || 'Updated prompt content' : changeSummary
      };

      if (isEditing) {
        await promptsAPI.updatePrompt(id, submitData);
        toast.success(hasDataChanged ? 'Prompt updated successfully!' : 'Prompt saved successfully!');
      } else {
        await promptsAPI.createPrompt(submitData);
        toast.success('Prompt created successfully!');
      }
      navigate('/prompts', { state: { refresh: true } });
    } catch (error) {
      console.error('Error saving prompt:', error);

      // Handle specific validation errors from backend
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const formattedErrors = {};

        Object.keys(backendErrors).forEach(field => {
          formattedErrors[field] = {
            isValid: false,
            errors: Array.isArray(backendErrors[field])
              ? backendErrors[field]
              : [backendErrors[field]]
          };
        });

        setFieldErrors(formattedErrors);
      }

      toast.error(isEditing ? 'Failed to update prompt' : 'Failed to create prompt');
    } finally {
      setLoading(false);
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    navigate('/prompts', { state: { refresh: true } });
  };

  const handleAIProviderChange = (provider) => {
    setCurrentAIProvider(provider);
    toast.success(`AI Provider changed to ${provider.name}`);
  };

  const handleOptimizePrompt = (providerId) => {
    toast.success('Prompt optimization suggestions generated based on selected AI model');
    // This would trigger AI-based optimization suggestions
  };

  const handleCompareModels = () => {
    toast.success('AI model comparison feature - Compare different models side by side');
    // This would open a comparison interface
  };

  const contextForAI = formData.title + ' ' + formData.description + ' ' + formData.content;

  const handleSelectAISuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      content: suggestion
    }));
  };

  const handleApplyPromptImprovement = (improvedPrompt) => {
    setFormData(prev => ({
      ...prev,
      content: improvedPrompt
    }));
  };

  const handleAIGuide = async () => {
    // Connect to local Ollama model for AI guidance
    try {
      // This would connect to local Ollama API
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2', // or your preferred Ollama model
          prompt: `Help improve this prompt: ${formData.content}. Provide suggestions for better structure, clarity, and effectiveness.`,
          stream: false
        })
      });

      const data = await response.json();
      if (data.response) {
        setFormData(prev => ({
          ...prev,
          content: data.response
        }));
        toast.success('AI Guide applied successfully!');
      }
    } catch (error) {
      console.error('Error connecting to Ollama:', error);
      toast.error('Failed to connect to AI Guide. Make sure Ollama is running locally.');
    }
  };

  const handleShowAIGuide = () => {
    setShowAIGuide(!showAIGuide);
  };

  const handleSelectTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      title: template?.title && !template.title.includes('{') ? template.title : prev.title,
      description: template?.description && !template.description.includes('{') ? template.description : prev.description,
      content: template?.template || prev.content,
      category: prev.category
    }));
    setShowTemplates(false);
  };



  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShowAIGuide}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                    title="AI Guide (Local Ollama)"
                  >
                    <FiCpu className="h-4 w-4" />
                    <span>{showAIGuide ? 'Hide AI Guide' : 'AI Guide'}</span>
                  </button>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                  >
                    <FiFileText className="h-4 w-4" />
                    <span>{showTemplates ? 'Hide Templates' : 'Templates'}</span>
                  </button>
                  <button
                    onClick={() => setShowAIProviders(!showAIProviders)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                    title="AI Providers & Settings"
                  >
                    <FiCpu className="h-4 w-4" />
                    <span>AI: {currentAIProvider.name}</span>
                  </button>
                  <button
                    onClick={() => setShowAISuggestions(!showAISuggestions)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                  >
                    <FiZap className="h-4 w-4" />
                    <span>{showAISuggestions ? 'Hide AI' : 'AI Suggestions'}</span>
                  </button>
                  <button
                    onClick={() => setShowPromptImprovement(!showPromptImprovement)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <FiEdit3 className="h-4 w-4" />
                    <span>{showPromptImprovement ? 'Hide Improvement' : 'Improve Prompt'}</span>
                  </button>
                  <button
                    onClick={() => setGuardrailsEnabled(!guardrailsEnabled)}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      guardrailsEnabled
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiShield className="h-4 w-4" />
                    <span>{guardrailsEnabled ? 'Guardrails ON' : 'Guardrails OFF'}</span>
                  </button>
                  <button
                    onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Keyboard Shortcuts (Ctrl+H)"
                  >
                    <FiCommand className="h-4 w-4" />
                    <span>Help</span>
                  </button>
                </div>
              </div>
            </div>

            <form id="prompt-form" onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    fieldErrors.title ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter prompt title"
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.title.errors[0]}
                  </p>
                )}
              </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the prompt"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">
                {loading ? 'Loading categories...' : 'Select a category'}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && !loading && (
              <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                No categories available.{' '}
                <Link
                  to="/categories/new"
                  className="underline hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  Create your first category
                </Link>
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={12}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="Enter your prompt content here..."
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <FiMinus className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Favorite */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_favorite"
              name="is_favorite"
              checked={formData.is_favorite}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_favorite" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Add to favorites
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiX className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              <span>
                {loading
                  ? (isEditing ? 'Updating...' : 'Creating...')
                  : (isEditing ? 'Update' : 'Create') + ' Prompt'
                }
              </span>
            </button>
          </div>
            </form>
          </div>
        </div>

        {/* AI Guide */}
        {showAIGuide && (
          <div className="mt-6">
            <AIGuide
              onApplyGuidance={(improvedPrompt) => {
                setFormData(prev => ({
                  ...prev,
                  content: improvedPrompt
                }));
              }}
              currentPrompt={formData.content}
              context={contextForAI}
            />
          </div>
        )}

        {/* Prompt Templates */}
        {showTemplates && (
          <div className="mt-6">
            <PromptTemplates
              onSelectTemplate={handleSelectTemplate}
              onClose={() => setShowTemplates(false)}
            />
          </div>
        )}

        {/* AI Providers */}
        {showAIProviders && (
          <div className="mt-6">
            <AIProviders
              onProviderChange={handleAIProviderChange}
              currentProvider={currentAIProvider}
              onOptimizePrompt={handleOptimizePrompt}
              onCompareModels={handleCompareModels}
            />
          </div>
        )}

        {/* AI Suggestions */}
        {showAISuggestions && (
          <div className="mt-6">
            <AISuggestions
              onSelectSuggestion={handleSelectAISuggestion}
              context={contextForAI}
              suggestionType="general"
            />
          </div>
        )}

        {/* Keyboard Shortcuts */}
        {showKeyboardShortcuts && (
          <div className="mt-6">
            <KeyboardShortcuts
              onClose={() => setShowKeyboardShortcuts(false)}
            />
          </div>
        )}

        {/* Prompt Improvement */}
        {showPromptImprovement && formData.content && (
          <div className="mt-6">
            <PromptImprovement
              currentPrompt={formData.content}
              onApplyImprovement={handleApplyPromptImprovement}
              context={contextForAI}
            />
          </div>
        )}

        {/* Version History Sidebar */}
        {isEditing && showVersionHistory && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Version History
                </h2>
              </div>
              <div className="p-6">
                <PromptVersionHistory
                  promptId={id}
                  currentVersion={formData.current_version || 1}
                  onVersionRestore={() => {
                    fetchPrompt();
                    setShowVersionHistory(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptForm;
