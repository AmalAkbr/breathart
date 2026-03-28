import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required (ImageKit URL)'],
      // Format: https://ik.imagekit.io/habeeb/breathart-thumbnails/image.webp
    },
    thumbnailFileId: {
      type: String,
      // Needed for deleting from ImageKit
    },
    thumbnailPath: {
      type: String,
      // If thumbnail is stored in R2 instead of ImageKit
    },
    videoUrl: {
      type: String,
      // Optional - will be uploaded to Cloudflare R2
      // Format: https://pub-d61e467aa2e34d60b59daf9937ffbf2a.r2.dev/video.mp4
    },
    videoKey: {
      type: String,
      // R2 object key (e.g., videos/123-file.mp4) used for cleanup
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    category: {
      type: String,
      enum: ['course', 'tutorial', 'webinar', 'demo', 'lecture', 'other'],
      default: 'course',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin who created video is required'],
      // This is the admin user who uploaded the video
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    tags: [String],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Video = mongoose.model('Video', videoSchema);
