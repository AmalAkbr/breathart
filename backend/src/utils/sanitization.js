// backend/src/utils/sanitization.js
/**
 * Input Sanitization Utilities
 * Prevent XSS, injection attacks, and malicious input
 */

import validator from 'validator';

/**
 * Sanitize string input
 * - Remove HTML tags
 * - Escape special characters
 * - Trim whitespace
 */
export const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return validator
    .trim(input)
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 1000); // Max 1000 chars
};

/**
 * Sanitize email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  const trimmed = validator.trim(email.toLowerCase());
  return validator.isEmail(trimmed) ? trimmed : '';
};

/**
 * Sanitize URL
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  try {
    const trimmed = validator.trim(url);
    // Only allow http/https
    if (!trimmed.match(/^https?:\/\//i)) {
      return '';
    }
    // Validate it's a valid URL
    return validator.isURL(trimmed) ? trimmed : '';
  } catch (e) {
    return '';
  }
};

/**
 * Sanitize object input (for form data and request bodies)
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key (prevent __proto__, constructor, etc.)
    if (key.startsWith('__') || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[key] = Number.isFinite(value) ? value : null;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    }
  }

  return sanitized;
};

/**
 * Sanitize regex pattern to prevent ReDoS and injection
 */
export const sanitizeRegexPattern = (pattern) => {
  if (!pattern || typeof pattern !== 'string') {
    return '';
  }

  // Escape special regex characters
  return validator.escape(pattern);
};

/**
 * Escape HTML entities (for safe output)
 */
export const escapeHTML = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return validator.escape(text);
};

/**
 * Validate and sanitize file name
 */
export const sanitizeFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') {
    return '';
  }

  // Remove path traversal attempts
  let safe = fileName
    .replace(/\.\./g, '') // Remove ..
    .replace(/[\/\\]/g, '') // Remove slashes
    .substring(0, 255); // Max 255 chars

  // Remove special characters except . and -
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_');

  return safe;
};

/**
 * Validate file MIME type
 */
export const validateMimeType = (mimeType, allowedTypes) => {
  if (!mimeType || !Array.isArray(allowedTypes)) {
    return false;
  }

  // Check for exact match
  if (allowedTypes.includes(mimeType)) {
    return true;
  }

  // Check for wildcard match (e.g., image/*)
  const [mainType] = mimeType.split('/');
  return allowedTypes.some(type => type === `${mainType}/*`);
};

/**
 * Validate file extension
 */
export const validateFileExtension = (fileName, allowedExtensions) => {
  if (!fileName || !Array.isArray(allowedExtensions)) {
    return false;
  }

  const ext = fileName.split('.').pop().toLowerCase();
  return allowedExtensions.includes(ext);
};

/**
 * Check for suspicious patterns in input
 */
export const hasSuspiciousPatterns = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    /<script/i, // Script tags
    /javascript:/i, // JS protocol
    /on\w+\s*=/i, // Event handlers
    /union\s+select/i, // SQL injection
    /exec\s*\(/i, // Command execution
    /eval\s*\(/i, // Eval
    /base64_decode/i, // Base64 decode
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
};
