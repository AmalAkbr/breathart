import sharp from 'sharp';
import { uploadImageToImageKit, deleteImageFromImageKit } from './imagekitHelper.js';

/**
 * Convert image to WebP format with optional thumbnail
 * @param {Buffer} fileBuffer - Original image buffer
 * @param {String} fileName - Original file name
 * @param {Object} options - Conversion options
 * @param {Number} options.quality - WebP quality (1-100, default: 80)
 * @param {Number} options.thumbnailWidth - Thumbnail width (default: 300)
 * @returns {Promise<Object>} - Object containing WebP buffer and thumbnail buffer
 */
export const convertToWebP = async (fileBuffer, fileName, options = {}) => {
  try {
    const {
      quality = 80,
      thumbnailWidth = 300,
    } = options;

    console.log(`🔄 Converting image to WebP: ${fileName}`);

    // Convert to WebP
    const webpBuffer = await sharp(fileBuffer)
      .webp({ quality, effort: 4 })
      .toBuffer();

    console.log(`✅ Main image converted to WebP (${(webpBuffer.length / 1024).toFixed(2)}KB)`);

    // Create thumbnail
    const thumbnailBuffer = await sharp(fileBuffer)
      .resize(thumbnailWidth, thumbnailWidth, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 75, effort: 3 })
      .toBuffer();

    console.log(`✅ Thumbnail created (${(thumbnailBuffer.length / 1024).toFixed(2)}KB)`);

    return {
      success: true,
      webpBuffer,
      thumbnailBuffer,
      originalSize: fileBuffer.length,
      webpSize: webpBuffer.length,
      thumbnailSize: thumbnailBuffer.length,
      savedBytes: fileBuffer.length - webpBuffer.length,
      savedPercentage: (((fileBuffer.length - webpBuffer.length) / fileBuffer.length) * 100).toFixed(1),
    };
  } catch (error) {
    console.error('❌ Image conversion failed:', error.message);
    throw new Error(`Image conversion failed: ${error.message}`);
  }
};

/**
 * Convert image and upload to ImageKit
 * @param {Buffer} fileBuffer - Original image buffer
 * @param {String} fileName - Original file name
 * @param {String} folder - ImageKit folder path
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} - Upload result with main image and thumbnail URLs
 */
export const convertAndUploadImage = async (fileBuffer, fileName, folder = 'breathart-uploads', options = {}) => {
  try {
    console.log(`📸 Processing and uploading image: ${fileName}`);

    // Convert to WebP
    const { webpBuffer, thumbnailBuffer, webpSize, savedPercentage } = await convertToWebP(
      fileBuffer,
      fileName,
      options
    );

    // Upload main image
    const mainUpload = await uploadImageToImageKit(webpBuffer, fileName, folder);

    // Upload thumbnail
    const thumbnailUpload = await uploadImageToImageKit(
      thumbnailBuffer,
      `${fileName}-thumbnail`,
      `${folder}/thumbnails`
    );

    console.log(`✅ Image and thumbnail uploaded successfully`);
    console.log(`📊 Size reduction: -${savedPercentage}%`);

    return {
      success: true,
      mainImage: {
        url: mainUpload.url,
        fileId: mainUpload.fileId,
        fileName: mainUpload.fileName,
        size: webpSize,
      },
      thumbnail: {
        url: thumbnailUpload.url,
        fileId: thumbnailUpload.fileId,
        fileName: thumbnailUpload.fileName,
        size: thumbnailUpload.size,
      },
      savings: {
        bytes: webpBuffer.length - thumbnailBuffer.length,
        percentage: savedPercentage,
      },
    };
  } catch (error) {
    console.error('❌ Image processing and upload failed:', error.message);
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Batch convert and upload multiple images
 * @param {Array<Buffer>} fileBuffers - Array of image buffers
 * @param {Array<String>} fileNames - Array of file names
 * @param {String} folder - ImageKit folder path
 * @returns {Promise<Array>} - Array of upload results
 */
export const batchConvertAndUpload = async (fileBuffers, fileNames, folder = 'breathart-uploads') => {
  try {
    console.log(`📦 Batch processing ${fileBuffers.length} images...`);

    const results = await Promise.all(
      fileBuffers.map((buffer, index) =>
        convertAndUploadImage(buffer, fileNames[index], folder)
      )
    );

    console.log(`✅ Batch processing complete`);
    return results;
  } catch (error) {
    console.error('❌ Batch processing failed:', error.message);
    throw new Error(`Batch processing failed: ${error.message}`);
  }
};

export default {
  convertToWebP,
  convertAndUploadImage,
  batchConvertAndUpload,
};
