import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { getAuthToken, videoAPI } from "../../utils/apiClient";
import { toast } from "../../utils/toast";

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Single video element ref — never remounted
  const videoRef = useRef(null);

  // Two container refs: one for normal, one for fullscreen
  const normalContainerRef = useRef(null);
  const fullscreenContainerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ─── Format helper ────────────────────────────────────────────────────────
  const formatDuration = (seconds) => {
    const total = Number(seconds);
    if (!Number.isFinite(total) || total < 0) return "00:00";
    const whole = Math.floor(total);
    const hrs = Math.floor(whole / 3600);
    const mins = Math.floor((whole % 3600) / 60);
    const secs = whole % 60;
    if (hrs > 0)
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const storedDuration = Number(video?.duration || 0);
  const displayDuration =
    Number.isFinite(duration) && duration > 0
      ? duration
      : Number.isFinite(storedDuration)
        ? storedDuration
        : 0;

  // ─── Move the single <video> DOM node into the active container ───────────
  useEffect(() => {
    const videoEl = videoRef.current;
    const container = isFullscreen
      ? fullscreenContainerRef.current
      : normalContainerRef.current;

    if (!videoEl || !container) return;

    // Re-parent without remounting (preserves playback position & state)
    container.appendChild(videoEl);
  }, [isFullscreen]);

  // ─── Auth + fetch video ───────────────────────────────────────────────────
  useEffect(() => {
    const checkAuthAndFetchVideo = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          navigate("/auth", { replace: true });
          return;
        }
        if (!videoId) {
          setError("No video selected");
          setLoading(false);
          return;
        }
        const res = await videoAPI.getById(videoId);
        const videoData = res.data || res.video;
        if (!videoData) {
          setError("Video not found");
          setLoading(false);
          return;
        }
        if (!videoData.videoUrl && !videoData.video_url) {
          setError("Video URL is missing");
          setLoading(false);
          return;
        }
        setVideo(videoData);
      } catch (err) {
        console.error("Error fetching video:", err);
        setError(err.message || "Failed to load video");
        toast.error(err.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndFetchVideo();
  }, [videoId, navigate]);

  // ─── Wire up the video element once video data is ready ──────────────────
  useEffect(() => {
    if (!video) return;

    const el = videoRef.current;
    if (!el) return;

    // Set src only once
    const src = video.videoUrl || video.video_url;
    if (el.src !== src) {
      el.src = src;
      el.load();
    }

    el.volume = volume;
    el.muted = volume === 0;
    el.playbackRate = speed;
    el.autoplay = true;
    el.playsInline = true;
    el.disablePictureInPicture = true;
    el.controls = false;
    el.style.cssText =
      "width:100%;height:100%;background:black;user-select:none;-webkit-user-select:none;";

    const onLoaded = () => {
      setDuration(el.duration || 0);
      setProgress(el.currentTime || 0);
      setIsPlaying(!el.paused);
    };
    const onTime = () => setProgress(el.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onRate = () => setSpeed(el.playbackRate);
    const onVol = () => setVolume(el.muted ? 0 : el.volume);
    const onContext = (e) => { e.preventDefault(); return false; };
    const onDrag = (e) => { e.preventDefault(); return false; };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("canplay", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ratechange", onRate);
    el.addEventListener("volumechange", onVol);
    el.addEventListener("contextmenu", onContext);
    el.addEventListener("dragstart", onDrag);

    // Place into normal container initially
    if (normalContainerRef.current) {
      normalContainerRef.current.appendChild(el);
    }

    // Attempt autoplay
    el.play().catch(() => {});

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("canplay", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ratechange", onRate);
      el.removeEventListener("volumechange", onVol);
      el.removeEventListener("contextmenu", onContext);
      el.removeEventListener("dragstart", onDrag);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video]);

  // ─── Controls ─────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.paused ? el.play() : el.pause();
  }, []);

  const handleSeek = useCallback((value) => {
    const el = videoRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(value, el.duration || value));
    el.currentTime = clamped;
    setProgress(clamped);
  }, []);

  const handleVolumeChange = useCallback((value) => {
    const vol = Math.min(Math.max(value, 0), 1);
    setVolume(vol);
    const el = videoRef.current;
    if (el) {
      el.volume = vol;
      el.muted = vol === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    const muted = el.muted || volume === 0;
    if (muted) {
      el.muted = false;
      if (volume === 0) handleVolumeChange(0.5);
    } else {
      el.muted = true;
      handleVolumeChange(0);
    }
  }, [volume, handleVolumeChange]);

  const changeSpeed = useCallback((val) => {
    setSpeed(val);
    const el = videoRef.current;
    if (el) el.playbackRate = val;
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.style.overflow = "hidden";
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.documentElement.style.overflow = "auto";
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      }
      return next;
    });
  }, []);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
        document.documentElement.style.overflow = "auto";
        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      } else if (e.key === "k" || e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "j") {
        handleSeek(Math.max((videoRef.current?.currentTime || 0) - 10, 0));
      } else if (e.key === "l") {
        handleSeek(Math.min((videoRef.current?.currentTime || 0) + 10, duration || 0));
      } else if (e.key === "m") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, toggleFullscreen, togglePlay, handleSeek, toggleMute, duration]);

  // ─── Native fullscreen change (browser Esc / F11 native) ─────────────────
  useEffect(() => {
    const onFSChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        document.documentElement.style.overflow = "auto";
      }
    };
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  // ─── Shared controls UI ───────────────────────────────────────────────────
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  const ControlBar = ({ large = false }) => (
    <div
      className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2 z-10 ${large ? "px-4 py-3" : "px-3 sm:px-4 py-2 sm:py-3"}`}
    >
      {/* Progress */}
      <input
        type="range"
        min={0}
        max={duration > 0 ? duration : Math.max(progress + 1, 1)}
        step={0.1}
        value={Math.min(progress, duration || Math.max(progress, 0))}
        onChange={(e) => handleSeek(Number(e.target.value))}
        className={`w-full accent-red-500 cursor-pointer ${large ? "h-1.5" : "h-1"}`}
        style={{
          background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${progressPct}%, rgba(255,255,255,0.2) ${progressPct}%, rgba(255,255,255,0.2) 100%)`,
        }}
      />

      {/* Buttons */}
      <div className={`flex items-center justify-between gap-2 ${large ? "text-sm" : "text-xs sm:text-sm"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-2 rounded bg-white/10 hover:bg-white/20 transition"
            title={isPlaying ? "Pause (k)" : "Play (k)"}
          >
            {isPlaying ? <Pause size={large ? 20 : 16} /> : <Play size={large ? 20 : 16} />}
          </button>

          {/* -10s */}
          <button
            onClick={() => handleSeek(Math.max(progress - 10, 0))}
            className="px-2 py-1.5 rounded bg-white/5 hover:bg-white/15 transition font-semibold"
            title="Back 10s (j)"
          >
            -10s
          </button>

          {/* +10s */}
          <button
            onClick={() => handleSeek(Math.min(progress + 10, duration || 0))}
            className="px-2 py-1.5 rounded bg-white/5 hover:bg-white/15 transition font-semibold"
            title="Forward 10s (l)"
          >
            +10s
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-1.5 sm:p-2 rounded bg-white/5 hover:bg-white/15 transition"
              title={volume === 0 ? "Unmute (m)" : "Mute (m)"}
            >
              {volume === 0 ? <VolumeX size={large ? 20 : 16} /> : <Volume2 size={large ? 20 : 16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className={`accent-red-500 cursor-pointer ${large ? "w-24" : "w-16 sm:w-20"}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Timer */}
          <span className="text-white/70 tabular-nums">
            {formatDuration(progress)} / {formatDuration(displayDuration)}
          </span>

          {/* Speed */}
          <select
            value={speed}
            onChange={(e) => changeSpeed(Number(e.target.value))}
            className="bg-white/10 border border-white/15 text-xs rounded px-2 py-1 text-white focus:outline-none hover:bg-white/20 transition"
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
              <option key={s} value={s}>{s}x</option>
            ))}
          </select>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded bg-white/5 hover:bg-white/15 transition"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen (F11)"}
          >
            {isFullscreen ? <Minimize2 size={large ? 22 : 16} /> : <Maximize2 size={large ? 22 : 16} />}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Loading / Error / Not found states ──────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#06060a] to-[#0a0a0f] text-white px-6 py-16 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Could Not Load Video</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => navigate("/videos")}
            className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center text-white">
        <p>Video not found</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Hidden video element: lives here in the DOM, moved via appendChild ── */}
      {/* We create it once as a real DOM node managed by useRef, NOT as JSX */}
      {/* The actual <video> tag is created imperatively below in a layout effect */}

      {/* ── Fullscreen overlay ─────────────────────────────────────────────── */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 w-screen h-screen overflow-hidden">
          <div className="relative w-full h-full bg-black flex items-center justify-center group">
            {/* Video slot — the single video node gets moved here */}
            <div
              ref={fullscreenContainerRef}
              className="w-full h-full flex items-center justify-center"
              style={{ position: "relative" }}
            />

            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent px-4 py-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <h1 className="text-2xl font-bold line-clamp-2 flex-1 pr-4">{video.title}</h1>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/30 transition shrink-0"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 size={24} />
              </button>
            </div>

            {/* Controls */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-x-0 bottom-0 z-10">
              <ControlBar large={true} />
            </div>
          </div>
        </div>
      )}

      {/* ── Normal page view ────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-gradient-to-b from-[#06060a] via-[#0a0a0f] to-[#0a0a0f] text-white">
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl group">
            <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
              {/* Video slot — the single video node lives here when not fullscreen */}
              <div
                ref={normalContainerRef}
                className="w-full h-full"
                style={{ position: "relative" }}
              />

              {/* Top overlay */}
              <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent px-4 py-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <h1 className="text-lg sm:text-xl font-bold line-clamp-2 flex-1 pr-4">{video.title}</h1>
                <button
                  onClick={() => navigate("/videos")}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/30 transition shrink-0"
                  title="Back to library"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Controls */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-x-0 bottom-0 z-10">
                <ControlBar large={false} />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 sm:mt-6">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{video.title}</h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4">
                {video.description || "No description provided"}
              </p>
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-white/50 border-t border-white/10 pt-4">
                <div>
                  <span className="text-white/70">Duration:</span>{" "}
                  {displayDuration > 0 ? formatDuration(displayDuration) : "N/A"}
                </div>
                <div>
                  <span className="text-white/70">Category:</span>{" "}
                  {video.category || "General"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── The ONE video element, created imperatively and never remounted ─── */}
      {/* It starts hidden; the useEffect above moves it into the right slot */}
      <video
        ref={videoRef}
        style={{ display: "none" }}   // hidden until placed by useEffect
        playsInline
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
      />
    </>
  );
};

export default VideoPlayer;