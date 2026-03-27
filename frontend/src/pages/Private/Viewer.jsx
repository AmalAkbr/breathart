import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoCard from '../../components/VideoCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import { getAuthToken, videoAPI } from '../../utils/apiClient';
import { toast } from '../../utils/toast';

const VideoViewer = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check authentication and fetch videos
  useEffect(() => {
    const load = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          navigate('/auth', { replace: true });
          return;
        }

        const res = await videoAPI.getAll();
        const list = res.data || res.videos || [];
        setVideos(list);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError(err.message || 'Failed to load videos');
        toast.error(err.message || 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const handleCardClick = (videoId) => {
    navigate(`/player/${videoId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#06060a] to-[#0a0a0f] text-white px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
            Video Library
          </h1>
          <p className="text-white/50 mb-12">Loading your videos...</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#06060a] to-[#0a0a0f] text-white px-6 py-16 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Videos</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#06060a] to-[#0a0a0f] text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
            Video Library
          </h1>
          <p className="text-white/50">
            {videos.length} video{videos.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => {
              const vid = video._id || video.id;
              return (
                <VideoCard
                  key={vid}
                  video={video}
                  onClick={() => handleCardClick(vid)}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold mb-2">No Videos Yet</h2>
            <p className="text-white/60 mb-6">Videos will appear here once uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoViewer;