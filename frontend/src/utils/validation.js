/**
 * Validation utilities for the Prompt Library application
 */

// Content validation rules
export const VALIDATION_RULES = {
  title: {
    minLength: 3,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()[\]{}'"`]+$/,
    required: true
  },
  description: {
    maxLength: 1000,
    required: false
  },
  content: {
    minLength: 10,
    maxLength: 10000,
    required: true
  },
  category: {
    required: true
  },
  tags: {
    maxItems: 10,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\-_]+$/,
    required: false
  }
};

/**
 * Validate a single field against its rules
 */
export const validateField = (fieldName, value, rules = VALIDATION_RULES[fieldName]) => {
  if (!rules) return { isValid: true, error: null };

  const errors = [];

  // Required validation
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(`${fieldName} is required`);
  }

  // Skip other validations if field is empty and not required
  if (!value || value.toString().trim() === '') {
    return { isValid: errors.length === 0, errors };
  }

  // Min length validation
  if (rules.minLength && value.toString().length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
  }

  // Max length validation
  if (rules.maxLength && value.toString().length > rules.maxLength) {
    errors.push(`${fieldName} must not exceed ${rules.maxLength} characters`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value.toString())) {
    errors.push(`${fieldName} contains invalid characters`);
  }

  // Array-specific validations
  if (Array.isArray(value)) {
    if (rules.maxItems && value.length > rules.maxItems) {
      errors.push(`${fieldName} can have at most ${rules.maxItems} items`);
    }

    if (rules.maxLength && value.some(item => item.length > rules.maxLength)) {
      errors.push(`Each ${fieldName} item must not exceed ${rules.maxLength} characters`);
    }

    if (rules.pattern && value.some(item => !rules.pattern.test(item))) {
      errors.push(`Each ${fieldName} item contains invalid characters`);
    }
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate an entire form
 */
export const validateForm = (formData) => {
  const validationResults = {};
  let isFormValid = true;

  Object.keys(VALIDATION_RULES).forEach(fieldName => {
    const fieldValue = formData[fieldName];
    const result = validateField(fieldName, fieldValue);
    validationResults[fieldName] = result;

    if (!result.isValid) {
      isFormValid = false;
    }
  });

  return { isValid: isFormValid, fieldErrors: validationResults };
};

/**
 * Sanitize content for security
 */
export const sanitizeContent = (content) => {
  if (!content) return '';

  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Check if content contains potentially harmful patterns
 */
export const checkContentSafety = (content) => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
    /eval\(/i,
    /document\.cookie/i,
    /window\.location/i,
    /alert\(/i,
    /confirm\(/i,
    /prompt\(/i
  ];

  return dangerousPatterns.every(pattern => !pattern.test(content));
};

/**
 * Validate prompt-specific rules
 */
export const validatePrompt = (promptData) => {
  const baseValidation = validateForm(promptData);
  const additionalErrors = {};

  // Check for prompt injection patterns
  const injectionPatterns = [
    /system prompt/i,
    /ignore previous/i,
    /override/i,
    /bypass/i,
    /admin mode/i
  ];

  if (injectionPatterns.some(pattern => pattern.test(promptData.content || ''))) {
    additionalErrors.content = {
      isValid: false,
      errors: ['Content contains potentially unsafe patterns']
    };
  }

  // Check for excessive repetition
  const words = (promptData.content || '').split(/\s+/);
  const wordCount = words.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const repetitionRatio = wordCount > 0 ? (wordCount - uniqueWords.size) / wordCount : 0;

  if (repetitionRatio > 0.8) {
    additionalErrors.content = {
      isValid: false,
      errors: ['Content appears to contain excessive repetition']
    };
  }

  return {
    isValid: baseValidation.isValid && Object.keys(additionalErrors).length === 0,
    fieldErrors: { ...baseValidation.fieldErrors, ...additionalErrors }
  };
};
