/**
 * Upload Controller with WebP Conversion
 * Handles image uploads with automatic WebP conversion via ImageKit integration
 * Flow: Upload → Temp → Convert to WebP → ImageKit → Cleanup Temp
 */

import { processImageUpload, cleanupTempFile } from '../helpers/imageConversionHelper.js';
import { uploadImageToImageKit } from '../utils/imagekitHelper.js';
import { env } from '../utils/envConfig.js';

/**
 * POST /api/upload/image
 * Generic image upload with WebP conversion
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    const userId = req.user.userId;

    console.log(`📸 Processing image: ${originalname} (${(size / 1024).toFixed(2)}KB)`);

    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type - only images allowed'
      });
    }

    // Process: Save temp → Convert to WebP
    const processResult = await processImageUpload(buffer, originalname);

    // Upload WebP to ImageKit
    const imageKitResult = await uploadImageToImageKit(
      processResult.webpPath,
      `breathart/${userId}/images`
    );

    // Clean up temp file after successful upload
    cleanupTempFile(processResult.tempPath);

    res.status(200).json({
      success: true,
      message: 'Image uploaded and converted successfully',
      data: {
        imageKitUrl: imageKitResult.url,
        imageKitId: imageKitResult.fileId,
        fileName: processResult.fileName,
        originalSize: size,
        convertedSize: processResult.webpSize,
        savedPercent: processResult.savedPercent,
        savedBytes: processResult.savedBytes
      }
    });
  } catch (error) {
    console.error('❌ Image upload error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: env.isDev ? error.message : undefined
    });
  }
};

/**
 * POST /api/upload/profile-image
 * Upload profile/avatar image
 */
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    const userId = req.user.userId;

    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    console.log(`👤 Processing profile image: ${originalname}`);

    // Process: Save temp → Convert to WebP
    const processResult = await processImageUpload(buffer, originalname);

    // Upload to ImageKit
    const imageKitResult = await uploadImageToImageKit(
      processResult.webpPath,
      `breathart/${userId}/profile`
    );

    // Clean up temp
    cleanupTempFile(processResult.tempPath);

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageKitUrl: imageKitResult.url,
        imageKitId: imageKitResult.fileId,
        fileName: processResult.fileName
      }
    });
  } catch (error) {
    console.error('❌ Profile image upload error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Profile image upload failed',
      error: env.isDev ? error.message : undefined
    });
  }
};

/**
 * POST /api/upload/course-thumbnail
 * Upload course thumbnail (admin only)
 */
export const uploadCourseThumbnail = async (req, res) => {
  try {
    if (!req.admin?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    const courseId = req.body.courseId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    console.log(`🎓 Processing course thumbnail: ${originalname}`);

    // Process: Save temp → Convert to WebP
    const processResult = await processImageUpload(buffer, originalname);

    // Upload to ImageKit
    const imageKitResult = await uploadImageToImageKit(
      processResult.webpPath,
      `breathart/courses/${courseId}`
    );

    // Clean up temp
    cleanupTempFile(processResult.tempPath);

    res.status(200).json({
      success: true,
      message: 'Course thumbnail uploaded successfully',
      data: {
        imageKitUrl: imageKitResult.url,
        imageKitId: imageKitResult.fileId,
        courseId,
        fileName: processResult.fileName
      }
    });
  } catch (error) {
    console.error('❌ Course thumbnail upload error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Course thumbnail upload failed',
      error: env.isDev ? error.message : undefined
    });
  }
};

export default {
  uploadImage,
  uploadProfileImage,
  uploadCourseThumbnail
};
