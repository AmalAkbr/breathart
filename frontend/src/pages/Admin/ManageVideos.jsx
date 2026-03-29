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
import { getAuthToken } from "../../utils/apiClient";
import { toast } from "../../utils/toast";
import { getVideoDurationInSecondsFromFile } from "../../utils/videoDuration";
import { io } from "socket.io-client";
import "../../styles/ManageVideos.css";

const ManageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const socketRef = useRef(null);
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

  const getSocketServerUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
    return apiUrl.replace(/\/api\/?$/, "");
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

  const mapClientProgressToUi = (percent) => {
    const clamped = Math.max(0, Math.min(100, percent));
    return Math.round((clamped / 100) * 45);
  };

  const mapR2ProgressToUi = (percent) => {
    const clamped = Math.max(0, Math.min(100, percent));
    return Math.min(99, 45 + Math.round((clamped / 100) * 54));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Setup Socket.IO for upload progress tracking
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      return undefined;
    }

    const socket = io(getSocketServerUrl(), {
      transports: ["websocket", "polling"],
      auth: { token },
      withCredentials: true,
    });

    socketRef.current = socket;

    const onStage = (payload = {}) => {
      if (
        !payload.uploadId ||
        payload.uploadId !== currentVideoUploadIdRef.current
      ) {
        return;
      }

      if (payload.stage === "r2_uploading") {
        setUploadStage("processing");
      } else if (payload.stage === "cancelled") {
        setUploadStage("cancelled");
      }
    };

    const onProgress = (payload = {}) => {
      if (
        !payload.uploadId ||
        payload.uploadId !== currentVideoUploadIdRef.current
      ) {
        return;
      }

      if (payload.phase !== "r2") {
        return;
      }

      const backendPercent = Number(payload.percent) || 0;
      const mapped = mapR2ProgressToUi(backendPercent);

      setUploadStage("processing");
      setUploadProgress({
        loaded: Number(payload.loaded) || 0,
        total: Number(payload.total) || 0,
        video: mapped,
      });
    };

    const onCompleted = (payload = {}) => {
      if (
        !payload.uploadId ||
        payload.uploadId !== currentVideoUploadIdRef.current
      ) {
        return;
      }

      setUploadStage("completed");
      setUploadProgress((prev) => ({
        ...prev,
        video: Math.max(prev.video, 99),
      }));
    };

    const onError = (payload = {}) => {
      if (
        !payload.uploadId ||
        payload.uploadId !== currentVideoUploadIdRef.current
      ) {
        return;
      }

      setUploadStage("error");
      if (payload.message) {
        toast.error(payload.message);
      }
    };

    socket.on("upload:stage", onStage);
    socket.on("upload:progress", onProgress);
    socket.on("upload:completed", onCompleted);
    socket.on("upload:error", onError);

    return () => {
      socket.off("upload:stage", onStage);
      socket.off("upload:progress", onProgress);
      socket.off("upload:completed", onCompleted);
      socket.off("upload:error", onError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/videos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch videos");

      const data = await response.json();
      const list = data.data || data.videos || [];
      setVideos(list);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const token = getAuthToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/videos/${videoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to delete video");

      setVideos((prev) => prev.filter((v) => (v._id || v.id) !== videoId));
      toast.success("Video deleted");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
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
    token,
    onProgress,
    onStageChange,
  ) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onloadstart = () => {
        onStageChange?.("uploading");
      };

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;

        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress?.({
          percent,
          loaded: event.loaded,
          total: event.total,
        });
      };

      xhr.upload.onload = () => {
        onStageChange?.("processing");
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            onStageChange?.("completed");
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error("Invalid response from server"));
          }
          return;
        }

        let message = `Upload failed (${xhr.status})`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed?.error) {
            message = parsed.error;
          }
        } catch {
          // Ignore JSON parse errors and keep default message
        }
        reject(new Error(message));
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formDataObj);
    });

  const saveEdit = async (override = {}) => {
    try {
      const safeOverride = override && override.nativeEvent ? {} : override;
      const token = getAuthToken();
      const payload = {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        status: editForm.status,
        duration: editForm.duration ? Number(editForm.duration) : undefined,
        thumbnail: editForm.thumbnail,
        thumbnailFileId: editForm.thumbnailFileId,
        videoUrl: editForm.videoUrl,
        ...safeOverride,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/videos/${editForm.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to update video");
      }

      const updated = data.data || data.video || payload;
      setVideos((prev) =>
        prev.map((v) =>
          v._id === editForm.id || v.id === editForm.id
            ? { ...v, ...updated }
            : v,
        ),
      );

      toast.success("Video updated");
      if (!safeOverride.__silent) {
        setEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error(error.message || "Failed to update video");
    }
  };

  const uploadThumbnail = async (file) => {
    if (!file) return;
    try {
      setUploading((p) => ({ ...p, thumbnail: true }));
      const token = getAuthToken();
      const fd = new FormData();
      fd.append("thumbnail", file);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/upload/thumbnail`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
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
      // Persist immediately
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

      const token = getAuthToken();
      const fd = new FormData();
      fd.append("video", file);
      fd.append("title", editForm.title || "video");
      fd.append("uploadId", uploadId);

      // Subscribe to upload progress via socket
      if (socketRef.current?.connected) {
        socketRef.current.emit("upload:subscribe", { uploadId });
      }

      const shouldAutoFillDuration = !Number(editForm.duration);
      const detectedDuration = shouldAutoFillDuration
        ? await getVideoDurationInSecondsFromFile(file)
        : 0;

      const data = await uploadWithProgress(
        `${import.meta.env.VITE_API_URL}/upload/video-file`,
        fd,
        token,
        ({ percent, loaded, total }) => {
          const mapped = mapClientProgressToUi(percent);
          setUploadProgress({
            video: Math.min(mapped, 45),
            loaded,
            total,
          });
        },
        (stage) => setUploadStage(stage),
      );

      if (!data?.success) {
        throw new Error(data?.error || "Video upload failed");
      }

      setEditForm((prev) => ({
        ...prev,
        videoUrl: data.data.videoUrl,
        duration:
          !Number(prev.duration) && detectedDuration > 0
            ? String(detectedDuration)
            : prev.duration,
      }));
      if (shouldAutoFillDuration && detectedDuration > 0) {
        setEditDurationParts(toDurationParts(detectedDuration));
      }

      // Persist immediately so the new video URL is saved
      const savePayload = { videoUrl: data.data.videoUrl, __silent: true };
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

  if (loading) {
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
                <span>Video URL</span>
                <input
                  name="videoUrl"
                  value={editForm.videoUrl}
                  onChange={handleEditChange}
                  placeholder="https://...video.mp4"
                />
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
