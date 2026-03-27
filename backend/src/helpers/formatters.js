// backend/src/helpers/formatters.js
/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return 'Not specified';
  return new Date(date).toLocaleString();
};

/**
 * Format file size to readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format exam response
 */
export const formatExamResponse = (exam) => {
  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    googleFormLink: exam.google_form_link,
    status: exam.status,
    startDate: formatDate(exam.start_date),
    endDate: formatDate(exam.end_date),
    createdAt: formatDate(exam.created_at),
    updatedAt: formatDate(exam.updated_at),
  };
};

/**
 * Format video response
 */
export const formatVideoResponse = (video) => {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnail_url,
    videoUrl: video.video_url,
    duration: video.duration,
    createdAt: formatDate(video.created_at),
    updatedAt: formatDate(video.updated_at),
  };
};

/**
 * Format student response
 */
export const formatStudentResponse = (student) => {
  return {
    id: student.id,
    fullName: student.full_name,
    email: student.email,
  };
};

/**
 * Clean error message
 */
export const cleanErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  return error?.message || 'An unknown error occurred';
};

export default {
  formatDate,
  formatFileSize,
  formatExamResponse,
  formatVideoResponse,
  formatStudentResponse,
  cleanErrorMessage,
};
