import ImageKit from '@imagekit/nodejs';
import fs from 'fs';
import path from 'path';
import { env } from './envConfig.js';

// Validate ImageKit configuration
if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
  console.warn('⚠️  ImageKit configuration missing:', {
    hasPublicKey: !!env.IMAGEKIT_PUBLIC_KEY,
    hasPrivateKey: !!env.IMAGEKIT_PRIVATE_KEY,
    hasUrlEndpoint: !!env.IMAGEKIT_URL_ENDPOINT,
  });
}

let imageKit;

// Fallback HTTP delete when SDK instance isn't available
const deleteFileViaHttp = async (fileId) => {
  try {
    if (!env.IMAGEKIT_PRIVATE_KEY) {
      console.warn('⚠️  IMAGEKIT_PRIVATE_KEY missing; cannot delete via HTTP');
      return false;
    }
    const auth = Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');
    const resp = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.warn(`⚠️  HTTP delete failed ${resp.status}: ${text.slice(0, 120)}`);
      return false;
    }
    console.log('✅ ImageKit HTTP delete success');
    return true;
  } catch (err) {
    console.error('❌ ImageKit HTTP delete error:', err.message);
    return false;
  }
};

// Initialize ImageKit with proper error handling
try {
  console.log('🔧 Initializing ImageKit with @imagekit/nodejs SDK');
  imageKit = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  });

  console.log('✅ ImageKit instance created successfully');
  
  // Debug: Check what methods are available
  const prototypeChain = Object.getPrototypeOf(imageKit);
  const prototypeMethods = Object.getOwnPropertyNames(prototypeChain).filter(m => typeof prototypeChain[m] === 'function');
  // console.log(`📋 ImageKit prototype methods (${prototypeMethods.length}):`, prototypeMethods.join(', '));
  console.log(`⚙️  Direct properties (first 15):`, Object.keys(imageKit).slice(0, 15).join(', '));
} catch (error) {
  console.error('❌ Failed to initialize ImageKit:', error.message);
  imageKit = null;
}

/**
 * Generate ImageKit URL directly from path
 * When SDK upload fails, generate URL using ImageKit URL endpoint
 * @param {String} folder - ImageKit folder path
 * @param {String} fileName - File name
 * @returns {String} - Direct ImageKit URL
 */
const generateImageKitUrl = (folder, fileName) => {
  const baseUrl = env.IMAGEKIT_URL_ENDPOINT;
  if (!baseUrl) {
    throw new Error('IMAGEKIT_URL_ENDPOINT is not configured');
  }
  
  // Remove trailing slash from baseUrl if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Remove leading slash from folder if present
  const cleanFolder = folder.startsWith('/') ? folder : `/${folder}`;
  
  return `${cleanBaseUrl}${cleanFolder}/${fileName}`;
};

/**
 * Upload image to ImageKit from file path using direct HTTP API (SDK v7 is HTTP-client based)
 * @param {String} filePath - Path to the WebP file
 * @param {String} folder - ImageKit folder path (e.g., 'breathart/userId/thumbnails')
 * @returns {Object} - ImageKit upload response with URL
 */
export const uploadImageToImageKit = async (filePath, folder = 'breathart-thumbnails') => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const fileSizeKb = (fileBuffer.length / 1024).toFixed(2);

    console.log(`📸 Uploading image to ImageKit: ${folder}/${fileName} (${fileSizeKb}KB)`);

    // Use ImageKit upload API directly (Node 18+ has global fetch/FormData/Blob)
    try {
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer]), fileName);
      formData.append('fileName', fileName);
      formData.append('folder', `/${folder}`);
      formData.append('useUniqueFileName', 'false');
      formData.append('tags', 'thumbnail,breathart');

      const auth = Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');
      const uploadUrl = 'https://upload.imagekit.io/api/v1/files/upload';

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ImageKit upload failed ${response.status}: ${errorText.slice(0, 200)}`);
      }

      const data = await response.json();

      console.log('✅ Image uploaded to ImageKit');
      console.log(`📍 FileID: ${data.fileId}`);
      console.log(`📍 URL: ${data.url}`);

      return {
        success: true,
        url: data.url,
        fileId: data.fileId,
        fileName: data.name,
        folder,
        method: 'http-upload',
      };
    } catch (httpError) {
      console.error('❌ ImageKit HTTP upload failed:', httpError.message);
      throw httpError;
    }
  } catch (error) {
    console.error('❌ ImageKit upload failed:', error.message);
    throw new Error(`ImageKit upload failed: ${error.message}`);
  }
};

/**
 * Delete image from ImageKit
 * @param {String} fileId - ImageKit file ID
 * @returns {Boolean} - Success status
 */
export const deleteImageFromImageKit = async (fileId) => {
  try {
    if (!fileId || fileId.startsWith('local-')) {
      console.log(`⏭️  Skipping delete for local fileId: ${fileId}`);
      return true; // Skip deletion for fallback URLs
    }

    const sdkAvailable = imageKit && typeof imageKit.deleteFile === 'function';
    if (sdkAvailable) {
      console.log(`🗑️  Deleting image from ImageKit (SDK): ${fileId}`);
      await imageKit.deleteFile(fileId);
      console.log(`✅ Image deleted successfully from ImageKit`);
      return true;
    }

    console.warn(`⚠️  ImageKit delete not available via SDK; attempting HTTP for ${fileId}`);
    return await deleteFileViaHttp(fileId);
  } catch (error) {
    console.error('❌ ImageKit delete failed:', error.message);
    return false; // Don't throw for delete failures
  }
};

// Best-effort delete when only URL is available (older records without fileId)
export const deleteImageFromImageKitByUrl = async (url) => {
  try {
    const sdkList = imageKit && typeof imageKit.listFiles === 'function' && typeof imageKit.deleteFile === 'function';
    if (!url || typeof url !== 'string') return false;

    // Extract the file name safely (strip querystring/fragments)
    let fileName = '';
    try {
      const parsed = new URL(url);
      fileName = decodeURIComponent(parsed.pathname.split('/').pop() || '');
    } catch (parseErr) {
      const segments = url.split('?')[0].split('/');
      fileName = decodeURIComponent(segments[segments.length - 1] || '');
    }

    if (!fileName) return false;

    if (sdkList) {
      const results = await imageKit.listFiles({
        searchQuery: `name = "${fileName}"`,
        limit: 1,
      });

      if (!results?.length) {
        console.warn(`⚠️  No ImageKit file found for name ${fileName}`);
        return false;
      }

      const fileId = results[0].fileId;
      if (!fileId) return false;

      await imageKit.deleteFile(fileId);
      console.log(`✅ Deleted ImageKit file by URL lookup: ${fileName}`);
      return true;
    }

    console.warn('⚠️  ImageKit list/delete not available; attempting HTTP delete by guessed fileId is not possible');
    return false;
  } catch (error) {
    console.error('❌ ImageKit delete by URL failed:', error.message);
    return false;
  }
};

/**
 * List images in ImageKit folder
 * @param {String} folder - Folder path
 * @returns {Array} - List of files
 */
export const listImagesFromImageKit = async (folder = 'breathart-thumbnails') => {
  try {
    if (!imageKit || typeof imageKit.listFiles !== 'function') {
      console.warn(`⚠️  ImageKit list not available`);
      return [];
    }

    console.log(`📂 Listing images from ImageKit folder: ${folder}`);

    const response = await imageKit.listFiles({
      path: `/${folder}`,
      limit: 100,
    });

    console.log(`✅ Found ${response.length} images`);

    return response;
  } catch (error) {
    console.error('❌ ImageKit list failed:', error.message);
    return []; // Return empty array on failure
  }
};

/**
 * Get ImageKit authentication parameters for client-side upload
 * @returns {Object} - Auth parameters for client
 */
export const getImageKitAuthParams = () => {
  try {
    const authenticationEndpoint = '/api/upload/imagekit-auth';
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    return {
      publicKey,
      urlEndpoint,
      authenticationEndpoint,
    };
  } catch (error) {
    console.error('❌ Failed to get ImageKit auth params:', error.message);
    throw new Error(`Failed to get ImageKit auth params: ${error.message}`);
  }
};

/**
 * Generate authentication signature for ImageKit
 * @returns {Object} - Signature and auth parameters
 */
export const generateImageKitSignature = () => {
  try {
    const token = String(Date.now());
    const expire = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes
    
    const signature = imageKit.getAuthenticationParameters({
      token,
      expire,
    });

    return {
      ...signature,
      token,
      expire,
    };
  } catch (error) {
    console.error('❌ Failed to generate ImageKit signature:', error.message);
    throw new Error(`Failed to generate ImageKit signature: ${error.message}`);
  }
};

export default imageKit;
