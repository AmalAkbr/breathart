// frontend/src/pages/Admin/UploadVideo.jsx
import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, FileVideo, Image as ImageIcon, Link2 } from 'lucide-react';
import { getAuthToken } from '../../utils/apiClient';
import { toast } from '../../utils/toast';
import '../../styles/UploadVideo.css';

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tutorial',
    duration: '',
  });

  const [files, setFiles] = useState({ thumbnail: null, video: null });
  const [uploadedUrls, setUploadedUrls] = useState({ thumbnailUrl: '', thumbnailFileId: '', videoUrl: '' });
  const [urlInputs, setUrlInputs] = useState({ thumbnail: '', video: '' });
  const [previews, setPreviews] = useState({ thumbnail: '', video: '' });
  const [uploading, setUploading] = useState({ thumbnail: false, video: false });
  const [progress, setProgress] = useState({ thumbnail: 0, video: 0 });
  const [thumbnailMode, setThumbnailMode] = useState('upload'); // upload | url
  const [videoMode, setVideoMode] = useState('upload'); // upload | url
  const [dragActive, setDragActive] = useState({ thumbnail: false, video: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isBusy = loading || uploading.thumbnail || uploading.video;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileSelect = (e, fileType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (fileType === 'thumbnail') {
      const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 10 * 1024 * 1024;
      if (!validMimes.includes(file.type)) return setError('Thumbnail must be JPG, PNG, or WebP');
      if (file.size > maxSize) return setError('Thumbnail must be less than 10MB');
    }

    if (fileType === 'video') {
      const validMimes = ['video/mp4', 'video/webm', 'video/x-msvideo', 'video/quicktime'];
      const maxSize = 500 * 1024 * 1024;
      if (!validMimes.includes(file.type)) return setError('Video must be MP4, WebM, AVI, or MOV');
      if (file.size > maxSize) return setError('Video must be less than 500MB');
    }

    setFiles(prev => ({ ...prev, [fileType]: file }));
    if (fileType === 'thumbnail') {
      setPreviews(prev => ({ ...prev, thumbnail: URL.createObjectURL(file) }));
      setUploadedUrls(prev => ({ ...prev, thumbnailUrl: '', thumbnailFileId: '' }));
    }
    if (fileType === 'video') {
      setPreviews(prev => ({ ...prev, video: URL.createObjectURL(file) }));
      setUploadedUrls(prev => ({ ...prev, videoUrl: '' }));
    }
  };

  const handleUrlChange = (e, type) => {
    const value = e.target.value;
    setUrlInputs(prev => ({ ...prev, [type]: value }));
    setError(null);

    if (type === 'thumbnail') {
      setFiles(prev => ({ ...prev, thumbnail: null }));
      setUploadedUrls(prev => ({ ...prev, thumbnailUrl: '', thumbnailFileId: '' }));
      setPreviews(prev => ({ ...prev, thumbnail: value }));
      setProgress(prev => ({ ...prev, thumbnail: 0 }));
    }
    if (type === 'video') {
      setFiles(prev => ({ ...prev, video: null }));
      setUploadedUrls(prev => ({ ...prev, videoUrl: '' }));
      setPreviews(prev => ({ ...prev, video: '' }));
      setProgress(prev => ({ ...prev, video: 0 }));
    }
  };

  const uploadWithProgress = (url, formDataObj, token, onProgress) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (err) {
            console.log(err)
          reject(new Error('Invalid response from server'));
        }
      } else {
        let message = `Upload failed (${xhr.status})`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed?.error) message = parsed.error;
        } catch (err) {
            console.log(err)
          // ignore
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formDataObj);
  });

  const uploadThumbnail = async () => {
    if (thumbnailMode === 'url') {
      if (!urlInputs.thumbnail.trim()) {
        setError('Please provide a thumbnail URL');
        return { success: false, url: null };
      }
      setUploadedUrls(prev => ({ ...prev, thumbnailUrl: urlInputs.thumbnail.trim() }));
      return { success: true, url: urlInputs.thumbnail.trim() };
    }

    if (!files.thumbnail) {
      setError('Please select a thumbnail image');
      return { success: false, url: null };
    }

    try {
      setUploading(prev => ({ ...prev, thumbnail: true }));
      setProgress(prev => ({ ...prev, thumbnail: 0 }));
      const token = getAuthToken();

      const formDataObj = new FormData();
      formDataObj.append('thumbnail', files.thumbnail);

      const data = await uploadWithProgress(
        `${import.meta.env.VITE_API_URL}/upload/thumbnail`,
        formDataObj,
        token,
        (pct) => setProgress(prev => ({ ...prev, thumbnail: pct }))
      );

      const thumbUrl = data.data.thumbnailUrl;
      const fileId = data.data.fileId || '';
      console.log('🖼️ Thumbnail uploaded to ImageKit:', thumbUrl);
      setUploadedUrls(prev => ({ ...prev, thumbnailUrl: thumbUrl, thumbnailFileId: fileId }));
      setPreviews(prev => ({ ...prev, thumbnail: thumbUrl }));
      return { success: true, url: thumbUrl, fileId };
    } catch (err) {
      console.error('❌ Thumbnail upload failed:', err.message);
      setError(err.message);
      toast.error(err.message || 'Thumbnail upload failed');
      return { success: false, url: null, fileId: null };
    } finally {
      setUploading(prev => ({ ...prev, thumbnail: false }));
    }
  };

  const uploadVideo = async () => {
    if (videoMode === 'url') {
      if (!urlInputs.video.trim()) {
        setError('Please provide a video URL');
        return { success: false, url: null };
      }
      setUploadedUrls(prev => ({ ...prev, videoUrl: urlInputs.video.trim() }));
      return { success: true, url: urlInputs.video.trim() };
    }

    if (!files.video) {
      setError('Please select a video file');
      return { success: false, url: null };
    }

    try {
      setUploading(prev => ({ ...prev, video: true }));
      setProgress(prev => ({ ...prev, video: 0 }));
      const token = getAuthToken();

      const formDataObj = new FormData();
      formDataObj.append('video', files.video);
      formDataObj.append('title', formData.title);

      const data = await uploadWithProgress(
        `${import.meta.env.VITE_API_URL}/upload/video-file`,
        formDataObj,
        token,
        (pct) => setProgress(prev => ({ ...prev, video: pct }))
      );

      const videoUrl = data.data.videoUrl;
      console.log('🎬 Video uploaded to R2:', videoUrl);
      setUploadedUrls(prev => ({ ...prev, videoUrl: videoUrl }));
      return { success: true, url: videoUrl };
    } catch (err) {
      console.error('❌ Video upload failed:', err.message);
      setError(err.message);
      toast.error(err.message || 'Video upload failed');
      return { success: false, url: null, fileId: null };
    } finally {
      setUploading(prev => ({ ...prev, video: false }));
    }
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const event = { target: { files: droppedFiles } };
      handleFileSelect(event, type);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 Starting upload process...');

    let thumbUrl = uploadedUrls.thumbnailUrl || '';
    let thumbFileId = uploadedUrls.thumbnailFileId || '';
    let videoUrl = uploadedUrls.videoUrl || '';

    // Upload files if they exist and haven't been uploaded yet
    if (thumbnailMode === 'upload' && files.thumbnail && !uploadedUrls.thumbnailUrl) {
      console.log('📸 Uploading thumbnail...');
      const result = await uploadThumbnail();
      if (!result.success) {
        console.error('❌ Thumbnail upload failed');
        return;
      }
      thumbUrl = result.url;
      thumbFileId = result.fileId || thumbFileId;
    }
    if (videoMode === 'upload' && files.video && !uploadedUrls.videoUrl) {
      console.log('🎬 Uploading video...');
      const result = await uploadVideo();
      if (!result.success) {
        console.error('❌ Video upload failed');
        return;
      }
      videoUrl = result.url;
    }

    // Validate using the actual URLs we now have
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    const finalThumb = thumbUrl || urlInputs.thumbnail.trim();
    const finalThumbFileId = thumbFileId;
    const finalVideo = videoUrl || urlInputs.video.trim();

    if (!finalThumb) {
      setError('Please provide a thumbnail');
      console.error('❌ No thumbnail URL available');
      return;
    }
    if (!finalVideo) {
      setError('Please provide a video');
      console.error('❌ No video URL available');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getAuthToken();
      if (!token) {
        console.error('🔴 No auth token found in localStorage');
        throw new Error('Session expired. Please login again.');
      }

      console.log('💾 Saving to database:', { 
        title: formData.title,
        category: formData.category,
        thumbnailUrl: finalThumb.substring(0, 50) + '...',
        videoUrl: finalVideo.substring(0, 50) + '...',
        tokenPresent: !!token,
        tokenLength: token?.length
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          thumbnailUrl: finalThumb,
          thumbnailFileId: finalThumbFileId,
          videoUrl: finalVideo,
          duration: parseInt(formData.duration) || null,
        }),
      });

      console.log(`📡 Database save response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          console.error('🔴 Authentication failed (401):', errorData);
          throw new Error('Session expired. Please login again.');
        }
        
        if (response.status === 403) {
          console.error('🔴 Authorization failed (403) - Not admin:', errorData);
          throw new Error('You do not have admin privileges to upload videos.');
        }
        
        console.error('🔴 Server error:', errorData);
        throw new Error(errorData.error || 'Failed to create video');
      }

      const result = await response.json();
      console.log('✅ Video saved to database:', result);

      setSuccess(true);
      toast.success('Video uploaded successfully');
      
      // Clear form and uploads
      setFormData({ title: '', description: '', category: 'tutorial', duration: '' });
      setFiles({ thumbnail: null, video: null });
      setUploadedUrls({ thumbnailUrl: '', thumbnailFileId: '', videoUrl: '' });
      setUrlInputs({ thumbnail: '', video: '' });
      setPreviews({ thumbnail: '', video: '' });
      setProgress({ thumbnail: 0, video: 0 });
      setThumbnailMode('upload');
      setVideoMode('upload');
      setDragActive({ thumbnail: false, video: false });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('❌ Submission error:', err.message);
      setError(err.message);
      toast.error(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-video-container">

      <header className="upload-video__header">
        <div className="upload-video__icon">
          <Upload size={32} />
        </div>
        <div className="header-text">
          <h1>Upload Video</h1>
          <p>Add a new video to the platform</p>
        </div>
      </header>

      <form className="upload-video__form" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert--error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert--success">
            <CheckCircle size={20} />
            <span>Video uploaded successfully!</span>
          </div>
        )}
        <div className="details-grid">
          <div className="form-group">
            <label htmlFor="title">
              Title *<span className="required">Required</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter video title"
              disabled={isBusy}
              maxLength={200}
            />
            <small>{formData.title.length}/200 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description *<span className="required">Required</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter detailed description"
              disabled={isBusy}
              rows={3}
              maxLength={1000}
            />
            <small>{formData.description.length}/1000 characters</small>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="category">Video Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isBusy}
              >
                <option value="tutorial">Tutorial</option>
                <option value="lecture">Lecture</option>
                <option value="demo">Demo</option>
                <option value="interview">Interview</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group half">
              <label htmlFor="duration">
                Duration (seconds) - Optional
                <span className="optional">Leave blank if unknown</span>
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 300"
                disabled={isBusy}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="upload-grid">
          {/* Thumbnail */}
          <div className="form-group">
            <label>Thumbnail Image *</label>
            <div className="upload-card">
              <div className="upload-card__header">
                <div className="upload-card__icon"><ImageIcon size={20} /></div>
                <div>
                  <div className="upload-card__title">Thumbnail</div>
                  <div className="upload-card__subtitle">Upload a file or paste an image URL</div>
                </div>
              </div>

              <div className="toggle-row">
                <button
                  type="button"
                  className={`toggle-btn ${thumbnailMode === 'upload' ? 'active' : ''}`}
                  onClick={() => { setThumbnailMode('upload'); setUrlInputs(prev => ({ ...prev, thumbnail: '' })); setUploadedUrls(prev => ({ ...prev, thumbnailUrl: '' })); setPreviews(prev => ({ ...prev, thumbnail: '' })); }}
                  disabled={isBusy}
                >Upload File</button>
                <button
                  type="button"
                  className={`toggle-btn ${thumbnailMode === 'url' ? 'active' : ''}`}
                  onClick={() => { setThumbnailMode('url'); setFiles(prev => ({ ...prev, thumbnail: null })); setUploadedUrls(prev => ({ ...prev, thumbnailUrl: '' })); setPreviews(prev => ({ ...prev, thumbnail: '' })); setProgress(prev => ({ ...prev, thumbnail: 0 })); }}
                  disabled={isBusy}
                >Use URL</button>
              </div>

              {thumbnailMode === 'upload' && (
                <label
                  className={`upload-zone ${dragActive.thumbnail ? 'drag-active' : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'thumbnail')}
                  onDragLeave={(e) => handleDragLeave(e, 'thumbnail')}
                  onDrop={(e) => handleDrop(e, 'thumbnail')}
                >
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => handleFileSelect(e, 'thumbnail')}
                    disabled={isBusy}
                  />
                  <div className="upload-zone__text">
                    {dragActive.thumbnail ? '📦 Drop here' : files.thumbnail ? files.thumbnail.name : 'Click or drag file to upload'}
                  </div>
                </label>
              )}

              {thumbnailMode === 'url' && (
                <div className="url-input-row">
                  <Link2 size={16} />
                  <input
                    type="url"
                    placeholder="https://...image.webp"
                    value={urlInputs.thumbnail}
                    onChange={(e) => handleUrlChange(e, 'thumbnail')}
                    disabled={isBusy}
                  />
                </div>
              )}

              {uploading.thumbnail && (
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${progress.thumbnail}%` }} />
                  <span>{progress.thumbnail}%</span>
                </div>
              )}

              {uploadedUrls.thumbnailUrl && !uploading.thumbnail && !loading && (
                <div className="upload-success">Thumbnail ready</div>
              )}

              {previews.thumbnail && !uploading.thumbnail && !uploading.video && !loading && (
                <div className="preview">
                  <img src={previews.thumbnail} alt="Thumbnail preview" />
                </div>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="form-group">
            <label>Video *</label>
            <div className="upload-card">
              <div className="upload-card__header">
                <div className="upload-card__icon"><FileVideo size={20} /></div>
                <div>
                  <div className="upload-card__title">Video</div>
                  <div className="upload-card__subtitle">Upload video file (MP4, WebM, AVI, MOV)</div>
                </div>
              </div>

              {videoMode === 'upload' && (
                <label
                  className={`upload-zone ${dragActive.video ? 'drag-active' : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'video')}
                  onDragLeave={(e) => handleDragLeave(e, 'video')}
                  onDrop={(e) => handleDrop(e, 'video')}
                >
                  <input
                    type="file"
                    accept="video/mp4, video/webm, video/x-msvideo, video/quicktime"
                    onChange={(e) => handleFileSelect(e, 'video')}
                    disabled={isBusy}
                  />
                  <div className="upload-zone__text">
                    {dragActive.video ? '📦 Drop here' : files.video ? files.video.name : 'Click or drag file to upload'}
                  </div>
                </label>
              )}

              {uploading.video && (
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${progress.video}%` }} />
                  <span>{progress.video}%</span>
                </div>
              )}

              {uploadedUrls.videoUrl && !uploading.video && !loading && (
                <div className="upload-success">Video ready</div>
              )}

              {previews.video && videoMode === 'upload' && !uploading.thumbnail && !uploading.video && !loading && (
                <div className="preview">
                  <video src={previews.video} controls width="100%" />
                </div>
              )}
            </div>
          </div>

          <div className="action-card">
            <p className="muted">Ready to publish?</p>
            <button type="submit" className="btn btn--primary" disabled={isBusy}>
              {isBusy ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadVideo;