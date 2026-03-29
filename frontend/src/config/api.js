/**
 * API Configuration
 * 
 * This file centralizes all API endpoints.
 * Change VITE_API_URL in .env.local to update the base URL globally.
 * 
 * Environment Variables:
 * - VITE_API_URL: Base API URL (e.g., http://localhost:8080/api or https://api.example.com)
 * 
 * Usage:
 * import { ENDPOINTS } from '@/config/api'
 * import { API_URL } from '@/utils/apiClient'
 * 
 * const response = await fetch(ENDPOINTS.ADMIN_LOGIN, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email, password })
 * })
 */

import { API_URL } from '../utils/apiClient';

export const ENDPOINTS = {
  // Authentication Endpoints
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    SIGNUP: `${API_URL}/auth/signup`,
    LOGOUT: `${API_URL}/auth/logout`,
    SESSION: `${API_URL}/auth/session`,
    REFRESH: `${API_URL}/auth/refresh`,
    PROFILE: `${API_URL}/auth/profile`,
    ADMIN_LOGIN: `${API_URL}/auth/admin-login`,
  },
  
  // Upload Endpoints
  UPLOAD: {
    VIDEO: `${API_URL}/upload/video`,
    IMAGE: `${API_URL}/upload/image`,
  },
  
  // Admin Endpoints
  ADMIN: {
    EXAMS: `${API_URL}/admin/exams`,
    STUDENTS: `${API_URL}/admin/students`,
    SEND_INVITATIONS: (examId) => `${API_URL}/admin/exams/${examId}/send-invitations`,
    ADD_PARTICIPANTS: (examId) => `${API_URL}/admin/exams/${examId}/add-participants`,
    VIDEOS: `${API_URL}/admin/videos`,
  },
  
  // Video Endpoints
  VIDEOS: {
    LIST: `${API_URL}/videos`,
    GET: (id) => `${API_URL}/videos/${id}`,
  },
};

/**
 * Get the API base URL
 * Useful for debugging or displaying in logs
 */
export const getAPIBase = () => API_URL;

/**
 * Helper function to construct API URLs with query parameters
 * @param {string} endpoint - The endpoint path
 * @param {object} params - Query parameters
 * @returns {string} Full URL with query string
 */
export const buildURL = (endpoint, params = {}) => {
  const url = new URL(endpoint);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};

export default ENDPOINTS;
