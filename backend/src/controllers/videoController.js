// backend/src/controllers/videoController.js
import * as videoService from '../services/videoService.js';

/**
 * GET /api/videos - Get all published videos
 */
export const getAllVideos = async (req, res) => {
  try {
    const videos = await videoService.getAllVideos();
    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: error.message
    });
  }
};

/**
 * GET /api/videos/:videoId - Get single video
 */
export const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await videoService.getVideoById(videoId);

    // Increment view count
    await videoService.incrementViews(videoId);

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(404).json({
      success: false,
      message: 'Video not found',
      error: error.message
    });
  }
};

/**
 * GET /api/videos/category/:category - Get videos by category
 */
export const getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const videos = await videoService.getVideosByCategory(category);

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Get videos by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos by category',
      error: error.message
    });
  }
};

/**
 * GET /api/videos/admin/:adminId - Get videos created by admin
 */
export const getVideosByAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const videos = await videoService.getVideosByAdmin(adminId);

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Get videos by admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos by admin',
      error: error.message
    });
  }
};

/**
 * POST /api/videos - Create video entry
 */
export const createVideo = async (req, res) => {
  try {
    const { title, description, thumbnail, thumbnailFileId, thumbnailPath, videoUrl, duration, category, tags } = req.body;

    if (!title || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: 'Title and thumbnail are required'
      });
    }

    // Only admins can create videos - get from authenticated admin user
    const adminId = req.user?.userId; // from verifyAdmin middleware
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin not properly authenticated'
      });
    }

    const video = await videoService.createVideo({
      title,
      description,
      thumbnail,
      thumbnailFileId,
      thumbnailPath,
      videoUrl: videoUrl || '', // Video URL can be added later
      duration,
      category,
      createdBy: adminId, // Admin who created
      tags
    });

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating video',
      error: error.message
    });
  }
};

/**
 * PUT /api/videos/:videoId - Update video
 */
export const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await videoService.updateVideo(videoId, req.body);

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: error.message
    });
  }
};

/**
 * DELETE /api/videos/:videoId - Delete video
 */
export const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    await videoService.deleteVideo(videoId);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message
    });
  }
};

/**
 * POST /api/videos/:videoId/publish - Publish video
 */
export const publishVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await videoService.publishVideo(videoId);

    res.json({
      success: true,
      message: 'Video published successfully',
      data: video
    });
  } catch (error) {
    console.error('Publish video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing video',
      error: error.message
    });
  }
};

/**
 * POST /api/videos/:videoId/unpublish - Unpublish video
 */
export const unpublishVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await videoService.unpublishVideo(videoId);

    res.json({
      success: true,
      message: 'Video unpublished successfully',
      data: video
    });
  } catch (error) {
    console.error('Unpublish video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unpublishing video',
      error: error.message
    });
  }
};

/**
 * GET /api/videos/search - Search videos
 */
export const searchVideos = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const videos = await videoService.searchVideos(q);
    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Search videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching videos',
      error: error.message
    });
  }
};

export default {
  getAllVideos,
  getVideoById,
  getVideosByCategory,
  getVideosByAdmin,
  createVideo,
  updateVideo,
  deleteVideo,
  publishVideo,
  unpublishVideo,
  searchVideos,
};
