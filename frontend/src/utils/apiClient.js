/**
 * apiClient.js — Legacy shim
 *
 * The backend (Express/MongoDB) has been removed. This file is kept ONLY
 * because some components still import `getAuthToken` / `setAuthToken` for
 * reading the JWT from localStorage (used by the auth store).
 *
 * All actual API calls now go through Convex mutations/queries.
 * Do NOT add new API calls here.
 */

// Auth token helpers (still used by ProtectedRoute, AdminProtected, etc.)
let _authToken = null;

export const getAuthToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('authToken') || _authToken;
};

export const setAuthToken = (token) => {
  _authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authToken');
  }
};

// Stub — no backend URL needed any more
export const API_URL = '';

export default {
  API_URL,
  getAuthToken,
  setAuthToken,
};
