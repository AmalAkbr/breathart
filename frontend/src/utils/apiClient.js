/**
 * Frontend API Client - MongoDB Backend
 * All HTTP requests to the backend go through this client
 * Handles authentication, error handling, and endpoint management
 */

const resolveApiUrl = () => {
  const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
  
  if (!configuredApiUrl) {
    throw new Error(
      '❌ VITE_API_URL environment variable is not set. ' +
      'Set it in frontend/.env.local before building.\n' +
      'Example: VITE_API_URL=http://localhost:8080/api'
    );
  }

  return configuredApiUrl.replace(/\/$/, '');
};

export const API_URL = resolveApiUrl();

let authToken = null;

/**
 * Get auth token from localStorage or memory
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token') || authToken;
};

/**
 * Set auth token in localStorage and memory
 */
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Make authenticated API call
 */
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include HTTP-only cookies in requests
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const retryAfterHeader = response.headers.get('retry-after');
      const rateLimitResetHeader = response.headers.get('ratelimit-reset');
      const retryAfterSec = Number(error.retryAfterSec)
        || Number(retryAfterHeader)
        || Number(rateLimitResetHeader)
        || null;

      let errorMessage = error.message || error.error || `HTTP ${response.status}`;
      if (response.status === 429 && !error.message) {
        errorMessage = retryAfterSec
          ? `Too many requests. Try again in ${retryAfterSec} seconds.`
          : 'Too many requests. Please try again later.';
      }

      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = error;
      err.retryAfterSec = retryAfterSec;
      throw err;
    }

    return await response.json();
  } catch (err) {
    console.error('API Error:', err.message);
    throw err;
  }
};

// ===== AUTH ENDPOINTS =====

export const authAPI = {
  /**
   * Sign up new user
   * Returns: { success, token, user }
   */
  signup: (fullName, email, password, confirmPassword) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, confirmPassword })
    });
  },

  /**
   * Login user
   * Returns: { success, token, user }
   */
  login: (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  /**
   * Verify email with token
   * Returns: { success, message }
   */
  verifyEmail: (email, verificationToken) => {
    return apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, verificationToken })
    });
  },

  /**
   * Resend verification email
   * Returns: { success, message }
   */
  resendVerification: (email) => {
    return apiCall('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  /**
   * Request password reset
   * Returns: { success, message }
   */
  forgotPassword: (email) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  /**
   * Reset password with token
   * Returns: { success, message }
   */
  resetPassword: (token, newPassword, confirmPassword) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword, confirmPassword })
    });
  },

  /**
   * Get current user profile (protected)
   * Returns: { success, user }
   */
  getProfile: () => {
    return apiCall('/auth/profile');
  },

  /**
   * Get exam notifications for logged-in user (protected)
   * Returns: { success, data: [] }
   */
  getExamNotifications: () => {
    return apiCall('/auth/exam-notifications');
  },

  /**
   * Logout user (protected)
   * Returns: { success, message }
   */
  logout: () => {
    setAuthToken(null);
    return apiCall('/auth/logout', { method: 'POST' });
  }
};

// ===== VIDEO ENDPOINTS =====

export const videoAPI = {
  /**
   * Get all videos
   */
  getAll: ({ noCache = false } = {}) => {
    if (!noCache) return apiCall('/videos');

    return apiCall(`/videos?t=${Date.now()}`, {
      cache: 'no-store'
    });
  },

  /**
   * Get single video by ID
   */
  getById: (videoId) => {
    return apiCall(`/videos/${videoId}`);
  },

  /**
   * Create new video entry
   */
  create: (videoData) => {
    return apiCall('/videos', {
      method: 'POST',
      body: JSON.stringify(videoData)
    });
  },

  /**
   * Update video
   */
  update: (videoId, updates) => {
    return apiCall(`/videos/${videoId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Delete video
   */
  delete: (videoId) => {
    return apiCall(`/videos/${videoId}`, { method: 'DELETE' });
  },

  /**
   * Get video count
   */
  getCount: () => {
    return apiCall('/videos/stats/count');
  }
};

// ===== UPLOAD ENDPOINTS =====

export const uploadAPI = {
  /**
   * Upload image with WebP conversion (protected)
   */
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    return fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers,
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error('Image upload failed');
      return res.json();
    });
  },

  /**
   * Upload profile image (protected)
   */
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    return fetch(`${API_URL}/upload/profile-image`, {
      method: 'POST',
      headers,
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error('Profile image upload failed');
      return res.json();
    });
  },

  /**
   * Upload course thumbnail (protected)
   */
  uploadCourseThumbnail: (file, courseId) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    formData.append('courseId', courseId);
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    return fetch(`${API_URL}/upload/course-thumbnail`, {
      method: 'POST',
      headers,
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error('Thumbnail upload failed');
      return res.json();
    });
  }
};

// ===== HEALTH CHECK =====

export const healthCheck = () => {
  return apiCall('/health')
    .catch(err => {
      console.error('❌ Backend is not running');
      throw err;
    });
};

export default {
  API_URL,
  authAPI,
  videoAPI,
  uploadAPI,
  healthCheck,
  getAuthToken,
  setAuthToken
};
