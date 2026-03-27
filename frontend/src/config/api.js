/**
 * API Configuration
 * 
 * This file centralizes all API endpoints.
 * Change VITE_API_URL in .env.local to update the base URL globally.
 * 
 * Environment Variables:
 * - VITE_API_URL: Base API URL (e.g., http://localhost:3000/api or https://api.example.com)
 * 
 * Usage:
 * import { ENDPOINTS } from '@/config/api'
 * 
 * const response = await fetch(ENDPOINTS.ADMIN_LOGIN, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email, password })
 * })
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ENDPOINTS = {
  // Authentication Endpoints
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    SIGNUP: `${API_BASE}/auth/signup`,
    LOGOUT: `${API_BASE}/auth/logout`,
    SESSION: `${API_BASE}/auth/session`,
    REFRESH: `${API_BASE}/auth/refresh`,
    PROFILE: `${API_BASE}/auth/profile`,
    ADMIN_LOGIN: `${API_BASE}/auth/admin-login`,
  },
  
  // Upload Endpoints
  UPLOAD: {
    VIDEO: `${API_BASE}/upload/video`,
    IMAGE: `${API_BASE}/upload/image`,
  },
  
  // Admin Endpoints
  ADMIN: {
    EXAMS: `${API_BASE}/admin/exams`,
    STUDENTS: `${API_BASE}/admin/students`,
    SEND_INVITATIONS: (examId) => `${API_BASE}/admin/exams/${examId}/send-invitations`,
    ADD_PARTICIPANTS: (examId) => `${API_BASE}/admin/exams/${examId}/add-participants`,
    VIDEOS: `${API_BASE}/admin/videos`,
  },
  
  // Video Endpoints
  VIDEOS: {
    LIST: `${API_BASE}/videos`,
    GET: (id) => `${API_BASE}/videos/${id}`,
  },
};

/**
 * Get the API base URL
 * Useful for debugging or displaying in logs
 */
export const getAPIBase = () => API_BASE;

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
