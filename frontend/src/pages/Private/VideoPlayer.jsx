import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { getAuthToken, videoAPI } from '../../utils/apiClient';
import { toast } from '../../utils/toast';
import SecurityBlankScreen from '../../components/SecurityBlankScreen';
import { useDevtoolsShield } from '../../hooks/useDevtoolsShield';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { isProduction: isProdEnv, isDevtoolsOpen } = useDevtoolsShield();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

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


  useEffect(() => {
    if (!isProdEnv || !isDevtoolsOpen) {
      return;
    }

    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isDevtoolsOpen, isProdEnv]);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      // Entering fullscreen
      document.documentElement.style.overflow = 'hidden';
      if (typeof document !== 'undefined' && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // Fallback if native fullscreen not supported
        });
      }
    } else {
      // Exiting fullscreen
      document.documentElement.style.overflow = 'auto';
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {
          // Fallback
        });
      }
    }
  };

  // Handle F11 and Escape keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F11' || e.key === 'f11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
        document.documentElement.style.overflow = 'auto';
        if (typeof document !== 'undefined' && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  if (isProdEnv && isDevtoolsOpen) {
    return <SecurityBlankScreen />;
  }

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

  // Fullscreen modal view
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black z-50 w-screen h-screen overflow-hidden">
        <div className="relative w-full h-full bg-black flex items-center justify-center group">
          <video
            ref={videoRef}
            src={video.videoUrl || video.video_url}
            className="w-full h-full object-contain"
            onContextMenu={handleVideoContextMenu}
            onDragStart={handleDragStart}
            controls={false}
            playsInline
            disablePictureInPicture
            controlsList={isProdEnv ? 'nodownload noplaybackrate noremoteplayback' : 'noplaybackrate noremoteplayback'}
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
            }}
          />

          {/* Top Overlay - Title & Close */}
          <div className="absolute inset-x-0 top-0 bg-linear-to-b from-black/60 to-transparent px-4 py-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="flex-1 pr-4">
              <h1 className="text-2xl font-bold line-clamp-2">{video.title}</h1>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/30 transition shrink-0"
              title="Exit Fullscreen (Esc)"
            >
              <Minimize2 size={24} />
            </button>
          </div>

          {/* Bottom Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/40 to-transparent px-4 py-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 group/progress">
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : Math.max(progress + 1, 1)}
                step={0.1}
                value={Math.min(progress, duration || Math.max(progress, 0))}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer h-1 group-hover/progress:h-2 transition-all"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                    duration > 0 ? (progress / duration) * 100 : 0
                  }%, rgba(255,255,255,0.2) ${duration > 0 ? (progress / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded bg-white/10 hover:bg-white/20 transition"
                  title={isPlaying ? 'Pause (k)' : 'Play (k)'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                  onClick={() => handleSeek(Math.max(progress - 10, 0))}
                  className="px-3 py-2 rounded bg-white/5 hover:bg-white/15 transition text-sm font-semibold"
                  title="Back 10s (j)"
                >
                  -10s
                </button>
                
                <button
                  onClick={() => handleSeek(Math.min(progress + 10, duration || 0))}
                  className="px-3 py-2 rounded bg-white/5 hover:bg-white/15 transition text-sm font-semibold"
                  title="Forward 10s (l)"
                >
                  +10s
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded bg-white/5 hover:bg-white/15 transition"
                    title={volume === 0 ? 'Unmute (m)' : 'Mute (m)'}
                  >
                    {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-24 accent-red-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-white/70 tabular-nums">
                  {new Date(progress * 1000).toISOString().substr(14, 5)} / {duration ? new Date(duration * 1000).toISOString().substr(14, 5) : '00:00'}
                </span>
                
                <select
                  value={speed}
                  onChange={(e) => changeSpeed(Number(e.target.value))}
                  className="bg-white/10 border border-white/15 text-sm rounded px-2 py-1 text-white focus:outline-none hover:bg-white/20 transition"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <option key={s} value={s}>{s}x</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#06060a] via-[#0a0a0f] to-[#0a0a0f] text-white" ref={playerRef}>
      {/* YouTube-style compact layout */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
        
        {/* Video Player Container - YouTube style */}
        <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl group">
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
              autoPlay
              disablePictureInPicture
              controlsList={isProdEnv ? 'nodownload noplaybackrate noremoteplayback' : 'noplaybackrate noremoteplayback'}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                backgroundColor: 'black',
              }}
            />

            {/* Top Overlay - Title & Close (appears on hover) */}
            <div className="absolute inset-x-0 top-0 bg-linear-to-b from-black/60 to-transparent px-4 py-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <div className="flex-1 pr-4">
                <h1 className="text-lg sm:text-xl font-bold line-clamp-2">{video.title}</h1>
              </div>
              <button
                onClick={() => navigate('/videos')}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/30 transition shrink-0"
                title="Back to library"
              >
                <X size={20} />
              </button>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/40 to-transparent px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              {/* Progress Bar */}
              <div className="flex items-center gap-2 group/progress">
                <input
                  type="range"
                  min={0}
                  max={duration > 0 ? duration : Math.max(progress + 1, 1)}
                  step={0.1}
                  value={Math.min(progress, duration || Math.max(progress, 0))}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer h-1 group-hover/progress:h-1.5 transition-all"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                      duration > 0 ? (progress / duration) * 100 : 0
                    }%, rgba(255,255,255,0.2) ${duration > 0 ? (progress / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 sm:p-2 rounded bg-white/10 hover:bg-white/20 transition"
                    title={isPlaying ? 'Pause (k)' : 'Play (k)'}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>

                  <button
                    onClick={() => handleSeek(Math.max(progress - 10, 0))}
                    className="hidden sm:flex px-2 py-1.5 rounded bg-white/5 hover:bg-white/15 transition text-xs font-semibold items-center gap-1"
                    title="Back 10s (j)"
                  >
                    -10s
                  </button>
                  
                  <button
                    onClick={() => handleSeek(Math.min(progress + 10, duration || 0))}
                    className="hidden sm:flex px-2 py-1.5 rounded bg-white/5 hover:bg-white/15 transition text-xs font-semibold items-center gap-1"
                    title="Forward 10s (l)"
                  >
                    +10s
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleMute}
                      className="p-1.5 sm:p-2 rounded bg-white/5 hover:bg-white/15 transition"
                      title={volume === 0 ? 'Unmute (m)' : 'Mute (m)'}
                    >
                      {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-16 sm:w-20 accent-red-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-white/70 tabular-nums">
                    {new Date(progress * 1000).toISOString().substr(14, 5)} / {duration ? new Date(duration * 1000).toISOString().substr(14, 5) : '00:00'}
                  </span>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 sm:p-2 rounded bg-white/5 hover:bg-white/15 transition"
                    title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Fullscreen (F11)'}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>

                  <select
                    value={speed}
                    onChange={(e) => changeSpeed(Number(e.target.value))}
                    className="bg-white/10 border border-white/15 text-xs rounded px-2 py-1 text-white focus:outline-none hover:bg-white/20 transition"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <option key={s} value={s}>{s}x</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section - Compact */}
        <div className="mt-4 sm:mt-6 max-w-6xl">
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{video.title}</h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4">
              {video.description || 'No description provided'}
            </p>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-white/50 border-t border-white/10 pt-4">
              <div>
                <span className="text-white/70">Duration:</span>{' '}
                {video.duration || video.duration === 0
                  ? `${Math.floor((video.duration || 0) / 60)}:${(Math.floor((video.duration || 0) % 60)).toString().padStart(2, '0')}`
                  : 'N/A'}
              </div>
              <div>
                <span className="text-white/70">Category:</span> {video.category || 'General'}
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        {isProdEnv && (
          <div className="mt-4 sm:mt-6 px-4 sm:px-6 py-3 sm:py-4 bg-linear-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-xs sm:text-sm text-white/70 flex items-start gap-2">
              <span className="text-lg shrink-0">🔒</span>
              <span>This video is protected. Recording and downloading are disabled.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
