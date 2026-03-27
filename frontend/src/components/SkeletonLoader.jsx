import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="group relative h-full flex flex-col overflow-hidden rounded-xl bg-linear-to-br from-white/5 to-white/2 border border-white/10 animate-pulse">
      {/* Skeleton Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-linear-to-r from-white/5 via-white/10 to-white/5" />

      {/* Skeleton Content */}
      <div className="flex-1 p-4 space-y-3">
        <div className="h-3 bg-linear-to-r from-white/5 via-white/10 to-white/5 rounded w-3/4" />
        <div className="h-2 bg-linear-to-r from-white/5 via-white/10 to-white/5 rounded w-full" />
        <div className="h-2 bg-linear-to-r from-white/5 via-white/10 to-white/5 rounded w-2/3" />
        <div className="h-2 bg-linear-to-r from-white/5 via-white/10 to-white/5 rounded w-1/3 mt-4" />
      </div>
    </div>
  );
};

export default SkeletonLoader;
