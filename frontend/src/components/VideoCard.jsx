import React, { useState } from 'react';
import { Play, Clock } from 'lucide-react';

const VideoCard = ({ video, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const thumb = video.thumbnail || video.thumbnail_url;

  const formatDuration = (seconds) => {
    if (seconds === undefined || seconds === null) return null;
    if (Number.isNaN(Number(seconds))) return null;
    const total = Math.max(0, Number(seconds));
    if (!Number.isFinite(total)) return null;
    const mins = Math.floor(total / 60);
    const secs = Math.floor(total % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <button
      onClick={onClick}
      className="group relative h-full flex flex-col overflow-hidden rounded-xl bg-linear-to-br from-white/5 to-white/2 backdrop-blur border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white/50"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-black/40">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-linear-to-r from-white/5 to-white/10 animate-pulse" />
        )}

        {!imageError ? (
          <img
            src={thumb}
            alt={video.title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-500/20 to-pink-500/20">
            <div className="text-center">
              <div className="text-2xl mb-2">🎬</div>
              <p className="text-xs text-white/50">No thumbnail</p>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur group-hover:bg-white/90 transition-all duration-300 flex items-center justify-center">
            <Play className="w-6 h-6 text-white group-hover:text-black fill-current transition-all duration-300" />
          </div>
        </div>

        {/* Duration Badge */}
        {formatDuration(video.duration) && (
          <div className="absolute bottom-2 right-2 flex items-center gap-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-xs font-semibold text-white border border-white/20">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="text-left">
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-white/90 transition">
            {video.title}
          </h3>
          <p className="text-xs text-white/50 mt-2 line-clamp-2">
            {video.description || 'No description'}
          </p>
        </div>

        <p className="text-xs text-white/40 mt-3 pt-3 border-t border-white/10">
          {formatDate(video.createdAt || video.created_at)}
        </p>
      </div>
    </button>
  );
};

export default VideoCard;
