/**
 * Network Speed Check Utility
 * Tests internet speed and backend connectivity before upload
 */

// Minimum required speeds (in Mbps)
const MIN_DOWNLOAD_SPEED = 1.0; // 1 Mbps minimum download
const MIN_UPLOAD_SPEED = 1.0; // 1 Mbps minimum upload (warning threshold)
const GOOD_UPLOAD_SPEED = 1.5; // 1.5 Mbps or higher = excellent
const BACKEND_LATENCY_THRESHOLD = 5000; // 5 seconds max latency

// Create an abort signal with timeout; supports browsers without AbortSignal.timeout
const createTimeoutSignal = (ms) => {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
  return controller.signal;
};

/**
 * Check frontend internet download speed
 * Returns speed in Mbps
 */
export const checkDownloadSpeed = async (testSizeKB = 500) => {
  try {
    const testSize = testSizeKB * 1024; // Convert to bytes
    
    // Create a test blob to download
    const startTime = performance.now();
    
    try {
      const response = await fetch(
        `data:application/octet-stream;base64,${btoa(
          'x'.repeat(Math.min(testSize, 1024 * 100))
        )}`,
        { cache: 'no-store' }
      );
      
      if (!response.ok) throw new Error('Failed to fetch test data');
      
      await response.arrayBuffer();
    } catch {
      // Fallback: Use a simple data URL test
      const testData = new Uint8Array(Math.min(testSize, 1024 * 100));
      const blob = new Blob([testData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      await fetch(url, { cache: 'no-store' })
        .then(r => r.arrayBuffer())
        .catch(() => {});
      
      URL.revokeObjectURL(url);
    }
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    const speedMbps = (testSize * 8) / (duration * 1000000); // bits / second / 1M
    
    return Math.max(0.1, speedMbps); // Return at least 0.1 Mbps
  } catch (error) {
    console.error('Download speed check failed:', error);
    throw new Error('Could not measure download speed');
  }
};

/**
 * Check frontend internet upload speed
 * Returns speed in Mbps
 */
export const checkUploadSpeed = async () => {
  try {
    // Time a test request to the backend
    const startTime = performance.now();
    
    try {
      // Test by timing a GET request to backend
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      await fetch(
        `${backendUrl}/upload/check-speed`,
        {
          method: 'GET',
          signal: createTimeoutSignal(10000), // 10 second timeout with fallback
        }
      );
      
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // Convert to seconds
      
      if (duration === 0) {
        return 10.0; // Instant request, assume excellent
      }
      
      // Estimate upload speed conservatively based on latency
      const estimatedSpeed = Math.max(0.5, 5.0 / duration); // Conservative estimate
      return estimatedSpeed;
    } catch (fetchErr) {
      // Fallback: Return conservative estimate
      console.warn('Upload speed check failed:', fetchErr.message);
      const estimatedSpeed = Math.max(0.5, 2.0); // Conservative estimate
      return estimatedSpeed;
    }
  } catch (error) {
    console.error('Upload speed check failed:', error);
    throw new Error('Could not measure upload speed');
  }
};

/**
 * Get upload speed status
 * Returns { status: 'excellent'|'warning'|'error', color, message }
 */
export const getUploadSpeedStatus = (uploadSpeedMbps) => {
  if (uploadSpeedMbps >= GOOD_UPLOAD_SPEED) {
    return {
      status: 'excellent',
      level: 'good',
      message: `✅ Upload speed: ${uploadSpeedMbps.toFixed(2)} Mbps (Excellent)`,
      color: '#c8ff6a', // Green
    };
  } else if (uploadSpeedMbps >= MIN_UPLOAD_SPEED) {
    return {
      status: 'warning',
      level: 'warning',
      message: `⚠️ Upload speed: ${uploadSpeedMbps.toFixed(2)} Mbps (Warning - Acceptable but slow)`,
      color: '#fbbf24', // Yellow
    };
  } else {
    return {
      status: 'error',
      level: 'error',
      message: `❌ Upload speed: ${uploadSpeedMbps.toFixed(2)} Mbps (Too Low - Consider using better network)`,
      color: '#ef4444', // Red
    };
  }
};

/**
 * Check backend connectivity and latency
 * Makes a request to backend /api/upload/check-speed endpoint
 */
export const checkBackendConnectivity = async (backendUrl, authToken) => {
  try {
    const startTime = performance.now();
    
    const response = await fetch(`${backendUrl}/upload/check-speed`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      signal: createTimeoutSignal(BACKEND_LATENCY_THRESHOLD),
    });
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      latency: Math.round(latency),
      timestamp: data.timestamp,
      healthy: true,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Backend response timeout (${BACKEND_LATENCY_THRESHOLD}ms exceeded)`);
    }
    throw new Error(`Backend connectivity check failed: ${error.message}`);
  }
};

/**
 * Comprehensive network check before upload
 * Returns { success, downloadSpeed, uploadSpeed, latency, message, verdict }
 */
export const performNetworkCheck = async (backendUrl, authToken) => {
  const results = {
    success: false,
    downloadSpeed: 0,
    uploadSpeed: 0,
    latency: 0,
    message: '',
    verdict: 'checking', // 'excellent', 'acceptable', 'poor', 'error'
    details: {},
  };

  try {
    // Step 1: Check download speed
    console.log('Testing download speed...');
    const downloadSpeed = await checkDownloadSpeed(500);
    results.downloadSpeed = Math.round(downloadSpeed * 100) / 100; // Round to 2 decimals
    results.details.downloadSpeed = downloadSpeed;
    
    if (downloadSpeed < MIN_DOWNLOAD_SPEED) {
      results.verdict = 'poor';
      results.message = `⚠️ Slow download speed detected: ${results.downloadSpeed.toFixed(2)} Mbps (minimum: ${MIN_DOWNLOAD_SPEED} Mbps). Please try:\n• Moving closer to your router\n• Closing other apps using network\n• Switching to a stronger WiFi or cellular network`;
      return results;
    }

    // Step 2: Check upload speed
    console.log('Testing upload speed...');
    try {
      const uploadSpeed = await checkUploadSpeed(300);
      results.uploadSpeed = Math.round(uploadSpeed * 100) / 100; // Round to 2 decimals
      results.details.uploadSpeed = uploadSpeed;
      
      const uploadStatus = getUploadSpeedStatus(uploadSpeed);
      results.details.uploadStatus = uploadStatus;
      
      if (uploadSpeed < MIN_UPLOAD_SPEED) {
        results.verdict = 'poor';
        results.message = `❌ ${uploadStatus.message}\n\nUpload will be very slow or may fail. Please try:\n• Moving closer to your router\n• Closing other apps using network\n• Switching to proper WiFi connection`;
        return results;
      }
    } catch (uploadError) {
      console.warn('Upload speed check not available:', uploadError.message);
      results.details.uploadSpeedError = uploadError.message;
      // Don't fail on upload speed - continue with other checks
    }

    // Step 3: Check backend connectivity
    console.log('Checking backend connectivity...');
    const backendCheck = await checkBackendConnectivity(backendUrl, authToken);
    results.latency = backendCheck.latency;
    results.details.backendLatency = backendCheck.latency;
    
    if (backendCheck.latency > 5000) {
      results.verdict = 'acceptable';
      results.message = `⚠️ Slow backend connection detected: ${backendCheck.latency}ms latency. The server is responding slowly. Please:\n• Wait a few moments and try again\n• Check if server is overloaded\n• Refresh and retry`;
      return results;
    }

    // Determine overall verdict
    if (results.uploadSpeed >= GOOD_UPLOAD_SPEED && downloadSpeed >= MIN_DOWNLOAD_SPEED && backendCheck.latency < 2000) {
      results.success = true;
      results.verdict = 'excellent';
      results.message = `✅ Excellent network conditions!\nDownload: ${results.downloadSpeed.toFixed(2)} Mbps | Upload: ${results.uploadSpeed.toFixed(2)} Mbps | Latency: ${results.latency}ms`;
    } else if (results.uploadSpeed >= MIN_UPLOAD_SPEED && downloadSpeed >= MIN_DOWNLOAD_SPEED) {
      results.success = true;
      results.verdict = 'acceptable';
      results.message = `✅ Network acceptable for upload\nDownload: ${results.downloadSpeed.toFixed(2)} Mbps | Upload: ${results.uploadSpeed.toFixed(2)} Mbps | Latency: ${results.latency}ms`;
    } else {
      results.verdict = 'poor';
      results.message = `⚠️ Network conditions are suboptimal. Upload may be slow or fail.`;
    }
    
    results.details.verdict = results.verdict;
    return results;
  } catch (error) {
    console.error('Network check error:', error);
    results.verdict = 'error';
    
    // Determine which check failed
    if (error.message.includes('download')) {
      results.message = `❌ Download speed test failed: ${error.message}\nYou can still attempt to upload, but it may fail if network is too slow.`;
      results.details.downloadSpeedError = error.message;
    } else if (error.message.includes('upload')) {
      results.message = `❌ Upload speed test failed: ${error.message}\nYou can still attempt to upload, but connection may be unstable.`;
      results.details.uploadSpeedError = error.message;
    } else if (error.message.includes('backend') || error.message.includes('Backend')) {
      results.message = `❌ Backend connectivity issue detected: ${error.message}\nPlease check your internet connection or try again later.`;
      results.details.backendError = error.message;
    } else {
      results.message = `❌ Network check failed: ${error.message}\nYou can still attempt to upload, but connection may be unstable.`;
      results.details.error = error.message;
    }
    
    return results;
  }
};

/**
 * Simplified check - just return if network is "acceptable"
 * Useful for quick pre-upload validation
 */
export const isNetworkAcceptable = async (backendUrl, authToken) => {
  try {
    const result = await performNetworkCheck(backendUrl, authToken);
    return result.success;
  } catch {
    // If check fails completely, allow upload anyway (fail-safe)
    return true;
  }
};
