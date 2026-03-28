// frontend/src/utils/xssSanitizer.js
/**
 * XSS Protection Utilities
 * Prevents Cross-Site Scripting attacks by sanitizing user input
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML input to prevent XSS
 * Allows safe HTML tags, removes script tags and event handlers
 */
export const sanitizeHTML = (dirtyInput) => {
  if (!dirtyInput || typeof dirtyInput !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirtyInput, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  });
};

/**
 * Sanitize plain text (no HTML)
 * Strips all HTML tags
 */
export const sanitizeText = (dirtyInput) => {
  if (!dirtyInput || typeof dirtyInput !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirtyInput, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Escape special characters for safe rendering
 */
export const escapeSpecialChars = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'\\/]/g, (char) => escapeMap[char]);
};

/**
 * Sanitize user object (profile data)
 */
export const sanitizeUser = (user) => {
  if (!user || typeof user !== 'object') {
    return null;
  }

  return {
    _id: user._id || '',
    email: sanitizeText(user.email || ''),
    fullName: sanitizeText(user.fullName || ''),
    role: user.role === 'user' || user.role === 'admin' ? user.role : 'user',
    isAdmin: user.isAdmin === true,
    isEmailVerified: user.isEmailVerified === true,
    isActive: user.isActive !== false,
    profileImage: sanitizeText(user.profileImage || ''),
  };
};

/**
 * Sanitize exam data
 */
export const sanitizeExam = (exam) => {
  if (!exam || typeof exam !== 'object') {
    return null;
  }

  return {
    _id: exam._id || '',
    title: sanitizeText(exam.title || ''),
    description: sanitizeHTML(exam.description || ''),
    googleFormLink: sanitizeURL(exam.googleFormLink || ''),
    status: ['draft', 'published', 'closed', 'archived'].includes(exam.status) 
      ? exam.status 
      : 'draft',
    createdAt: exam.createdAt || new Date(),
    createdBy: exam.createdBy ? sanitizeText(exam.createdBy.fullName || '') : '',
  };
};

/**
 * Validate and sanitize URLs
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    // Only allow http and https
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return url;
  } catch {
    // Not a valid URL
    return '';
  }
};

/**
 * Sanitize email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email.toLowerCase() : '';
};

/**
 * React component render helper - safely render user input
 * Use this in JSX when rendering user-provided content
 * Example: <div>{renderSafeContent(user.fullName)}</div>
 */
export const renderSafeContent = (content) => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Use dangerouslySetInnerHTML with sanitized content
  // This is SAFE because DOMPurify removes all dangerous tags
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  });
};

/**
 * Check for suspicious patterns
 */
export const hasSuspiciousContent = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    /<script/i,
    /on\w+\s*=/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(input));
};

// Configure DOMPurify to be more strict in production
if (import.meta.env.PROD) {
  DOMPurify.setConfig({
    FORCE_BODY: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
}

export default {
  sanitizeHTML,
  sanitizeText,
  escapeSpecialChars,
  sanitizeUser,
  sanitizeExam,
  sanitizeURL,
  sanitizeEmail,
  renderSafeContent,
  hasSuspiciousContent,
};
