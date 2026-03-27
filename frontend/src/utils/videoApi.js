/**
 * 🎬 Video Management Utilities
 * Helper functions for managing videos in the database and storage
 */

import { supabase } from '../supabase/client';

/**
 * Add a new video to the database
 * @param {Object} videoData - Video information
 * @param {string} videoData.title - Video title (required)
 * @param {string} videoData.description - Video description
 * @param {string} videoData.thumbnail_url - Supabase Storage thumbnail URL (required)
 * @param {string} videoData.video_url - Cloudflare R2 video URL (required)
 * @param {number} videoData.duration - Video duration in seconds
 * @returns {Promise<Object>} Created video object or error
 */
export const addVideo = async (videoData) => {
  if (!videoData.title || !videoData.thumbnail_url || !videoData.video_url) {
    throw new Error('Missing required fields: title, thumbnail_url, video_url');
  }

  const { data, error } = await supabase
    .from('video_details')
    .insert([videoData])
    .select();

  if (error) throw error;
  return data?.[0];
};

/**
 * Get all videos from database
 * @returns {Promise<Array>} Array of video objects
 */
export const getAllVideos = async () => {
  const { data, error } = await supabase
    .from('video_details')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get a single video by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} Video object
 */
export const getVideoById = async (videoId) => {
  const { data, error } = await supabase
    .from('video_details')
    .select('*')
    .eq('id', videoId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update video details
 * @param {string} videoId - Video ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated video object
 */
export const updateVideo = async (videoId, updates) => {
  const { data, error } = await supabase
    .from('video_details')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', videoId)
    .select();

  if (error) throw error;
  return data?.[0];
};

/**
 * Delete a video from database (doesn't delete from storage)
 * @param {string} videoId - Video ID
 * @returns {Promise<void>}
 */
export const deleteVideo = async (videoId) => {
  const { error } = await supabase
    .from('video_details')
    .delete()
    .eq('id', videoId);

  if (error) throw error;
};

/**
 * Upload thumbnail to Supabase Storage
 * @param {File} file - Image file
 * @param {string} fileName - File name (e.g., 'thumb_video1.jpg')
 * @returns {Promise<string>} Public URL of uploaded thumbnail
 */
export const uploadThumbnail = async (file, fileName) => {
  const bucketName = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'video-thumbnails';

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

/**
 * Example: Create a complete video entry with thumbnail
 * Usage:
 * ```
 * const thumbnailFile = new File([imageBuffer], 'thumb.jpg');
 * const video = await createCompleteVideo({
 *   title: 'My Video',
 *   description: 'A test video',
 *   thumbnailFile: thumbnailFile,
 *   videoUrl: 'https://pub-xxxxx.r2.dev/myvideo.mp4',
 *   duration: 120,
 * });
 * ```
 */
export const createCompleteVideo = async (params) => {
  const {
    title,
    description,
    thumbnailFile,
    videoUrl,
    duration,
  } = params;

  // Upload thumbnail
  const timestampedName = `thumb_${Date.now()}_${thumbnailFile.name}`;
  const thumbnailUrl = await uploadThumbnail(thumbnailFile, timestampedName);

  // Create video entry
  const video = await addVideo({
    title,
    description,
    thumbnail_url: thumbnailUrl,
    video_url: videoUrl,
    duration,
  });

  return video;
};

/**
 * Search videos by title or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching videos
 */
export const searchVideos = async (searchTerm) => {
  const { data, error } = await supabase
    .from('video_details')
    .select('*')
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get total video count
 * @returns {Promise<number>} Total number of videos
 */
export const getVideoCount = async () => {
  const { count, error } = await supabase
    .from('video_details')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
};

/**
 * Get videos paginated
 * @param {number} page - Page number (starting from 0)
 * @param {number} pageSize - Items per page (default: 12)
 * @returns {Promise<Object>} { videos, total, pages }
 */
export const getVideosPaginated = async (page = 0, pageSize = 12) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data: videos, error, count } = await supabase
    .from('video_details')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    videos: videos || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / pageSize),
  };
};
