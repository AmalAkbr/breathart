/**
 * Upload Routes for MongoDB + ImageKit + Cloudflare R2
 * Handles image and video file uploads with conversions
 */

import express from 'express';
import multer from 'multer';
import { uploadImage, uploadProfileImage, uploadCourseThumbnail } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';
import verifyAdmin from '../middleware/admin.js';
import * as videoService from '../services/videoService.js';
import { uploadVideoToCloudflare } from '../utils/cloudflareR2Helper.js';
import { processImageUpload, cleanupTempFile } from '../helpers/imageConversionHelper.js';
import { uploadImageToImageKit } from '../utils/imagekitHelper.js';

const router = express.Router();

// ===== Multer Configuration - Images =====
const uploadImage_ = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'image/gif', 'image/svg+xml', 'image/heic', 'image/heif',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type`));
    }
    cb(null, true);
  },
});

// ===== Multer Configuration - Videos =====
const uploadVideo_ = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'video/mp4', 'video/webm', 'video/x-msvideo',
      'video/quicktime', 'video/x-matroska', 'video/x-m4v',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error(`Invalid video type. Allowed: ${allowedMimes.join(', ')}`));
    }
    cb(null, true);
  },
});

// ===== Upload Routes =====

/**
 * POST /api/upload/image
 * Upload and convert image to WebP
 * Returns main image URL, thumbnail URL, and conversion stats
 */
router.post(
  '/image',
  authenticateToken,
  uploadImage_.single('image'),
  uploadImage
);

/**
 * POST /api/upload/profile-image
 * Upload and convert profile image
 * Returns optimized profile image URL
 */
router.post(
  '/profile-image',
  authenticateToken,
  uploadImage_.single('profileImage'),
  uploadProfileImage
);

/**
 * POST /api/upload/course-thumbnail
 * Upload and convert course thumbnail
 * Body: { courseId: string }
 */
router.post(
  '/course-thumbnail',
  authenticateToken,
  uploadImage_.single('thumbnail'),
  uploadCourseThumbnail
);

/**
 * POST /api/upload/thumbnail
 * Upload thumbnail image for video
 * Converts to WebP and uploads to ImageKit
 */
router.post('/thumbnail', authenticateToken, uploadImage_.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No thumbnail file provided'
      });
    }

    const { originalname, buffer, size } = req.file;
    const userId = req.user?.userId;

    console.log(`📸 Processing thumbnail: ${originalname} (${(size / 1024).toFixed(2)}KB)`);

    // Process: Save temp → Convert to WebP
    const processResult = await processImageUpload(buffer, originalname);

    // Upload WebP to ImageKit
    // Store all thumbnails under a single folder
    const imageKitResult = await uploadImageToImageKit(
      processResult.webpPath,
      'breathart/thumbnails'
    );

    // Clean up temp file
    cleanupTempFile(processResult.tempPath);

    res.status(200).json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      data: {
        thumbnailUrl: imageKitResult.url,
        fileId: imageKitResult.fileId,
        fileName: processResult.fileName,
        savedPercent: processResult.savedPercent,
      }
    });
  } catch (error) {
    console.error('❌ Thumbnail upload error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Thumbnail upload failed',
      details: error.message
    });
  }
});

/**
 * POST /api/upload/video-file
 * Upload video file to Cloudflare R2
 * Body: { title, description, category } (title used for video file naming)
 */
router.post('/video-file', verifyAdmin, uploadVideo_.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided'
      });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Video title is required'
      });
    }

    const { buffer, originalname, size } = req.file;

    console.log(`🎬 Uploading video file: ${originalname} (${(size / 1024 / 1024).toFixed(2)}MB)`);

    // Upload to Cloudflare R2
    const r2Result = await uploadVideoToCloudflare(buffer, originalname, title);

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        videoUrl: r2Result.url,
        fileName: r2Result.fileName,
        fileSize: r2Result.fileSize,
      }
    });
  } catch (error) {
    console.error('❌ Video upload error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Video upload failed',
      details: error.message
    });
  }
});

/**
 * POST /api/upload/video
 * Create video entry with metadata (URL-based, no file upload)
 * Body: { title, description, category, thumbnailUrl, videoUrl, duration }
 * Used by admin panel UploadVideo component when using URLs
 */
router.post('/video', verifyAdmin, async (req, res) => {
  try {
    const { title, description, category, thumbnailUrl, videoUrl, duration } = req.body;

    if (!title || !thumbnailUrl) {
      return res.status(400).json({
        success: false,
        error: 'Title and thumbnail URL are required'
      });
    }

    // verifyAdmin attaches the full user document as req.user
    const adminId = req.user?._id?.toString();
    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: 'Admin user not authenticated properly'
      });
    }

    const video = await videoService.createVideo({
      title,
      description,
      thumbnail: thumbnailUrl,
      videoUrl: videoUrl || '', // Optional - can upload file later
      duration: duration ? parseInt(duration) : null,
      category: category || 'tutorial',
      createdBy: adminId,
      tags: []
    });

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating video',
      details: error.message
    });
  }
});

/**
 * GET /api/upload/health
 * Check R2 and ImageKit connectivity (admin only)
 */
router.get('/health', verifyAdmin, async (req, res) => {
  try {
    const { testR2Connection } = await import('../utils/cloudflareR2Helper.js');
    
    console.log('🔍 Running health checks...');
    
    const r2Connected = await testR2Connection();
    
    res.status(200).json({
      success: true,
      health: {
        r2: {
          connected: r2Connected,
          status: r2Connected ? 'Ready' : 'Error',
        },
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Health check error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

/**
 * GET /api/upload/debug-admin
 * Check current admin status (for debugging auth issues)
 * Returns: Token validity, user info, admin status
 */
router.get('/debug-admin', verifyAdmin, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      debug: {
        user: {
          userId: req.user._id,
          email: req.user.email,
          role: req.user.role,
          isAdmin: req.user.isAdmin,
          isActive: req.user.isActive
        },
        tokenValid: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: 'Debug check failed',
      details: error.message
    });
  }
});

// ===== Error Handling =====
router.use((error, req, res, next) => {
  console.error('Upload error:', error.message);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large',
        details: 'Maximum file size is 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        message: 'Too many files',
        details: 'Only one file per upload'
      });
    }
  }

  res.status(400).json({
    success: false,
    message: 'Upload error',
    details: error.message
  });
});

export default router;
