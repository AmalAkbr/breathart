// backend/src/services/videoService.js
import { Video } from '../models/Video.js';
import { deleteImageFromImageKit, deleteImageFromImageKitByUrl } from '../utils/imagekitHelper.js';
import { deleteFromR2 } from './uploadService.js';
import { r2Config } from '../utils/envConfig.js';

const extractR2Key = (url = '') => {
  if (!url || !r2Config.publicUrl) return '';
  const prefix = r2Config.publicUrl.replace(/\/$/, '');
  return url.startsWith(prefix) ? url.substring(prefix.length + 1) : '';
};

/**
 * Get all videos
 */
export const getAllVideos = async () => {
  const videos = await Video.find({ status: { $ne: 'archived' } })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'fullName email');

  return videos || [];
};

/**
 * Get all videos (including drafts) - for admin
 */
export const getAllVideosAdmin = async () => {
  const videos = await Video.find()
    .sort({ createdAt: -1 })
    .populate('createdBy', 'fullName email');

  return videos || [];
};

/**
 * Get single video by ID
 */
export const getVideoById = async (videoId) => {
  const video = await Video.findById(videoId)
    .populate('createdBy', 'fullName email');

  if (!video) {
    throw new Error('Video not found');
  }

  return video;
};

/**
 * Get videos by category
 */
export const getVideosByCategory = async (category) => {
  const videos = await Video.find({ category, status: 'published' })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'fullName email');

  return videos || [];
};

/**
 * Get videos by admin who created them
 */
export const getVideosByAdmin = async (adminId) => {
  const videos = await Video.find({ createdBy: adminId })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'fullName email');

  return videos || [];
};

/**
 * Create new video entry
 */
export const createVideo = async (videoData) => {
  const {
    title,
    description,
    thumbnail,
    thumbnailFileId,
    thumbnailPath,
    videoUrl,
    duration,
    category,
    createdBy,
    tags,
  } = videoData;

  // Only require: title, thumbnail, and createdBy (admin ID)
  // videoUrl can be added later
  if (!title || !thumbnail || !createdBy) {
    throw new Error('Missing required fields: title, thumbnail, createdBy');
  }

  const video = new Video({
    title,
    description,
    thumbnail,
    thumbnailFileId: thumbnailFileId || null,
    thumbnailPath: thumbnailPath || null,
    videoUrl: videoUrl || '', // Allow empty initially
    videoKey: extractR2Key(videoUrl),
    duration: duration || 0,
    category: category || 'course',
    createdBy, // Admin who uploaded
    tags: tags || [],
    status: 'published',
    isPublished: true,
  });

  await video.save();
  return video.populate('createdBy', 'fullName email');
};

/**
 * Update video details
 */
export const updateVideo = async (videoId, updateData) => {
  const existing = await Video.findById(videoId);

  if (!existing) {
    throw new Error('Video not found');
  }

  // Cleanup previous assets if they are being replaced
  const thumbnailChanged = updateData.thumbnail && updateData.thumbnail !== existing.thumbnail;
  const thumbnailFileIdChanged = updateData.thumbnailFileId && updateData.thumbnailFileId !== existing.thumbnailFileId;

  if (thumbnailChanged || thumbnailFileIdChanged) {
    const deletedById = existing.thumbnailFileId
      ? await deleteImageFromImageKit(existing.thumbnailFileId)
      : false;

    if (!deletedById) {
      if (existing.thumbnail) {
        await deleteImageFromImageKitByUrl(existing.thumbnail);
      } else if (existing.thumbnailPath) {
        await deleteFromR2(existing.thumbnailPath);
      }
    }
  }

  if (updateData.videoUrl && updateData.videoUrl !== existing.videoUrl && existing.videoKey) {
    await deleteFromR2(existing.videoKey);
  }

  const nextVideoKey = updateData.videoUrl
    ? extractR2Key(updateData.videoUrl)
    : existing.videoKey;

  const video = await Video.findByIdAndUpdate(
    videoId,
    { ...updateData, videoKey: nextVideoKey },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  ).populate('createdBy', 'fullName email');

  if (!video) {
    throw new Error('Video not found');
  }

  return video;
};

/**
 * Delete video
 */
export const deleteVideo = async (videoId) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new Error('Video not found');
  }

  // Delete remote assets (best effort)
  if (video.thumbnailFileId) {
    await deleteImageFromImageKit(video.thumbnailFileId);
  } else if (video.thumbnailPath) {
    await deleteFromR2(video.thumbnailPath);
  }

  if (video.videoKey) {
    await deleteFromR2(video.videoKey);
  }

  await Video.findByIdAndDelete(videoId);

  return { message: 'Video deleted successfully' };
};

/**
 * Publish video
 */
export const publishVideo = async (videoId) => {
  const video = await Video.findByIdAndUpdate(
    videoId,
    { status: 'published', isPublished: true },
    { returnDocument: 'after' }
  ).populate('createdBy', 'fullName email');

  if (!video) {
    throw new Error('Video not found');
  }

  return video;
};

/**
 * Unpublish video
 */
export const unpublishVideo = async (videoId) => {
  const video = await Video.findByIdAndUpdate(
    videoId,
    { status: 'draft', isPublished: false },
    { returnDocument: 'after' }
  ).populate('createdBy', 'fullName email');

  if (!video) {
    throw new Error('Video not found');
  }

  return video;
};

/**
 * Increment view count
 */
export const incrementViews = async (videoId) => {
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  );

  if (!video) {
    throw new Error('Video not found');
  }

  return video;
};

/**
 * Search videos
 */
export const searchVideos = async (searchTerm) => {
  const videos = await Video.find(
    {
      $text: { $search: searchTerm },
      status: 'published',
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .populate('createdBy', 'fullName email');

  return videos || [];
};

export default {
  getAllVideos,
  getAllVideosAdmin,
  getVideoById,
  getVideosByCategory,
  getVideosByAdmin,
  createVideo,
  updateVideo,
  deleteVideo,
  publishVideo,
  unpublishVideo,
  incrementViews,
  searchVideos,
};
