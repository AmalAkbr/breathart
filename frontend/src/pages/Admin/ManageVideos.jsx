// frontend/src/pages/Admin/ManageVideos.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Edit2,
  Trash2,
  Search,
  Loader,
  Filter,
  Clock,
  Play,
  Layers,
  X,
} from "lucide-react";
import { useAllVideos, useVideoFunctions } from "../../hooks/useConvexFunctions";
import { getConvexErrorMessage } from "../../utils/convexError";
import { toast } from "../../utils/toast";
import { getVideoDurationInSecondsFromFile } from "../../utils/videoDuration";
import "../../styles/ManageVideos.css";

// Convex HTTP actions handle multipart file uploads — no Express backend
const CONVEX_SITE_URL = (import.meta.env.VITE_CONVEX_SITE_URL || "").replace(/\/$/, "");

const ManageVideos = () => {
  // Convex reactive data
  const allVideos = useAllVideos();
  const { updateVideo, deleteVideo, generateVideoUploadUrl } = useVideoFunctions();

  const convexLoading = allVideos === undefined;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    title: "",
    description: "",
    category: "tutorial",
    status: "draft",
    duration: "",
    thumbnail: "",
    videoUrl: "",
    videoKey: "",
    thumbnailFileId: "",
  });
  const [editDurationParts, setEditDurationParts] = useState({
    hours: "",
    minutes: "",
    seconds: "",
  });
  const [uploading, setUploading] = useState({
    thumbnail: false,
    video: false,
  });
  const [uploadProgress, setUploadProgress] = useState({
    video: 0,
    loaded: 0,
    total: 0,
  });
  const [uploadStage, setUploadStage] = useState("uploading");
  const isVideoUploading = uploading.video;
  const currentVideoUploadIdRef = useRef(null);
  const modalBodyRef = useRef(null);

  useEffect(() => {
    if (editModalOpen) {
      document.body.classList.add("modal-open");
      // focus the scrollable area so wheel/touch events apply
      requestAnimationFrame(() => {
        modalBodyRef.current?.focus();
      });
      return () => document.body.classList.remove("modal-open");
    }
    return undefined;
  }, [editModalOpen]);

  const toDurationParts = (totalSeconds) => {
    const total = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = Math.floor(total % 60);

    return {
      hours: hours ? String(hours) : "",
      minutes: minutes ? String(minutes) : "",
      seconds: seconds ? String(seconds) : "",
    };
  };

  const toTotalSeconds = (parts) => {
    const hours = Math.max(0, Number(parts.hours) || 0);
    const minutes = Math.max(0, Number(parts.minutes) || 0);
    const seconds = Math.max(0, Number(parts.seconds) || 0);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleEditDurationPartChange = (part, rawValue) => {
    if (rawValue && !/^\d+$/.test(rawValue)) {
      return;
    }

    const maxByPart = part === "hours" ? 999 : 59;

    setEditDurationParts((prev) => {
      const next = { ...prev, [part]: rawValue };

      if (next[part] !== "") {
        const numeric = Math.min(maxByPart, Number(next[part]) || 0);
        next[part] = String(numeric);
      }

      const total = toTotalSeconds(next);
      setEditForm((prevForm) => ({
        ...prevForm,
        duration: total > 0 ? String(total) : "",
      }));

      return next;
    });
  };

  const createUploadId = () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    return `upload_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };


  // No fetchVideos needed — useAllVideos() is reactive
  // File uploads go to Convex HTTP actions which forward to R2 / ImageKit

  // Convex reactive list replaces fetchVideos
  // convexLoading / allVideos are used directly in filteredVideos below

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }
    try {
      await deleteVideo({ videoId });
      toast.success("Video deleted");
    } catch (error) {
      const msg = getConvexErrorMessage(error, "Failed to delete video");
      toast.error(msg);
    }
  };

  const openEdit = (video) => {
    const durationSeconds = Number(video.duration) || 0;
    setEditForm({
      id: video._id || video.id,
      title: video.title || "",
      description: video.description || "",
      category: video.category || "tutorial",
      status: video.status || "published",
      duration: durationSeconds > 0 ? String(durationSeconds) : "",
      thumbnail: video.thumbnail || video.thumbnail_url || "",
      videoUrl: video.videoUrl || video.video_url || "",
      videoKey: video.videoKey || "",
      thumbnailFileId: video.thumbnailFileId || "",
    });
    setEditDurationParts(toDurationParts(durationSeconds));
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatBytes = (bytes = 0) => {
    if (!bytes || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );
    const value = bytes / 1024 ** index;
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const uploadWithProgress = (
    url,
    formDataObj,
    onProgress,
    onStageChange,
    onXhrReady,
    method = "POST",
    headers = {}
  ) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      onXhrReady?.(xhr);
      xhr.open(method, url, true);
      
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }

      xhr.upload.onloadstart = () => {
        onStageChange?.("uploading");
      };

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          onProgress({
            percent,
            loaded: event.loaded,
            total: event.total,
          });
        }
      };

      xhr.upload.onload = () => {
        onStageChange?.("processing");
      };

      xhr.onload = () => {
        onXhrReady?.(null);
        const isSuccess = xhr.status >= 200 && xhr.status < 300;
        if (isSuccess) {
          try {
            onProgress({ percent: 100, loaded: 1, total: 1 });
            onStageChange?.("completed");
            
            // AWS returns empty body on PUT. Handle it securely without JSON parse fail
            if (!xhr.responseText) return resolve({ success: true });
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            console.log(err);
            reject(new Error("Invalid response from server"));
          }
        } else {
          let message = `Upload failed (${xhr.status})`;
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed?.message) message = parsed.message;
            else if (parsed?.error) message = parsed.error;
          } catch {
            // ignore
          }
          reject(new Error(message));
        }
      };

      xhr.onerror = () => {
        onXhrReady?.(null);
        reject(new Error("Network error during upload"));
      };
      xhr.onabort = () => {
        onXhrReady?.(null);
        const cancelledError = new Error("Upload cancelled by user");
        reject(cancelledError);
      };
      xhr.send(formDataObj);
    });

  const saveEdit = async (override = {}) => {
    try {
      const safeOverride = override && override.nativeEvent ? {} : override;
      const { __silent, ...cleanOverride } = safeOverride;

      const payload = {
        videoId: editForm.id,
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        duration: editForm.duration ? Number(editForm.duration) : undefined,
        thumbnail: editForm.thumbnail,
        thumbnailFileId: editForm.thumbnailFileId || undefined,
        videoUrl: editForm.videoUrl,
        videoKey: editForm.videoKey || undefined,
        ...cleanOverride,
      };

      await updateVideo(payload);

      toast.success("Video updated");
      if (!__silent) {
        setEditModalOpen(false);
      }
    } catch (error) {
      const msg = getConvexErrorMessage(error, "Failed to update video");
      toast.error(msg);
    }
  };

  const uploadThumbnail = async (file) => {
    if (!file) return;
    try {
      setUploading((p) => ({ ...p, thumbnail: true }));
      const fd = new FormData();
      fd.append("thumbnail", file);
      const res = await fetch(
        `${CONVEX_SITE_URL}/upload/thumbnail`,
        {
          method: "POST",
          body: fd,
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Thumbnail upload failed");
      setEditForm((prev) => ({
        ...prev,
        thumbnail: data.data.thumbnailUrl,
        thumbnailFileId: data.data.fileId || prev.thumbnailFileId,
      }));
      // Persist immediately via Convex
      await saveEdit({
        thumbnail: data.data.thumbnailUrl,
        thumbnailFileId: data.data.fileId || editForm.thumbnailFileId,
        __silent: true,
      });
      toast.success("Thumbnail updated");
    } catch (err) {
      console.error("Thumbnail upload error:", err);
      toast.error(err.message || "Thumbnail upload failed");
    } finally {
      setUploading((p) => ({ ...p, thumbnail: false }));
    }
  };

  const uploadVideoFile = async (file) => {
    if (!file) return;
    try {
      setUploading((p) => ({ ...p, video: true }));
      setUploadStage("uploading");
      const uploadId = createUploadId();
      currentVideoUploadIdRef.current = uploadId;
      setUploadProgress({
        video: 0,
        loaded: 0,
        total: file.size || 0,
      });

      const shouldAutoFillDuration = !Number(editForm.duration);
      const detectedDuration = shouldAutoFillDuration
        ? await getVideoDurationInSecondsFromFile(file)
        : 0;

      // 1. Generate Presigned URL from Convex (Bypasses 20MB limits)
      const { uploadUrl, videoKey } = await generateVideoUploadUrl({
        fileName: file.name,
        fileType: file.type,
      });

      // 2. Upload actual file bytes securely direct to Cloudflare R2
      await uploadWithProgress(
        uploadUrl,
        file,
        ({ percent, loaded, total }) => {
          setUploadProgress({
            video: Math.round(percent),
            loaded,
            total,
          });
        },
        (stage) => setUploadStage(stage),
        null,
        "PUT",
        { "Content-Type": file.type }
      );

      const publicBaseUrl = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
      const videoUrl = `${publicBaseUrl}/${videoKey}`;

      setEditForm((prev) => ({
        ...prev,
        videoUrl,
        videoKey,
        duration:
          !Number(prev.duration) && detectedDuration > 0
            ? String(detectedDuration)
            : prev.duration,
      }));
      if (shouldAutoFillDuration && detectedDuration > 0) {
        setEditDurationParts(toDurationParts(detectedDuration));
      }

      // Persist immediately so the new video URL and key are saved
      const savePayload = { 
        videoUrl, 
        videoKey, 
        __silent: true 
      };
      if (shouldAutoFillDuration && detectedDuration > 0) {
        savePayload.duration = detectedDuration;
      }
      await saveEdit(savePayload);

      setUploadProgress((prev) => ({
        ...prev,
        video: 100,
      }));

      toast.success(
        shouldAutoFillDuration && detectedDuration > 0
          ? "Video updated and duration auto-filled"
          : "Video updated",
      );
    } catch (err) {
      console.error("Video upload error:", err);
      toast.error(err.message || "Video upload failed");
    } finally {
      setUploading((p) => ({ ...p, video: false }));
      setUploadStage("uploading");
      setUploadProgress({ video: 0, loaded: 0, total: 0 });
      currentVideoUploadIdRef.current = null;
    }
  };

  const videos = allVideos || [];
  const filteredVideos = videos
    .filter((video) => {
      const matchesSearch =
        (video.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (video.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (video.status || "published") === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.created_at) -
        new Date(a.createdAt || a.created_at),
    );

  if (convexLoading) {
    return (
      <div className="manage-videos-container">
        <div className="loading">
          <Loader size={40} />
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-videos-container">
      <header className="manage-videos__header">
        <div>
          <p className="eyebrow">Library</p>
          <h1>Manage Videos</h1>
          <p>Edit, filter, and prune your catalog</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <Play size={18} />
            <div>
              <p>Total</p>
              <strong>{videos.length}</strong>
            </div>
          </div>
          <div className="stat-card">
            <Clock size={18} />
            <div>
              <p>Newest</p>
              <strong>
                {videos[0]
                  ? new Date(
                      videos[0].createdAt || videos[0].created_at,
                    ).toLocaleDateString()
                  : "—"}
              </strong>
            </div>
          </div>
          <div className="stat-card">
            <Layers size={18} />
            <div>
              <p>Filtered</p>
              <strong>{filteredVideos.length}</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by title or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <div className="filter-label">
            <Filter size={16} />
            <span>Status</span>
          </div>
          {["all", "published", "draft", "archived"].map((status) => (
            <button
              key={status}
              className={`chip ${statusFilter === status ? "chip--active" : ""}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="no-videos">
          <p>No videos match that filter.</p>
          <small>Try another keyword or status.</small>
        </div>
      ) : (
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <article key={video._id || video.id} className="video-card">
              <div className="video-thumb-wrap">
                <img
                  src={video.thumbnail || video.thumbnail_url}
                  alt={video.title}
                />
                <span className={`pill pill--${video.status || "published"}`}>
                  {video.status || "published"}
                </span>
              </div>

              <div className="video-meta">
                <div>
                  <p className="video-title">{video.title}</p>
                  <p className="video-desc">
                    {video.description?.substring(0, 120) || "No description."}
                  </p>
                </div>
                <div className="meta-row">
                  <span className="badge">
                    {video.category || "uncategorized"}
                  </span>
                  <span className="muted">
                    {video.duration ? `${video.duration}s` : "Duration N/A"}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="muted">
                    Created{" "}
                    {new Date(
                      video.createdAt || video.created_at,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="ghost-btn"
                  onClick={() => openEdit(video)}
                  title="Edit"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  className="ghost-btn danger"
                  onClick={() => handleDelete(video._id || video.id)}
                  title="Delete"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editModalOpen && (
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Video</h3>
              <button
                className="icon-btn"
                onClick={() => setEditModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div
              className="modal-body"
              ref={modalBodyRef}
              tabIndex={0}
              onWheel={(e) => e.stopPropagation()}
            >
              <label className="modal-field">
                <span>Title</span>
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                />
              </label>
              <label className="modal-field">
                <span>Description</span>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={3}
                />
              </label>
              <label className="modal-field">
                <span>Thumbnail URL</span>
                <input
                  name="thumbnail"
                  value={editForm.thumbnail}
                  onChange={handleEditChange}
                  placeholder="https://...image.webp"
                />
                <div className="inline-upload">
                  <input
                    type="file"
                    id="thumb-file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => uploadThumbnail(e.target.files?.[0])}
                  />
                  {uploading.thumbnail && (
                    <span className="muted">Uploading...</span>
                  )}
                </div>
              </label>
              <label className="modal-field">
                <span>Video File</span>
                {editForm.videoUrl ? (
                  <div style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "12px",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px"
                  }}>
                    <span style={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      flex: 1
                    }}>
                      {editForm.videoKey || editForm.videoUrl.split("/").pop()}
                    </span>
                    <a
                      href={editForm.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ghost-btn"
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        textDecoration: "none",
                        color: "var(--accent)"
                      }}
                    >
                      View
                    </a>
                  </div>
                ) : (
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", fontStyle: "italic" }}>
                    No video file uploaded yet.
                  </div>
                )}
                <div className="inline-upload">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/x-msvideo,video/quicktime"
                    onChange={(e) => uploadVideoFile(e.target.files?.[0])}
                    disabled={uploading.video}
                  />
                  {uploading.video && (
                    <div className="upload-progress-compact">
                      <div className="progress-bar-mini">
                        <div
                          className="progress-fill"
                          style={{ width: `${uploadProgress.video}%` }}
                        />
                      </div>
                      <span className="muted text-xs">
                        {uploadProgress.video}% - {uploadStage}
                      </span>
                      {uploadProgress.total > 0 && (
                        <span className="muted text-xs">
                          {(uploadProgress.loaded / 1024 / 1024).toFixed(1)}MB /{" "}
                          {(uploadProgress.total / 1024 / 1024).toFixed(1)}MB
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </label>
              <div className="modal-grid">
                <label className="modal-field">
                  <span>Category</span>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                  >
                    <option value="tutorial">Tutorial</option>
                    <option value="lecture">Lecture</option>
                    <option value="demo">Demo</option>
                    <option value="interview">Interview</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="modal-field">
                  <span>Status</span>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="modal-field">
                  <span>Duration (H : M : S)</span>
                  <div className="duration-parts duration-parts--compact">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="HH"
                      value={editDurationParts.hours}
                      onChange={(e) =>
                        handleEditDurationPartChange("hours", e.target.value)
                      }
                      className="duration-part"
                    />
                    <span className="duration-sep">:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM"
                      value={editDurationParts.minutes}
                      onChange={(e) =>
                        handleEditDurationPartChange("minutes", e.target.value)
                      }
                      className="duration-part"
                    />
                    <span className="duration-sep">:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="SS"
                      value={editDurationParts.seconds}
                      onChange={(e) =>
                        handleEditDurationPartChange("seconds", e.target.value)
                      }
                      className="duration-part"
                    />
                  </div>
                  <small className="muted">
                    Stored as {editForm.duration || 0} seconds
                  </small>
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="ghost-btn"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn-save" onClick={() => saveEdit()}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {isVideoUploading && (
        <div className="upload-overlay" role="status" aria-live="polite">
          <div className="upload-overlay__panel">
            <Loader className="spin" size={28} />
            <div className="upload-overlay__content">
              <p className="upload-title">Uploading video…</p>
              <p className="upload-hint">
                {uploadStage === "processing"
                  ? "Upload complete. Processing and saving on server..."
                  : "Please wait — controls are locked while we save your file."}
              </p>
              <div className="upload-progress-track" aria-hidden="true">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${uploadProgress.video}%` }}
                />
              </div>
              <div className="upload-progress-meta">
                <span>{uploadProgress.video}%</span>
                <span>
                  {formatBytes(uploadProgress.loaded)} /{" "}
                  {formatBytes(uploadProgress.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVideos;
