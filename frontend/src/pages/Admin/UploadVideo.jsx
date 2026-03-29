// frontend/src/pages/Admin/UploadVideo.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  FileVideo,
  Image as ImageIcon,
  Link2,
  Loader,
} from "lucide-react";
import { io } from "socket.io-client";
import { getAuthToken } from "../../utils/apiClient";
import { toast } from "../../utils/toast";
import { getVideoDurationInSecondsFromFile } from "../../utils/videoDuration";
import "../../styles/UploadVideo.css";

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "tutorial",
    duration: "",
  });
  const [durationParts, setDurationParts] = useState({
    hours: "",
    minutes: "",
    seconds: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: "",
    video: "",
  });

  const [files, setFiles] = useState({ thumbnail: null, video: null });
  const [uploadedUrls, setUploadedUrls] = useState({
    thumbnailUrl: "",
    thumbnailFileId: "",
    videoUrl: "",
  });
  const [urlInputs, setUrlInputs] = useState({ thumbnail: "", video: "" });
  const [previews, setPreviews] = useState({ thumbnail: "", video: "" });
  const [uploading, setUploading] = useState({
    thumbnail: false,
    video: false,
  });
  const [progress, setProgress] = useState({ thumbnail: 0, video: 0 });
  const [videoUploadStage, setVideoUploadStage] = useState("uploading");
  const [videoTransfer, setVideoTransfer] = useState({ loaded: 0, total: 0 });
  const [isCancellingUpload, setIsCancellingUpload] = useState(false);
  const [thumbnailMode, setThumbnailMode] = useState("upload"); // upload | url
  const [videoMode, setVideoMode] = useState("upload"); // upload | url
  const [dragActive, setDragActive] = useState({
    thumbnail: false,
    video: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const allowedCategories = ["course", "tutorial", "webinar", "demo", "lecture", "other"];

  const activeVideoXhrRef = useRef(null);
  const socketRef = useRef(null);
  const currentVideoUploadIdRef = useRef("");
  const isMountedRef = useRef(true);

  const isBusy = loading || uploading.thumbnail || uploading.video;
  const isVideoUploading = uploading.video;

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
    return (hours * 3600) + (minutes * 60) + seconds;
  };

  const handleDurationPartChange = (part, rawValue) => {
    if (rawValue && !/^\d+$/.test(rawValue)) {
      return;
    }

    const maxByPart = part === "hours" ? 999 : 59;

    setDurationParts((prev) => {
      const next = { ...prev, [part]: rawValue };

      if (next[part] !== "") {
        const numeric = Math.min(maxByPart, Number(next[part]) || 0);
        next[part] = String(numeric);
      }

      const total = toTotalSeconds(next);
      setFormData((prevForm) => ({
        ...prevForm,
        duration: total > 0 ? String(total) : "",
      }));

      return next;
    });
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const hasActiveUpload = uploading.thumbnail || uploading.video || loading;
    if (!hasActiveUpload) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "An upload is in progress. Are you sure you want to leave?";
      return event.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uploading.thumbnail, uploading.video, loading]);

  const formatBytes = (bytes = 0) => {
    if (!bytes || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const unitIndex = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );
    const value = bytes / 1024 ** unitIndex;
    return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const getSocketServerUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return apiUrl.replace(/\/api\/?$/, "");
  };

  const createUploadId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
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
      if (!payload.uploadId || payload.uploadId !== currentVideoUploadIdRef.current) {
        return;
      }

      if (payload.stage === "r2_uploading") {
        setVideoUploadStage("processing");
      } else if (payload.stage === "cancelled") {
        setVideoUploadStage("cancelled");
      }
    };

    const onProgress = (payload = {}) => {
      if (!payload.uploadId || payload.uploadId !== currentVideoUploadIdRef.current) {
        return;
      }

      if (payload.phase !== "r2") {
        return;
      }

      const backendPercent = Number(payload.percent) || 0;
      const mapped = mapR2ProgressToUi(backendPercent);

      setVideoUploadStage("processing");
      setVideoTransfer({
        loaded: Number(payload.loaded) || 0,
        total: Number(payload.total) || 0,
      });
      setProgress((prev) => ({
        ...prev,
        video: Math.max(prev.video, mapped),
      }));
    };

    const onCompleted = (payload = {}) => {
      if (!payload.uploadId || payload.uploadId !== currentVideoUploadIdRef.current) {
        return;
      }

      setVideoUploadStage("completed");
      setProgress((prev) => ({ ...prev, video: Math.max(prev.video, 99) }));
    };

    const onError = (payload = {}) => {
      if (!payload.uploadId || payload.uploadId !== currentVideoUploadIdRef.current) {
        return;
      }

      setVideoUploadStage("error");
      if (payload.message) {
        setError(payload.message);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    validateField(name, value);
  };

  const validateField = (name, value) => {
    setValidationErrors((prev) => {
      const next = { ...prev };

      if (name === "title") {
        if (!value.trim()) {
          next.title = "Title is required";
        } else if (value.trim().length < 3) {
          next.title = "Title must be at least 3 characters";
        } else {
          next.title = "";
        }
      }

      if (name === "category") {
        if (!allowedCategories.includes(value)) {
          next.category = "Invalid category";
        } else {
          next.category = "";
        }
      }

      if (name === "description") {
        next.description = value.trim() ? "" : "Description is required";
      }

      if (name === "thumbnail") {
        next.thumbnail = value ? "" : "Thumbnail is required";
      }

      if (name === "video") {
        next.video = value ? "" : "Video file is required";
      }

      return next;
    });
  };

  const validateForm = () => {
    const title = formData.title.trim();
    const category = formData.category;

    const nextErrors = {
      title: "",
      description: "",
      category: "",
      thumbnail: "",
      video: "",
    };

    if (!title) {
      nextErrors.title = "Title is required";
    } else if (title.length < 3) {
      nextErrors.title = "Title must be at least 3 characters";
    }

    if (!allowedCategories.includes(category)) {
      nextErrors.category = "Invalid category";
    }

    if (!formData.description.trim()) {
      nextErrors.description = "Description is required";
    }

    const hasThumbnail = (thumbnailMode === "upload" && files.thumbnail) || (thumbnailMode === "url" && urlInputs.thumbnail.trim());
    if (!hasThumbnail) {
      nextErrors.thumbnail = "Thumbnail is required";
    }

    const hasVideo = (videoMode === "upload" && files.video) || (videoMode === "url" && urlInputs.video.trim());
    if (!hasVideo) {
      nextErrors.video = "Video file is required";
    }

    setValidationErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some((msg) => msg);
    if (hasErrors) {
      const firstError = Object.values(nextErrors).find((msg) => msg);
      if (firstError) {
        toast.error(firstError);
      }
    }
    return !hasErrors;
  };

  const handleFileSelect = (e, fileType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (fileType === "thumbnail") {
      const validMimes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 10 * 1024 * 1024;
      if (!validMimes.includes(file.type)) {
        setError("Thumbnail must be JPG, PNG, or WebP");
        toast.error("Thumbnail must be JPG, PNG, or WebP");
        return;
      }
      if (file.size > maxSize) {
        setError("Thumbnail must be less than 10MB");
        toast.error("Thumbnail must be less than 10MB");
        return;
      }
    }

    if (fileType === "video") {
      const validMimes = [
        "video/mp4",
        "video/webm",
        "video/x-msvideo",
        "video/quicktime",
      ];
      const maxSize = 500 * 1024 * 1024;
      if (!validMimes.includes(file.type)) {
        setError("Video must be MP4, WebM, AVI, or MOV");
        toast.error("Video must be MP4, WebM, AVI, or MOV");
        return;
      }
      if (file.size > maxSize) {
        setError("Video must be less than 500MB");
        toast.error("Video must be less than 500MB");
        return;
      }
    }

    setFiles((prev) => ({ ...prev, [fileType]: file }));
    if (fileType === "thumbnail") {
      setPreviews((prev) => ({
        ...prev,
        thumbnail: URL.createObjectURL(file),
      }));
      setUploadedUrls((prev) => ({
        ...prev,
        thumbnailUrl: "",
        thumbnailFileId: "",
      }));
      validateField("thumbnail", file.name);
    }
    if (fileType === "video") {
      setPreviews((prev) => ({ ...prev, video: URL.createObjectURL(file) }));
      setUploadedUrls((prev) => ({ ...prev, videoUrl: "" }));
      validateField("video", file.name);

      if (!Number(formData.duration)) {
        getVideoDurationInSecondsFromFile(file)
          .then((durationSeconds) => {
            if (durationSeconds > 0) {
              setFormData((prev) => {
                if (Number(prev.duration)) {
                  return prev;
                }
                return { ...prev, duration: String(durationSeconds) };
              });
              setDurationParts(toDurationParts(durationSeconds));
            }
          })
          .catch(() => {
            // Ignore metadata extraction errors and keep duration manual
          });
      }
    }
  };

  const handleUrlChange = (e, type) => {
    const value = e.target.value;
    setUrlInputs((prev) => ({ ...prev, [type]: value }));
    setError(null);

    validateField(type, value);

    if (type === "thumbnail") {
      setFiles((prev) => ({ ...prev, thumbnail: null }));
      setUploadedUrls((prev) => ({
        ...prev,
        thumbnailUrl: "",
        thumbnailFileId: "",
      }));
      setPreviews((prev) => ({ ...prev, thumbnail: value }));
      setProgress((prev) => ({ ...prev, thumbnail: 0 }));
    }
    if (type === "video") {
      setFiles((prev) => ({ ...prev, video: null }));
      setUploadedUrls((prev) => ({ ...prev, videoUrl: "" }));
      setPreviews((prev) => ({ ...prev, video: "" }));
      setProgress((prev) => ({ ...prev, video: 0 }));
    }
  };

  const uploadWithProgress = (
    url,
    formDataObj,
    token,
    onProgress,
    onStageChange,
    onXhrReady,
  ) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      onXhrReady?.(xhr);
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

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
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            console.log(err);
            reject(new Error("Invalid response from server"));
          }
        } else {
          let message = `Upload failed (${xhr.status})`;
          let parsedCode = "";
          let retryAfterSec = null;
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed?.message) message = parsed.message;
            else if (parsed?.error) message = parsed.error;
            if (parsed?.code) parsedCode = parsed.code;
            if (parsed?.retryAfterSec) retryAfterSec = Number(parsed.retryAfterSec);
          } catch (err) {
            console.log(err);
            // ignore
          }
          if (xhr.status === 429 && !Number.isNaN(retryAfterSec) && retryAfterSec > 0 && !message.includes('Try again')) {
            message = `${message} Try again in ${retryAfterSec} seconds.`;
          }
          const uploadError = new Error(message);
          if (parsedCode === "UPLOAD_CANCELLED" || xhr.status === 499) {
            uploadError.isCancelled = true;
          }
          reject(uploadError);
        }
      };

      xhr.onerror = () => {
        onXhrReady?.(null);
        reject(new Error("Network error during upload"));
      };
      xhr.onabort = () => {
        onXhrReady?.(null);
        const cancelledError = new Error("Upload cancelled by user");
        cancelledError.isCancelled = true;
        reject(cancelledError);
      };
      xhr.send(formDataObj);
    });

  const cleanupCancelledUpload = async () => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    const shouldCleanup =
      Boolean(uploadedUrls.thumbnailFileId) ||
      Boolean(uploadedUrls.thumbnailUrl) ||
      Boolean(uploadedUrls.videoUrl);

    if (!shouldCleanup) {
      return;
    }

    await fetch(`${import.meta.env.VITE_API_URL}/upload/cancel-upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        thumbnailFileId: uploadedUrls.thumbnailFileId || null,
        thumbnailUrl: uploadedUrls.thumbnailUrl || null,
        videoUrl: uploadedUrls.videoUrl || null,
      }),
    }).catch((cleanupError) => {
      console.error("Cleanup request failed:", cleanupError.message);
    });
  };

  const cancelUpload = async () => {
    if (isCancellingUpload) {
      return;
    }

    setIsCancellingUpload(true);

    try {
      const activeUploadId = currentVideoUploadIdRef.current;
      if (activeUploadId && socketRef.current?.connected) {
        socketRef.current.emit("upload:cancel", { uploadId: activeUploadId });
      }

      if (activeVideoXhrRef.current) {
        activeVideoXhrRef.current.abort();
      }

      await cleanupCancelledUpload();

      setUploading({ thumbnail: false, video: false });
      setProgress({ thumbnail: 0, video: 0 });
      setVideoTransfer({ loaded: 0, total: 0 });
      setVideoUploadStage("uploading");
      setUploadedUrls({ thumbnailUrl: "", thumbnailFileId: "", videoUrl: "" });
      setFiles({ thumbnail: null, video: null });
      setPreviews({ thumbnail: "", video: "" });
      toast.info("Upload cancelled. Partial uploaded files were cleaned.");
    } catch (error) {
      console.error("Cancel upload error:", error.message);
      toast.error("Upload cancelled, but cleanup could not be fully verified.");
    } finally {
      setIsCancellingUpload(false);
    }
  };

  const uploadThumbnail = async () => {
    if (thumbnailMode === "url") {
      if (!urlInputs.thumbnail.trim()) {
        setError("Please provide a thumbnail URL");
        return { success: false, url: null };
      }
      setUploadedUrls((prev) => ({
        ...prev,
        thumbnailUrl: urlInputs.thumbnail.trim(),
      }));
      return { success: true, url: urlInputs.thumbnail.trim() };
    }

    if (!files.thumbnail) {
      setError("Please select a thumbnail image");
      return { success: false, url: null };
    }

    try {
      setUploading((prev) => ({ ...prev, thumbnail: true }));
      setProgress((prev) => ({ ...prev, thumbnail: 0 }));
      const token = getAuthToken();

      const formDataObj = new FormData();
      formDataObj.append("thumbnail", files.thumbnail);

      const data = await uploadWithProgress(
        `${import.meta.env.VITE_API_URL}/upload/thumbnail`,
        formDataObj,
        token,
        ({ percent }) =>
          setProgress((prev) => ({ ...prev, thumbnail: Math.min(percent, 99) })),
      );

      const thumbUrl = data.data.thumbnailUrl;
      const fileId = data.data.fileId || "";

      setUploadedUrls((prev) => ({
        ...prev,
        thumbnailUrl: thumbUrl,
        thumbnailFileId: fileId,
      }));
      setProgress((prev) => ({ ...prev, thumbnail: 100 }));
      setPreviews((prev) => ({ ...prev, thumbnail: thumbUrl }));
      return { success: true, url: thumbUrl, fileId };
    } catch (err) {
      console.error("❌ Thumbnail upload failed:", err.message);
      setError(err.message);
      toast.error(err.message || "Thumbnail upload failed");
      return { success: false, url: null, fileId: null };
    } finally {
      setUploading((prev) => ({ ...prev, thumbnail: false }));
    }
  };

  const uploadVideo = async () => {
    if (videoMode === "url") {
      if (!urlInputs.video.trim()) {
        setError("Please provide a video URL");
        return { success: false, url: null };
      }
      setUploadedUrls((prev) => ({
        ...prev,
        videoUrl: urlInputs.video.trim(),
      }));
      return { success: true, url: urlInputs.video.trim() };
    }

    if (!files.video) {
      setError("Please select a video file");
      return { success: false, url: null };
    }

    try {
      setUploading((prev) => ({ ...prev, video: true }));
      setProgress((prev) => ({ ...prev, video: 0 }));
      setVideoUploadStage("uploading");
      setVideoTransfer({ loaded: 0, total: files.video?.size || 0 });
      const token = getAuthToken();
      const uploadId = createUploadId();

      currentVideoUploadIdRef.current = uploadId;
      if (socketRef.current?.connected) {
        socketRef.current.emit("upload:subscribe", { uploadId });
      }

      const formDataObj = new FormData();
      formDataObj.append("video", files.video);
      formDataObj.append("title", formData.title);
      formDataObj.append("uploadId", uploadId);

      const data = await uploadWithProgress(
        `${import.meta.env.VITE_API_URL}/upload/video-file`,
        formDataObj,
        token,
        ({ percent, loaded, total }) => {
          const mappedClientPercent = mapClientProgressToUi(percent);
          setProgress((prev) => ({
            ...prev,
            video: Math.max(prev.video, mappedClientPercent),
          }));
          setVideoTransfer({ loaded, total });
        },
        (stage) => setVideoUploadStage(stage),
        (xhr) => {
          activeVideoXhrRef.current = xhr;
        },
      );

      const videoUrl = data.data.videoUrl;
      setProgress((prev) => ({ ...prev, video: 100 }));
      setUploadedUrls((prev) => ({ ...prev, videoUrl: videoUrl }));
      return { success: true, url: videoUrl };
    } catch (err) {
      if (err?.isCancelled) {
        setVideoUploadStage("cancelled");
        return { success: false, url: null, cancelled: true };
      }
      console.error("❌ Video upload failed:", err.message);
      setError(err.message);
      toast.error(err.message || "Video upload failed");
      return { success: false, url: null, fileId: null };
    } finally {
      activeVideoXhrRef.current = null;
      currentVideoUploadIdRef.current = "";
      if (isMountedRef.current) {
        setUploading((prev) => ({ ...prev, video: false }));
        setVideoUploadStage("uploading");
        setVideoTransfer({ loaded: 0, total: 0 });
      }
    }
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: false }));

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const event = { target: { files: droppedFiles } };
      handleFileSelect(event, type);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Starting upload process...");

    // Frontend validation mirroring backend (title length, required fields)
    if (!validateForm()) {
      return;
    }

    let thumbUrl = uploadedUrls.thumbnailUrl || "";
    let thumbFileId = uploadedUrls.thumbnailFileId || "";
    let videoUrl = uploadedUrls.videoUrl || "";

    // Upload files if they exist and haven't been uploaded yet
    if (
      thumbnailMode === "upload" &&
      files.thumbnail &&
      !uploadedUrls.thumbnailUrl
    ) {
      console.log("📸 Uploading thumbnail...");
      const result = await uploadThumbnail();
      if (!result.success) {
        console.error("❌ Thumbnail upload failed");
        return;
      }
      thumbUrl = result.url;
      thumbFileId = result.fileId || thumbFileId;
    }
    if (videoMode === "upload" && files.video && !uploadedUrls.videoUrl) {
      console.log("🎬 Uploading video...");
      const result = await uploadVideo();
      if (result?.cancelled) {
        return;
      }
      if (!result.success) {
        console.error("❌ Video upload failed");
        return;
      }
      videoUrl = result.url;
    }

    // Validate using the actual URLs we now have
    if (!formData.title.trim()) {
      setError("Title is required");
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {

      setError("Description is required");
      toast.error("Description is required");
      return;
    }

    const finalThumb = thumbUrl || urlInputs.thumbnail.trim();
    const finalThumbFileId = thumbFileId;
    const finalVideo = videoUrl || urlInputs.video.trim();

    if (!finalThumb) {
      setError("Please provide a thumbnail");
      console.error("❌ No thumbnail URL available");
      return;
    }
    if (!finalVideo) {
      setError("Please provide a video");
      console.error("❌ No video URL available");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getAuthToken();
      if (!token) {
        // console.error("🔴 No auth token found in localStorage");

        throw new Error("Session expired. Please login again.");
      }

      // console.log("💾 Saving to database:", {
      //   title: formData.title,
      //   category: formData.category,
      //   thumbnailUrl: finalThumb.substring(0, 50) + "...",
      //   videoUrl: finalVideo.substring(0, 50) + "...",
      //   tokenPresent: !!token,
      //   tokenLength: token?.length,
      // });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/upload/video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
        },
      );

      // console.log(
      //   `📡 Database save response: ${response.status} ${response.statusText}`,
      // );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          console.error("🔴 Authentication failed (401):", errorData);
          throw new Error("Session expired. Please login again.");
        }

        if (response.status === 403) {
          console.error(
            "🔴 Authorization failed (403) - Not admin:",
            errorData,
          );
          throw new Error("You do not have admin privileges to upload videos.");
        }

        if (response.status === 429) {
          const retryAfter = Number(errorData?.retryAfterSec);
          const message = retryAfter > 0
            ? `Upload limit reached. Try again in ${retryAfter} seconds.`
            : "Upload limit reached. Please wait a bit and try again.";
          throw new Error(message);
        }

        console.error("🔴 Server error:", errorData);
        throw new Error(errorData.message || errorData.error || "Failed to create video");
      }

      const result = await response.json();
      console.log("✅ Video saved to database:", result);

      setSuccess(true);
      toast.success("Video uploaded successfully");

      // Clear form and uploads
      setFormData({
        title: "",
        description: "",
        category: "tutorial",
        duration: "",
      });
      setDurationParts({ hours: "", minutes: "", seconds: "" });
      setFiles({ thumbnail: null, video: null });
      setUploadedUrls({ thumbnailUrl: "", thumbnailFileId: "", videoUrl: "" });
      setUrlInputs({ thumbnail: "", video: "" });
      setPreviews({ thumbnail: "", video: "" });
      setProgress({ thumbnail: 0, video: 0 });
      setThumbnailMode("upload");
      setVideoMode("upload");
      setDragActive({ thumbnail: false, video: false });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("❌ Submission error:", err.message);
      setError(err.message);
      toast.error(err.message || "Upload failed");
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
              onBlur={(e) => validateField("title", e.target.value)}
              placeholder="Enter video title"
              disabled={isBusy}
              maxLength={200}
              aria-invalid={!!validationErrors.title}
              aria-describedby="title-error"
            />
            <small>{formData.title.length}/200 characters</small>
            {validationErrors.title && (
              <small id="title-error" style={{ color: '#ff6b6b', fontWeight: 500 }}>{validationErrors.title}</small>
            )}
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
              onBlur={(e) => {
                validateField("description", e.target.value);
              }}
              placeholder="Enter detailed description"
              disabled={isBusy}
              rows={3}
              maxLength={1000}
              aria-invalid={!!validationErrors.description}
              aria-describedby="description-error"
            />
            <small>{formData.description.length}/1000 characters</small>
            {validationErrors.description && (
              <small id="description-error" style={{ color: '#ff6b6b', fontWeight: 500 }}>{validationErrors.description}</small>
            )}
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="category">Video Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                onBlur={(e) => validateField("category", e.target.value)}
                disabled={isBusy}
                aria-invalid={!!validationErrors.category}
                aria-describedby="category-error"
              >
                <option value="tutorial">Tutorial</option>
                <option value="lecture">Lecture</option>
                <option value="demo">Demo</option>
                <option value="webinar">Webinar</option>
                <option value="other">Other</option>
              </select>
              {validationErrors.category && (
                <small id="category-error" style={{ color: '#ff6b6b', fontWeight: 500 }}>{validationErrors.category}</small>
              )}
            </div>
            <div className="form-group half">
              <label>
                Duration (H : M : S) - Optional
                <span className="optional">Leave blank if unknown</span>
              </label>
              <div className="duration-parts">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="HH"
                  value={durationParts.hours}
                  onChange={(e) => handleDurationPartChange("hours", e.target.value)}
                  disabled={isBusy}
                  className="duration-part"
                />
                <span className="duration-sep">:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM"
                  value={durationParts.minutes}
                  onChange={(e) => handleDurationPartChange("minutes", e.target.value)}
                  disabled={isBusy}
                  className="duration-part"
                />
                <span className="duration-sep">:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="SS"
                  value={durationParts.seconds}
                  onChange={(e) => handleDurationPartChange("seconds", e.target.value)}
                  disabled={isBusy}
                  className="duration-part"
                />
              </div>
              <small>Stored as {formData.duration || 0} seconds in database</small>
            </div>
          </div>
        </div>

        <div className="upload-grid">
          {/* Thumbnail */}
          <div className="form-group">
            <label>Thumbnail Image *</label>
            <div className="upload-card">
              <div className="upload-card__header">
                <div className="upload-card__icon">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <div className="upload-card__title">Thumbnail</div>
                  <div className="upload-card__subtitle">
                    Upload a file or paste an image URL
                  </div>
                </div>
              </div>

              <div className="toggle-row">
                <button
                  type="button"
                  className={`toggle-btn ${thumbnailMode === "upload" ? "active" : ""}`}
                  onClick={() => {
                    setThumbnailMode("upload");
                    setUrlInputs((prev) => ({ ...prev, thumbnail: "" }));
                    setUploadedUrls((prev) => ({ ...prev, thumbnailUrl: "" }));
                    setPreviews((prev) => ({ ...prev, thumbnail: "" }));
                  }}
                  disabled={isBusy}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${thumbnailMode === "url" ? "active" : ""}`}
                  onClick={() => {
                    setThumbnailMode("url");
                    setFiles((prev) => ({ ...prev, thumbnail: null }));
                    setUploadedUrls((prev) => ({ ...prev, thumbnailUrl: "" }));
                    setPreviews((prev) => ({ ...prev, thumbnail: "" }));
                    setProgress((prev) => ({ ...prev, thumbnail: 0 }));
                  }}
                  disabled={isBusy}
                >
                  Use URL
                </button>
              </div>

              {thumbnailMode === "upload" && (
                <label
                  className={`upload-zone ${dragActive.thumbnail ? "drag-active" : ""}`}
                  onDragOver={(e) => handleDragOver(e, "thumbnail")}
                  onDragLeave={(e) => handleDragLeave(e, "thumbnail")}
                  onDrop={(e) => handleDrop(e, "thumbnail")}
                >
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => handleFileSelect(e, "thumbnail")}
                    onBlur={() => validateField("thumbnail", files.thumbnail?.name || "")}
                    disabled={isBusy}
                  />
                  <div className="upload-zone__text">
                    {dragActive.thumbnail
                      ? "📦 Drop here"
                      : files.thumbnail
                        ? files.thumbnail.name
                        : "Click or drag file to upload"}
                  </div>
                </label>
              )}

              {thumbnailMode === "url" && (
                <div className="url-input-row">
                  <Link2 size={16} />
                  <input
                    type="url"
                    placeholder="https://...image.webp"
                    value={urlInputs.thumbnail}
                    onChange={(e) => handleUrlChange(e, "thumbnail")}
                    onBlur={(e) => validateField("thumbnail", e.target.value)}
                    disabled={isBusy}
                  />
                </div>
              )}


              {uploading.thumbnail && (
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${progress.thumbnail}%` }}
                  />
                  <span>{progress.thumbnail}%</span>
                </div>
              )}

              {validationErrors.thumbnail && (
                <small style={{ color: '#ff6b6b', fontWeight: 500 }}>{validationErrors.thumbnail}</small>
              )}

              {uploadedUrls.thumbnailUrl &&
                !uploading.thumbnail &&
                !loading && (
                  <div className="upload-success">Thumbnail ready</div>
                )}

              {previews.thumbnail &&
                !uploading.thumbnail &&
                !uploading.video &&
                !loading && (
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
                <div className="upload-card__icon">
                  <FileVideo size={20} />
                </div>
                <div>
                  <div className="upload-card__title">Video</div>
                  <div className="upload-card__subtitle">
                    Upload video file (MP4, WebM, AVI, MOV)
                  </div>
                </div>
              </div>

              {videoMode === "upload" && (
                <label
                  className={`upload-zone ${dragActive.video ? "drag-active" : ""}`}
                  onDragOver={(e) => handleDragOver(e, "video")}
                  onDragLeave={(e) => handleDragLeave(e, "video")}
                  onDrop={(e) => handleDrop(e, "video")}
                >
                  <input
                    type="file"
                    accept="video/mp4, video/webm, video/x-msvideo, video/quicktime"
                    onChange={(e) => handleFileSelect(e, "video")}
                    onBlur={() => validateField("video", files.video?.name || "")}
                    disabled={isBusy}
                  />
                  <div className="upload-zone__text">
                    {dragActive.video
                      ? "📦 Drop here"
                      : files.video
                        ? files.video.name
                        : "Click or drag file to upload"}
                  </div>
                </label>
              )}


              {uploading.video && (
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${progress.video}%` }}
                  />
                  <span>{progress.video}%</span>
                </div>
              )}

              {validationErrors.video && (
                <small style={{ color: '#ff6b6b', fontWeight: 500 }}>{validationErrors.video}</small>
              )}

              {uploadedUrls.videoUrl && !uploading.video && !loading && (
                <div className="upload-success">Video ready</div>
              )}

              {previews.video &&
                videoMode === "upload" &&
                !uploading.thumbnail &&
                !uploading.video &&
                !loading && (
                  <div className="preview">
                    <video src={previews.video} controls width="100%" />
                  </div>
                )}
            </div>
          </div>

          <div className="action-card">
            <p className="muted">Ready to publish?</p>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isBusy}
            >
              {isBusy ? "Uploading..." : "Upload Video"}
            </button>
          </div>
        </div>
      </form>

      {/* Full-Screen Upload Overlay */}
      {(uploading.thumbnail || uploading.video) && (
        <div className="upload-overlay-fullscreen">
          <div className="upload-overlay-fullscreen__backdrop" />
          <div className="upload-overlay-fullscreen__content">
            <div className="upload-overlay-fullscreen__card">
              <div className="upload-overlay-fullscreen__header">
                <h2>📤 Uploading...</h2>
              </div>

              {/* Thumbnail Upload */}
              {uploading.thumbnail && (
                <div className="upload-stage">
                  <div className="upload-stage__title">📸 Uploading Thumbnail</div>
                  <div className="progress-bar-large">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress.thumbnail}%` }}
                    />
                  </div>
                  <div className="progress-text">
                    <span>{progress.thumbnail}% Complete</span>
                  </div>
                </div>
              )}

              {/* Video Upload */}
              {uploading.video && (
                <div className="upload-stage">
                  <div className="upload-stage__title">🎬 Uploading Video</div>
                  <div className="progress-bar-large">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress.video}%` }}
                    />
                  </div>
                  <div className="progress-text">
                    <span>{progress.video}% Complete</span>
                    {videoTransfer.total > 0 && (
                      <span className="transfer-info">
                        {formatBytes(videoTransfer.loaded)} / {formatBytes(videoTransfer.total)}
                      </span>
                    )}
                  </div>
                  <div className="upload-stage__description">
                    {videoUploadStage === 'uploading' && '⏳ Sending file to backend...'}
                    {videoUploadStage === 'processing' && '☁️ Uploading multipart chunks to cloud storage...'}
                    {videoUploadStage === 'completed' && '✅ Finalizing upload...'}
                    {videoUploadStage === 'cancelled' && '🛑 Upload cancelled.'}
                    {videoUploadStage === 'error' && '❌ Upload failed.'}
                  </div>
                </div>
              )}

              {/* Cancel Button */}
              <button
                type="button"
                className="btn btn--cancel-overlay"
                onClick={cancelUpload}
                disabled={isCancellingUpload}
              >
                {isCancellingUpload ? '🔄 Cancelling...' : '✕ Cancel Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden form to prevent form submission during upload */}
      {(uploading.thumbnail || uploading.video) && (
        <style>{`
          body {
            overflow: hidden;
          }
          nav, header, .navbar {
            pointer-events: none !important;
            opacity: 0.5;
          }
        `}</style>
      )}

      {isVideoUploading && (
        <div className="upload-overlay" role="status" aria-live="polite">
          <div className="upload-overlay__panel">
            <Loader className="spin" size={28} />
            <div className="upload-overlay__content">
              <p className="upload-title">Uploading video…</p>
              <p className="upload-hint">
                {videoUploadStage === "processing"
                  ? "Upload complete. Processing and saving on server..."
                  : "Please wait while we upload your file."}
              </p>

              <div className="upload-progress-track" aria-hidden="true">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${progress.video}%` }}
                />
              </div>

              <div className="upload-progress-meta">
                <span>{progress.video}%</span>
                <span>
                  {formatBytes(videoTransfer.loaded)} /{" "}
                  {formatBytes(videoTransfer.total)}
                </span>
              </div>

              <div className="upload-overlay__actions">
                <button
                  type="button"
                  className="upload-cancel-btn"
                  onClick={cancelUpload}
                  disabled={isCancellingUpload}
                >
                  {isCancellingUpload ? "Cancelling..." : "Cancel Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadVideo;
