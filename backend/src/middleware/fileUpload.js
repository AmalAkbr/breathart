import multer from 'multer';
import path from 'path';

// Configure multer storage
const storage = multer.memoryStorage(); // Store in memory for processing

/**
 * File filter for images (WebP validation)
 */
const imageFileFilter = (req, file, cb) => {
  // Accept only image files with specific types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

  if (!allowedMimes.includes(file.mimetype) || !allowedExts.includes(ext)) {
    const error = new Error(`Invalid file type. Allowed types: ${allowedExts.join(', ')}`);
    error.name = 'MulterError';
    error.code = 'INVALID_FILE_TYPE';
    return cb(error);
  }

  cb(null, true);
};

/**
 * File filter for videos
 */
const videoFileFilter = (req, file, cb) => {
  // Accept only video files
  const allowedMimes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'application/x-matroska',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];

  if (!allowedMimes.includes(file.mimetype) || !allowedExts.includes(ext)) {
    const error = new Error(`Invalid file type. Allowed types: ${allowedExts.join(', ')}`);
    error.name = 'MulterError';
    error.code = 'INVALID_FILE_TYPE';
    return cb(error);
  }

  cb(null, true);
};

/**
 * Multer instances
 */
export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

/**
 * Middleware to handle multer errors
 */
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        message: 'Too many files'
      });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload error'
    });
  }
  next();
};

/**
 * Validate image file requirements
 */
export const validateImageFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Image file is required'
    });
  }

  // Check file size
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(413).json({
      success: false,
      message: 'Image must be less than 5MB'
    });
  }

  next();
};

/**
 * Validate video file requirements
 */
export const validateVideoFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Video file is required'
    });
  }

  // Check file size
  if (req.file.size > 500 * 1024 * 1024) {
    return res.status(413).json({
      success: false,
      message: 'Video must be less than 500MB'
    });
  }

  next();
};
