// backend/src/utils/fileValidation.js
/**
 * File Upload Validation Utilities
 * Prevent malicious file uploads and storage abuse
 */

import path from 'path';
import fs from 'fs/promises';

/**
 * Allowed file types by category
 */
export const ALLOWED_FILE_TYPES = {
  images: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    maxSize: 5 * 1024 * 1024, // 5 MB
  },
  videos: {
    mimeTypes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
    extensions: ['mp4', 'mpeg', 'mov', 'avi'],
    maxSize: 500 * 1024 * 1024, // 500 MB
  },
  documents: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['pdf', 'doc', 'docx'],
    maxSize: 20 * 1024 * 1024, // 20 MB
  },
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedCategory = 'images') => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const allowed = ALLOWED_FILE_TYPES[allowedCategory];
  if (!allowed) {
    return { valid: false, error: 'Invalid file category' };
  }

  const ext = path.extname(file.originalname || file.name || '').toLowerCase().slice(1);
  const mimeType = file.mimetype || '';

  // Check extension
  if (!allowed.extensions.includes(ext)) {
    return { 
      valid: false, 
      error: `File extension .${ext} not allowed. Allowed: ${allowed.extensions.join(', ')}` 
    };
  }

  // Check MIME type
  if (!allowed.mimeTypes.includes(mimeType)) {
    return { 
      valid: false, 
      error: `File type ${mimeType} not allowed. Allowed: ${allowed.mimeTypes.join(', ')}` 
    };
  }

  return { valid: true };
};

/**
 * Validate file size
 */
export const validateFileSize = (file, allowedCategory = 'images') => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const allowed = ALLOWED_FILE_TYPES[allowedCategory];
  if (!allowed) {
    return { valid: false, error: 'Invalid file category' };
  }

  const size = file.size || (file.buffer?.length);
  if (!size) {
    return { valid: false, error: 'Cannot determine file size' };
  }

  if (size > allowed.maxSize) {
    return { 
      valid: false, 
      error: `File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum of ${(allowed.maxSize / 1024 / 1024).toFixed(2)}MB` 
    };
  }

  return { valid: true };
};

/**
 * Generate safe file name
 */
export const generateSafeFileName = (originalName, userId) => {
  if (!originalName) {
    throw new Error('Original file name required');
  }

  // Remove path traversal attempts
  const baseName = path.basename(originalName);
  
  // Get extension
  const ext = path.extname(baseName).toLowerCase();
  
  // Generate safe name: timestamp_userid_random.ext
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const safeName = `${timestamp}_${userId}_${random}${ext}`;

  return safeName;
};

/**
 * Validate file upload request
 * Comprehensive check
 */
export const validateFileUpload = (file, allowedCategory = 'images', userId) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!userId) {
    return { valid: false, error: 'User ID required for file upload' };
  }

  // Check type
  const typeCheck = validateFileType(file, allowedCategory);
  if (!typeCheck.valid) {
    return typeCheck;
  }

  // Check size
  const sizeCheck = validateFileSize(file, allowedCategory);
  if (!sizeCheck.valid) {
    return sizeCheck;
  }

  // Generate safe name
  const safeName = generateSafeFileName(file.originalname || file.name, userId);

  return { valid: true, safeName };
};

/**
 * Check for suspicious file content patterns
 */
export const checkSuspiciousContent = (buffer) => {
  if (!buffer) {
    return false;
  }

  // Check for common executable patterns
  const suspiciousPatterns = [
    Buffer.from('MZ'), // Windows executable
    Buffer.from('#!/'), // Unix executable
    Buffer.from('<?php'), // PHP script
    Buffer.from('<%'), // ASP script
    Buffer.from('PK'), // ZIP file (could contain executables)
  ];

  return suspiciousPatterns.some(pattern => 
    buffer.includes(pattern)
  );
};

/**
 * Sanitize file path to prevent traversal
 */
export const sanitizeFilePath = (filePath, uploadDir) => {
  if (!filePath || !uploadDir) {
    throw new Error('File path and upload directory required');
  }

  // Resolve to absolute path
  const fullPath = path.resolve(uploadDir, filePath);
  const baseDir = path.resolve(uploadDir);

  // Ensure path is within upload directory
  if (!fullPath.startsWith(baseDir)) {
    throw new Error('Invalid file path');
  }

  return fullPath;
};

/**
 * Middleware for file upload validation
 */
export const validateUploadMiddleware = (category = 'images') => {
  return (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const userId = req.user?.userId || req.admin?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const validation = validateFileUpload(req.file, category, userId);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'File validation failed',
          error: validation.error
        });
      }

      // Check for suspicious content
      if (checkSuspiciousContent(req.file.buffer)) {
        return res.status(400).json({
          success: false,
          message: 'File contains suspicious patterns',
          error: 'File may be malicious or unsupported'
        });
      }

      // Attach validation result to request
      req.fileValidation = validation;
      next();
    } catch (error) {
      console.error('File validation error:', error.message);
      res.status(500).json({
        success: false,
        message: 'File validation error',
        error: error.message
      });
    }
  };
};
