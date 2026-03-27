// Error and Success Messages
export const MESSAGES = {
  // Success Messages
  SUCCESS: {
    EXAM_CREATED: 'Exam created successfully',
    EXAM_UPDATED: 'Exam updated successfully',
    EXAM_DELETED: 'Exam deleted successfully',
    PARTICIPANTS_ADDED: 'Participants added successfully',
    INVITATIONS_SENT: 'Exam invitations sent successfully',
    VIDEO_UPLOADED: 'Video uploaded successfully',
    VIDEO_DELETED: 'Video deleted successfully',
    AUTH_SUCCESS: 'Authentication successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
  },

  // Error Messages
  ERROR: {
    // Authentication Errors
    MISSING_AUTH_HEADER: 'Missing or invalid authorization header',
    INVALID_TOKEN: 'Invalid or expired token',
    NOT_ADMIN: 'User is not an admin',
    NOT_AUTHENTICATED: 'Not authenticated. Please login first',
    
    // Validation Errors
    REQUIRED_FIELD_MISSING: (field) => `${field} is required`,
    INVALID_URL: (field) => `Invalid ${field} URL format`,
    INVALID_EMAIL: 'Invalid email format',
    INVALID_EXAM_ID: 'Invalid exam ID',
    INVALID_STUDENT_IDS: 'Student IDs must be a non-empty array',
    
    // Exam Errors
    EXAM_NOT_FOUND: 'Exam not found',
    EXAM_ALREADY_EXISTS: 'Exam with this title already exists',
    INVALID_EXAM_STATUS: 'Invalid exam status',
    NO_PARTICIPANTS: 'No participants to send invitations to',
    
    // Video Errors
    VIDEO_NOT_FOUND: 'Video not found',
    INVALID_VIDEO_FORMAT: 'Invalid video format',
    FILE_TOO_LARGE: 'File size exceeds maximum limit',
    
    // Authorization Errors
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
    ADMIN_ONLY: 'This action requires admin privileges',
    
    // Server Errors
    INTERNAL_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database operation failed',
    EMAIL_SERVICE_ERROR: 'Failed to send email',
    FILE_UPLOAD_ERROR: 'File upload failed',
  },
};

export default MESSAGES;
