// backend/src/helpers/validators.js
/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate Google Form URL
 */
export const validateGoogleFormUrl = (url) => {
  return url.includes('docs.google.com/forms') && validateUrl(url);
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  return missing.length === 0 ? null : missing;
};

/**
 * Validate exam data
 */
export const validateExamData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!data.googleFormLink || !validateGoogleFormUrl(data.googleFormLink)) {
    errors.push('Valid Google Form URL is required');
  }

  return errors.length === 0 ? null : errors;
};

/**
 * Validate video upload data
 */
export const validateVideoData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim() === '') {
    errors.push('Video title is required');
  }

  if (!data.thumbnail_url || !validateUrl(data.thumbnail_url)) {
    errors.push('Valid thumbnail URL is required');
  }

  if (!data.video_url || !validateUrl(data.video_url)) {
    errors.push('Valid video URL is required');
  }

  return errors.length === 0 ? null : errors;
};

export default {
  validateEmail,
  validateUrl,
  validateGoogleFormUrl,
  validateRequiredFields,
  validateExamData,
  validateVideoData,
};
