// backend/src/helpers/imageConversionHelper.js
/**
 * Image Conversion Helper
 * Handles WebP conversion for user-uploaded images
 * Flow: Upload → Temp Storage → WebP Conversion → Upload Folder → ImageKit → Cleanup
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../utils/envConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define temp and upload directories
const TEMP_DIR = path.join(__dirname, '../../temp');
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

/**
 * Ensure required directories exist
 */
export const initializeDirs = () => {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    console.log(`📁 Created temp directory: ${TEMP_DIR}`);
  }
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`📁 Created upload directory: ${UPLOAD_DIR}`);
  }
};

/**
 * Save buffer to temp file
 * @param {Buffer} buffer - Image buffer
 * @param {string} fileName - Original filename
 * @returns {string} Path to temp file
 */
export const saveTempFile = (buffer, fileName) => {
  if (!buffer || !fileName) {
    throw new Error('Buffer and filename are required');
  }

  const timestamp = Date.now();
  const ext = path.extname(fileName);
  const tempFileName = `${timestamp}-${path.basename(fileName, ext)}${ext}`;
  const tempFilePath = path.join(TEMP_DIR, tempFileName);

  fs.writeFileSync(tempFilePath, buffer);
  console.log(`💾 Temp file saved: ${tempFilePath}`);

  return tempFilePath;
};

/**
 * Convert image to WebP format
 * @param {string} inputPath - Path to source image
 * @param {number} quality - WebP quality (default: 80)
 * @returns {object} { inputPath, webpPath, inputSize, webpSize, savedPercent }
 */
export const convertToWebP = async (inputPath, quality = 80) => {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const fileName = path.basename(inputPath, path.extname(inputPath));
  const webpFileName = `${fileName}.webp`;
  const webpPath = path.join(UPLOAD_DIR, webpFileName);

  try {
    const inputStats = fs.statSync(inputPath);
    const inputSize = inputStats.size;

    // Convert to WebP
    await sharp(inputPath)
      .webp({ quality, effort: 4 })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    const webpSize = webpStats.size;
    const savedPercent = (((inputSize - webpSize) / inputSize) * 100).toFixed(1);

    console.log(`✅ WebP conversion successful: ${fileName}.webp`);
    console.log(`   ${(inputSize / 1024).toFixed(2)}KB → ${(webpSize / 1024).toFixed(2)}KB (-${savedPercent}%)`);

    return {
      inputPath,
      webpPath,
      fileName: webpFileName,
      inputSize,
      webpSize,
      savedBytes: inputSize - webpSize,
      savedPercent
    };
  } catch (error) {
    console.error(`❌ WebP conversion failed: ${error.message}`);
    throw new Error(`Failed to convert image to WebP: ${error.message}`);
  }
};

/**
 * Clean up temp file after successful ImageKit upload
 * @param {string} tempFilePath - Path to temp file
 */
export const cleanupTempFile = (tempFilePath) => {
  try {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log(`🗑️  Temp file cleaned: ${tempFilePath}`);
    }
  } catch (error) {
    console.error(`⚠️  Failed to cleanup temp file: ${error.message}`);
  }
};

/**
 * Complete upload workflow: Save → Convert → Return WebP path
 * @param {Buffer} buffer - Image buffer from upload
 * @param {string} fileName - Original filename
 * @returns {object} Conversion result with webp details
 */
export const processImageUpload = async (buffer, fileName) => {
  try {
    initializeDirs();

    // Step 1: Save to temp
    const tempPath = saveTempFile(buffer, fileName);

    // Step 2: Convert to WebP
    const result = await convertToWebP(tempPath);

    // Step 3: Schedule cleanup of temp file (will be cleaned by cron or after ImageKit upload)
    result.tempPath = tempPath;

    return result;
  } catch (error) {
    console.error(`❌ Image processing error: ${error.message}`);
    throw error;
  }
};

/**
 * Get upload directory path
 */
export const getUploadDir = () => UPLOAD_DIR;

/**
 * Get temp directory path
 */
export const getTempDir = () => TEMP_DIR;

export default {
  initializeDirs,
  saveTempFile,
  convertToWebP,
  cleanupTempFile,
  processImageUpload,
  getUploadDir,
  getTempDir
};
