import React, { useState } from 'react';
import { FiCpu, FiRefreshCw, FiCheck, FiX, FiTarget, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AIGuide = ({ onApplyGuidance, currentPrompt, context }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [guidance, setGuidance] = useState('');
  const [applied, setApplied] = useState(false);

  const getAIGuidance = async () => {
    if (!currentPrompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsLoading(true);

    try {
      // Connect to local Ollama model
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2', // or your preferred Ollama model
          prompt: `You are an AI assistant helping to improve prompts. Analyze this prompt and provide detailed suggestions for improvement:

Prompt: "${currentPrompt}"

Context: ${context || 'General purpose'}

Please provide:
1. Analysis of the current prompt's strengths and weaknesses
2. Specific suggestions for improvement
3. A rewritten version if needed
4. Tips for better results

Format your response clearly with sections and bullet points.`,
          stream: false
        })
      });

      const data = await response.json();
      if (data.response) {
        setGuidance(data.response);
        toast.success('AI Guidance generated successfully!');
      } else {
        throw new Error('No response from AI model');
      }
    } catch (error) {
      console.error('Error connecting to Ollama:', error);
      setGuidance(`# AI Guidance Setup Required

## Unable to connect to local Ollama model

To use AI Guide, you need to:

### 1. Install Ollama
- Download from: https://ollama.ai
- Install the application

### 2. Pull a Model
Open terminal and run:
\`\`\`bash
ollama pull llama2
\`\`\`
Or try other models:
\`\`\`bash
ollama pull mistral
ollama pull codellama
\`\`\`

### 3. Start Ollama Service
\`\`\`bash
ollama serve
\`\`\`

### 4. Verify Connection
- Ollama should be running on http://localhost:11434
- You can test with: \`curl http://localhost:11434/api/tags\`

### 5. Try Again
Once Ollama is set up and running, click "Get AI Guidance" again.

**Note:** Make sure Ollama is running in the background before using this feature.`);
      toast.error('Failed to connect to AI Guide. Check setup instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (guidance) {
      // Extract the improved prompt from the guidance
      const improvedSection = guidance.split('### Improved Version')[1] ||
                             guidance.split('## Improved Version')[1] ||
                             guidance.split('Improved Version:')[1] ||
                             guidance;

      onApplyGuidance(improvedSection.trim());
      setApplied(true);
      toast.success('AI Guidance applied to prompt');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiCpu className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Guide (Local Ollama)
            </h2>
          </div>
          <button
            onClick={() => setIsLoading(false)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {/* Get Guidance Button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get AI-powered guidance for your prompt using local Ollama models
            </p>
            <button
              onClick={getAIGuidance}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <FiRefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FiTarget className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Getting Guidance...' : 'Get AI Guidance'}</span>
            </button>
          </div>

          {/* Guidance Display */}
          {guidance && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FiCheck className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      AI Guidance Generated
                    </span>
                  </div>
                  {!applied && (
                    <button
                      onClick={handleApply}
                      className="flex items-center space-x-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      <FiTarget className="h-3 w-3" />
                      <span>Apply Guidance</span>
                    </button>
                  )}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-3 rounded border">
                    {guidance}
                  </pre>
                </div>
              </div>

              {applied && (
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <FiCheck className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    AI Guidance applied to your prompt!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Setup Instructions */}
          {!guidance && !isLoading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-2">
                <FiBook className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Setup AI Guide:
                  </h4>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>1. Install Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="underline">ollama.ai</a></li>
                    <li>2. Open terminal and pull a model: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">ollama pull llama2</code></li>
                    <li>3. Start Ollama service: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">ollama serve</code></li>
                    <li>4. Verify it's running on http://localhost:11434</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <FiRefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Connecting to local Ollama model...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                This may take a few moments
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGuide;
