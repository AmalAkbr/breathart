/**
 * Frontend Validation Utilities
 * Client-side validation before sending data to backend
 * Backend performs secondary validation (always trust backend)
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must be less than 128 characters' };
  }

  // Check for at least one uppercase, one lowercase, and one number
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate full name
 * @param {string} fullName - Full name to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim() === '') {
    return { isValid: false, error: 'Full name is required' };
  }

  const trimmedName = fullName.trim();
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Full name must be less than 100 characters' };
  }

  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    return { isValid: false, error: 'Full name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate that two passwords match
 * @param {string} password - First password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate verification token format
 * @param {string} token - Token to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateToken = (token) => {
  if (!token || token.trim() === '') {
    return { isValid: false, error: 'Token is required' };
  }

  if (token.trim().length < 10) {
    return { isValid: false, error: 'Invalid token format' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate login form
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateLoginForm = (email, password) => {
  const errors = {};

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  // For login, we just check password exists (not full strength)
  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate register form
 * @param {string} fullName - User full name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateRegisterForm = (fullName, email, password, confirmPassword) => {
  const errors = {};

  const nameValidation = validateFullName(fullName);
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.error;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  const matchValidation = validatePasswordMatch(password, confirmPassword);
  if (!matchValidation.isValid) {
    errors.confirmPassword = matchValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate forgot password form
 * @param {string} email - User email
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateForgotPasswordForm = (email) => {
  const errors = {};

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate reset password form
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateResetPasswordForm = (token, password, confirmPassword) => {
  const errors = {};

  const tokenValidation = validateToken(token);
  if (!tokenValidation.isValid) {
    errors.token = tokenValidation.error;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  const matchValidation = validatePasswordMatch(password, confirmPassword);
  if (!matchValidation.isValid) {
    errors.confirmPassword = matchValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePasswordMatch,
  validateToken,
  validateLoginForm,
  validateRegisterForm,
  validateForgotPasswordForm,
  validateResetPasswordForm
};
