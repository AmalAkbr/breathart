import React, { useEffect, useState, useRef, useCallback, memo } from "react";
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

// ─── Devtools detection ───────────────────────────────────────────────────────
function useDevtoolsDetection() {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const check = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const sizeOpen = widthDiff > 160 || heightDiff > 160;
      let timingOpen = false;
      const t = performance.now();
      console.log("%c", "");
      if (performance.now() - t > 20) timingOpen = true;
      setIsOpen(sizeOpen || timingOpen);
    };
    check();
    const id = setInterval(check, 800);
    window.addEventListener("resize", check);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", check);
    };
  }, []);
  return isOpen;
}

// ─── Format helper ────────────────────────────────────────────────────────────
const formatDuration = (s) => {
  const t = Number(s);
  if (!Number.isFinite(t) || t < 0) return "00:00";
  const w = Math.floor(t);
  const hrs = Math.floor(w / 3600);
  const mins = Math.floor((w % 3600) / 60);
  const secs = w % 60;
  if (hrs > 0)
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

// ─── ControlBar (memoized, all handlers stable) ───────────────────────────────
const ControlBar = memo(function ControlBar({
  isPlaying,
  progress,
  duration,
  volume,
  speed,
  isFullscreen,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSpeedChange,
  onToggleFullscreen,
}) {
  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const iconSize = isFullscreen ? 22 : 18;

  return (
    <div
      className="flex flex-col gap-2 px-4 py-3"
      // Stop mouse events here so idle timer doesn't fire while interacting with controls
      onMouseMove={(e) => e.stopPropagation()}
    >
      {/* Progress bar */}
      <input
        type="range"
        min={0}
        max={duration > 0 ? duration : Math.max(progress + 1, 1)}
        step={0.1}
        value={Math.min(progress, duration || Math.max(progress, 0))}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="w-full h-1.5 accent-red-500 cursor-pointer"
        style={{
          background: `linear-gradient(to right,#ef4444 0%,#ef4444 ${pct}%,rgba(255,255,255,0.25) ${pct}%,rgba(255,255,255,0.25) 100%)`,
        }}
      />

      {/* Buttons */}
      <div className="flex items-center justify-between gap-3 text-sm">
        {/* Left group */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-md hover:bg-white/20 transition-colors"
            title={isPlaying ? "Pause (k)" : "Play (k)"}
          >
            {isPlaying ? <Pause size={iconSize} /> : <Play size={iconSize} />}
          </button>

          <button
            onClick={() => onSeek(Math.max(progress - 10, 0))}
            className="px-2.5 py-1.5 rounded-md hover:bg-white/15 transition-colors text-xs font-bold"
            title="Back 10s (j)"
          >
            -10s
          </button>

          <button
            onClick={() => onSeek(Math.min(progress + 10, duration || 0))}
            className="px-2.5 py-1.5 rounded-md hover:bg-white/15 transition-colors text-xs font-bold"
            title="Forward 10s (l)"
          >
            +10s
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1.5 group/vol">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-md hover:bg-white/15 transition-colors"
              title={volume === 0 ? "Unmute (m)" : "Mute (m)"}
            >
              {volume === 0 ? (
                <VolumeX size={iconSize} />
              ) : (
                <Volume2 size={iconSize} />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-20 accent-red-500 cursor-pointer opacity-0 group-hover/vol:opacity-100 transition-opacity"
            />
          </div>

          {/* Time display */}
          <span className="text-white/80 tabular-nums text-xs select-none pl-1">
            {formatDuration(progress)} / {formatDuration(duration)}
          </span>
        </div>

        {/* Right group */}
        <div className="flex items-center gap-2">
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="bg-white/10 border border-white/20 text-xs rounded px-2 py-1 text-white focus:outline-none hover:bg-white/20 transition-colors"
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>

          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-md hover:bg-white/15 transition-colors"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen (F11)"}
          >
            {isFullscreen ? (
              <Minimize2 size={iconSize} />
            ) : (
              <Maximize2 size={iconSize} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

// ─── Devtools block screen ────────────────────────────────────────────────────
const DevtoolsBlock = () => (
  <div className="fixed inset-0 z-9999 bg-black flex flex-col items-center justify-center select-none">
    <div className="text-center px-8 max-w-md">
      <div className="text-6xl mb-6">🔒</div>
      <h1 className="text-2xl font-bold text-white mb-3">Page Protected</h1>
      <p className="text-white/60 text-base leading-relaxed">
        Developer tools are not allowed on this page.
        <br />
        Please close DevTools to continue watching.
      </p>
      <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-sm">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Monitoring active
      </div>
    </div>
  </div>
);

// ─── YouTube-style controls visibility hook ───────────────────────────────────
// Returns: { showControls, handleMouseMove, handleMouseLeave }
function useControlsVisibility(isPlaying) {
  const [showControls, setShowControls] = useState(true);
  const idleTimer = useRef(null);

  const resetTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(idleTimer.current);
    // Hide after 2.5s of no movement — same as YouTube
    idleTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  }, []);

  const handleMouseMove = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(idleTimer.current);
    // Only hide immediately if video is playing (YouTube behaviour)
    if (isPlaying) setShowControls(false);
  }, [isPlaying]);

  // When video pauses always show controls; when it plays restart timer
  useEffect(() => {
    if (!isPlaying) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowControls(true);
      clearTimeout(idleTimer.current);
    } else {
      resetTimer();
    }
  }, [isPlaying, resetTimer]);

  // Cleanup
  useEffect(() => () => clearTimeout(idleTimer.current), []);

  return { showControls, handleMouseMove, handleMouseLeave };
}

// ─── Main component ───────────────────────────────────────────────────────────
const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const devtoolsOpen = useDevtoolsDetection();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef(null);
  const normalSlotRef = useRef(null);
  const fullscreenSlotRef = useRef(null);

  // Controls visibility — one hook used by both normal & fullscreen
  const { showControls, handleMouseMove, handleMouseLeave } =
    useControlsVisibility(isPlaying);

  // ─── Security: pause on devtools open ──────────────────────────────────
  useEffect(() => {
    if (devtoolsOpen) videoRef.current?.pause();
    return () => {
      // No need to resume on close — user can click play if they want
    };
  }, [devtoolsOpen]);

  // ─── Security: block right-click ───────────────────────────────────────
  useEffect(() => {
    const block = (e) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  // ─── Security: block devtools keyboard shortcuts ────────────────────────
  useEffect(() => {
    const block = (e) => {
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          ["I", "J", "C"].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && e.key === "u")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", block, true);
    return () => document.removeEventListener("keydown", block, true);
  }, []);

  // ─── Move video node into correct slot ─────────────────────────────────
  useEffect(() => {
    const el = videoRef.current;
    const slot = isFullscreen
      ? fullscreenSlotRef.current
      : normalSlotRef.current;
    if (el && slot) slot.appendChild(el);
  }, [isFullscreen]);

  // ─── Auth + fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
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
        setError(err.message || "Failed to load video");
        toast.error(err.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    })();
  }, [videoId, navigate]);

  // ─── Wire video element ─────────────────────────────────────────────────
  useEffect(() => {
    if (!video) return;
    const el = videoRef.current;
    if (!el) return;

    const src = video.videoUrl || video.video_url;
    if (el.getAttribute("src") !== src) {
      el.setAttribute("src", src);
      el.load();
    }

    el.volume = volume;
    el.playbackRate = 1;
    el.playsInline = true;
    el.disablePictureInPicture = true;

    Object.assign(el.style, {
      display: "block",
      width: "100%",
      height: "100%",
      background: "black",
      userSelect: "none",
      WebkitUserSelect: "none",
    });

    const onMeta = () => {
      setDuration(el.duration || 0);
      setProgress(el.currentTime || 0);
    };
    const onTime = () => setProgress(el.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onRate = () => setSpeed(el.playbackRate);
    const onVol = () => setVolume(el.muted ? 0 : el.volume);
    const noCtx = (e) => e.preventDefault();
    const noDrag = (e) => e.preventDefault();

    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("canplay", onMeta);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ratechange", onRate);
    el.addEventListener("volumechange", onVol);
    el.addEventListener("contextmenu", noCtx);
    el.addEventListener("dragstart", noDrag);

    if (normalSlotRef.current) normalSlotRef.current.appendChild(el);
    el.play().catch(() => {});

    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("canplay", onMeta);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ratechange", onRate);
      el.removeEventListener("volumechange", onVol);
      el.removeEventListener("contextmenu", noCtx);
      el.removeEventListener("dragstart", noDrag);
    };
  }, [video]);

  // ─── Stable control callbacks ───────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.paused ? el.play().catch(() => {}) : el.pause();
  }, []);

  const handleSeek = useCallback((value) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(value, el.duration || value));
  }, []);

  const handleVolumeChange = useCallback((value) => {
    const el = videoRef.current;
    if (!el) return;
    const vol = Math.min(Math.max(value, 0), 1);
    el.volume = vol;
    el.muted = vol === 0;
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.muted || el.volume === 0) {
      el.muted = false;
      if (el.volume === 0) el.volume = 0.5;
    } else el.muted = true;
  }, []);

  const handleSpeedChange = useCallback((val) => {
    const el = videoRef.current;
    if (el) el.playbackRate = val;
  }, []);

  const handleClosePlayer = useCallback(() => {
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }

    document.documentElement.style.overflow = "";
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }

    window.location.assign("/videos");
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.style.overflow = "hidden";
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.documentElement.style.overflow = "";
        if (document.fullscreenElement)
          document.exitFullscreen?.().catch(() => {});
      }
      return next;
    });
  }, []);

  // ─── Keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      switch (e.key) {
        case "k":
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "j":
          handleSeek((videoRef.current?.currentTime || 0) - 10);
          break;
        case "l":
          handleSeek((videoRef.current?.currentTime || 0) + 10);
          break;
        case "m":
          toggleMute();
          break;
        case "F11":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Escape":
          if (isFullscreen) {
            e.preventDefault();
            setIsFullscreen(false);
            document.documentElement.style.overflow = "";
            if (document.fullscreenElement)
              document.exitFullscreen?.().catch(() => {});
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, togglePlay, handleSeek, toggleMute, toggleFullscreen]);

  // ─── Native fullscreen change sync ─────────────────────────────────────
  useEffect(() => {
    const onFSChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        document.documentElement.style.overflow = "";
      }
    };
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  // Ensure no fullscreen/overflow/video state leaks when leaving this page.
  useEffect(
    () => () => {
      const el = videoRef.current;
      if (el) {
        el.pause();
        el.removeAttribute("src");
        el.load();
      }

      document.documentElement.style.overflow = "";
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    },
    [],
  );

  // ─── Loading / Error / Not found ───────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading video...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-linear-to-b from-[#06060a] to-[#0a0a0f] text-white px-6 py-16 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Could Not Load Video</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={handleClosePlayer}
            className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition"
          >
            Back to Library
          </button>
        </div>
      </div>
    );

  if (!video)
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center text-white">
        <p>Video not found</p>
      </div>
    );

  const controlProps = {
    isPlaying,
    progress,
    duration,
    volume,
    speed,
    isFullscreen,
    onTogglePlay: togglePlay,
    onSeek: handleSeek,
    onVolumeChange: handleVolumeChange,
    onToggleMute: toggleMute,
    onSpeedChange: handleSpeedChange,
    onToggleFullscreen: toggleFullscreen,
  };

  // Shared overlay transition style
  const overlayVisible = {
    opacity: 1,
    transition: "opacity 0.2s ease",
    pointerEvents: "auto",
  };
  const overlayHidden = {
    opacity: 0,
    transition: "opacity 0.4s ease",
    pointerEvents: "none",
  };

  return (
    <>
      {/* Single video element — moved via appendChild, never remounted */}
      <video
        ref={videoRef}
        playsInline={devtoolsOpen ? false : true}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        style={{ display: "none" }}
      />

      {/* Devtools block */}
      {devtoolsOpen && <DevtoolsBlock />}

      {/* ── Fullscreen ──────────────────────────────────────────────────── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black w-screen h-screen overflow-hidden">
          <div
            className="relative w-full h-full"
            style={{ cursor: showControls ? "default" : "none" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={togglePlay}
          >
            {/* Video slot */}
            <div
              ref={fullscreenSlotRef}
              className="absolute inset-0"
              style={{ pointerEvents: "none" }}
            />

            {/* Top bar — always visible at low opacity in fullscreen */}
            <div
              className="absolute inset-x-0 top-0 bg-linear-to-b from-black/80 to-transparent px-4 pt-3 pb-8 flex justify-between items-start z-10"
              style={{ opacity: 0.75, pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h1 className="text-xl font-bold text-white line-clamp-1 flex-1 pr-4">
                {video.title}
              </h1>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/25 transition-colors text-white shrink-0"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 size={22} />
              </button>
            </div>

            {/* Bottom controls — always visible at low opacity in fullscreen */}
            <div
              className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent text-white z-10"
              style={{ opacity: 1, pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <ControlBar {...controlProps} />
            </div>
          </div>
        </div>
      )}

      {/* ── Normal page ─────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-linear-to-b from-[#06060a] via-[#0a0a0f] to-[#0a0a0f] text-white flex flex-col items-center">
        <div className="w-full py-3 sm:py-4 flex flex-col items-center">
          <div
            className="bg-black rounded-xl overflow-hidden shadow-2xl"
            style={{ width: "90vw" }}
          >
            <div
              className="relative bg-black"
              style={{
                width: "90vw",
                height: "75vh",
                cursor: showControls ? "default" : "none",
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={togglePlay}
            >
              {/* Video slot */}
              <div
                ref={normalSlotRef}
                className="absolute inset-0"
                style={{ pointerEvents: "none" }}
              />

              {/* Top overlay */}
              <div
                className="absolute inset-x-0 top-0 bg-linear-to-b from-black/70 to-transparent px-4 pt-3 pb-8 flex justify-between items-start z-10"
                style={showControls ? overlayVisible : overlayHidden}
                onClick={(e) => e.stopPropagation()}
              >
                <h1 className="text-base sm:text-lg font-bold text-white line-clamp-1 flex-1 pr-4">
                  {video.title}
                </h1>
                <button
                  onClick={handleClosePlayer}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/25 transition-colors text-white shrink-0"
                  title="Back to library"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Bottom controls */}
              <div
                className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent text-white z-10"
                style={showControls ? overlayVisible : overlayHidden}
                onClick={(e) => e.stopPropagation()}
              >
                <ControlBar {...controlProps} />
              </div>
            </div>
          </div>

          {/* Info card */}
          <div className="mt-4 sm:mt-6" style={{ width: "90vw" }}>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {video.title}
              </h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4">
                {video.description || "No description provided"}
              </p>
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-white/50 border-t border-white/10 pt-4">
                <div>
                  <span className="text-white/70">Duration:</span>{" "}
                  {duration > 0 ? formatDuration(duration) : "N/A"}
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
    </>
  );
};

export default VideoPlayer;
