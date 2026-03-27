import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { getAuthToken, videoAPI } from '../../utils/apiClient';
import { toast } from '../../utils/toast';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const isProdEnv =
    (import.meta.env && import.meta.env.VITE_NODE_ENV === 'production') ||
    import.meta.env?.VITE_NODE_ENV === 'production';
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const devtoolsCheckIntervalRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [speed, setSpeed] = useState(1);

  const handleLoadedMetadata = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    setDuration(videoEl.duration || 0);
    setProgress(videoEl.currentTime || 0);
    setIsPlaying(!videoEl.paused);
  };

  const handleTimeUpdate = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    setProgress(videoEl.currentTime || 0);
  };

  const handlePlayEvt = () => setIsPlaying(true);
  const handlePauseEvt = () => setIsPlaying(false);

  // Handle DevTools Detection
  const handleDevtoolsDetected = useCallback(() => {
    console.error('❌ Developer tools detected. Access denied.');
    if (devtoolsCheckIntervalRef.current) {
      clearInterval(devtoolsCheckIntervalRef.current);
    }
    alert('⚠️ Developer tools are not allowed. Returning to home page.');
    navigate('/', { replace: true });
  }, [navigate]);

  // DevTools Detection
  useEffect(() => {
    if (!isProdEnv) return undefined;

    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+K
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.shiftKey && e.key === 'K') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J')
      ) {
        e.preventDefault();
        handleDevtoolsDetected();
        return false;
      }
    };

    // Detect if DevTools is already open
    const checkDevtools = () => {
      const devtools = { open: false };
      const threshold = 160;

      const check = () => {
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            handleDevtoolsDetected();
          }
        } else {
          devtools.open = false;
        }
      };

      return check;
    };

    const devtoolsCheck = checkDevtools();

    // Event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    // Check for devtools periodically
    devtoolsCheckIntervalRef.current = setInterval(devtoolsCheck, 500);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      if (devtoolsCheckIntervalRef.current) {
        clearInterval(devtoolsCheckIntervalRef.current);
      }
    };
  }, [handleDevtoolsDetected, navigate, isProdEnv]);

  // Check authentication and fetch video
  useEffect(() => {
    const checkAuthAndFetchVideo = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          navigate('/auth', { replace: true });
          return;
        }

        if (!videoId) {
          setError('No video selected');
          setLoading(false);
          return;
        }

        const res = await videoAPI.getById(videoId);
        const videoData = res.data || res.video;

        if (!videoData) {
          setError('Video not found');
          setLoading(false);
          return;
        }

        if (!videoData.videoUrl && !videoData.video_url) {
          setError('Video URL is missing');
          setLoading(false);
          return;
        }

        setVideo(videoData);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError(err.message || 'Failed to load video');
        toast.error(err.message || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchVideo();
  }, [videoId, navigate]);

  // Prevent video download/right-click save
  const handleVideoContextMenu = (e) => {
    if (!isProdEnv) return;
    e.preventDefault();
    return false;
  };

  // Disable drag and drop
  const handleDragStart = (e) => {
    if (!isProdEnv) return;
    e.preventDefault();
    return false;
  };

  // Video events: sync UI state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const syncFromVideo = () => {
      setDuration(video.duration || 0);
      setProgress(video.currentTime || 0);
      setIsPlaying(!video.paused);
      setSpeed(video.playbackRate);
      setVolume(video.muted ? 0 : video.volume);
    };

    const handleLoaded = syncFromVideo;
    const handleCanPlay = syncFromVideo;
    const handleTime = handleTimeUpdate;
    const handlePlay = handlePlayEvt;
    const handlePause = handlePauseEvt;
    const handleRate = () => setSpeed(video.playbackRate);
    const handleVolumeEvt = () => setVolume(video.muted ? 0 : video.volume);

    // Apply desired settings
    video.playbackRate = speed;
    video.volume = volume;
    video.muted = volume === 0;

    video.addEventListener('loadedmetadata', handleLoaded);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTime);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ratechange', handleRate);
    video.addEventListener('volumechange', handleVolumeEvt);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTime);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ratechange', handleRate);
      video.removeEventListener('volumechange', handleVolumeEvt);
    };
  }, [speed, volume]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (value) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(value, video.duration || value));
    video.currentTime = clamped;
    setProgress(clamped);
  };

  const handleVolumeChange = (value) => {
    const vol = Math.min(Math.max(value, 0), 1);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const muted = video.muted || volume === 0;
    if (muted) {
      video.muted = false;
      if (volume === 0) {
        handleVolumeChange(0.5);
      }
    } else {
      video.muted = true;
      handleVolumeChange(0);
    }
  };

  const changeSpeed = (val) => {
    setSpeed(val);
    if (videoRef.current) {
      videoRef.current.playbackRate = val;
    }
  };

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
      <div className="min-h-screen bg-linear-to-b from-[#06060a] to-[#0a0a0f] text-white px-6 py-16 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Could Not Load Video</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => navigate('/videos')}
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
    <div className="min-h-screen bg-black/95 text-white" ref={playerRef}>
      {/* Header with close button */}
      <div className="bg-linear-to-b from-black/80 to-transparent px-6 py-4 flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">{video.title}</h1>
          <p className="text-white/60 mt-1">{video.description}</p>
        </div>
        <button
          onClick={() => navigate('/videos')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition shrink-0"
          title="Back to library"
        >
          <X size={24} />
        </button>
      </div>

      {/* Video Player Container */}
      <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={video.videoUrl || video.video_url}
          className="w-full h-full"
          onContextMenu={handleVideoContextMenu}
          onDragStart={handleDragStart}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlayEvt}
          onPause={handlePauseEvt}
          controls={false}
          playsInline
          disablePictureInPicture
          controlsList={isProdEnv ? 'nodownload noplaybackrate noremoteplayback' : 'noplaybackrate noremoteplayback'}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            backgroundColor: 'black',
          }}
        />

        {/* Custom Controls */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 flex flex-col gap-2">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/70 tabular-nums w-16 text-right">
              {new Date(progress * 1000).toISOString().substr(14, 5)}
            </span>
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : Math.max(progress + 1, 1)}
              step={0.1}
              value={Math.min(progress, duration || Math.max(progress, 0))}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer"
            />
            <span className="text-xs text-white/70 tabular-nums w-16">
              {duration ? new Date(duration * 1000).toISOString().substr(14, 5) : '00:00'}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button
                onClick={() => handleSeek(Math.max(progress - 10, 0))}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition text-xs font-semibold flex items-center gap-1"
              >
                <span aria-hidden>-10s</span>
              </button>
              <button
                onClick={() => handleSeek(Math.min(progress + 10, duration || 0))}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition text-xs font-semibold flex items-center gap-1"
              >
                <span aria-hidden>+10s</span>
              </button>

              <button
                onClick={toggleMute}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition"
              >
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-28 accent-blue-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={speed}
                onChange={(e) => changeSpeed(Number(e.target.value))}
                className="bg-white/10 border border-white/15 text-sm rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <option key={s} value={s}>{s}x</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-6 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white/50">Duration</p>
            <p className="font-semibold">
              {video.duration || video.duration === 0
                ? `${Math.floor((video.duration || 0) / 60)}:${(Math.floor((video.duration || 0) % 60)).toString().padStart(2, '0')}`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-white/50">Description</p>
            <p className="font-semibold line-clamp-2">{video.description || 'No description provided'}</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      {isProdEnv && (
        <div className="px-6 py-4 bg-linear-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg mx-6 mb-6 mt-4">
          <p className="text-xs text-white/70 flex items-start gap-2">
            <span className="text-lg">🔒</span>
            <span>This video is protected. Recording, downloading, and developer tools are disabled. Attempting to use them will terminate your session.</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
