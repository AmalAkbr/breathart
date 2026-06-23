import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api.js";

// Auth hooks
export const useAuthFunctions = () => {
  const signup = useMutation(api.auth.signup);
  const login = useMutation(api.auth.login);
  const updateUserProfile = useMutation(api.auth.updateUserProfile);
  const verifyEmail = useMutation(api.auth.verifyEmail);
  const resendVerificationEmail = useMutation(api.auth.resendVerificationEmail);
  const forgotPassword = useMutation(api.auth.forgotPassword);
  const resetPassword = useMutation(api.auth.resetPassword);
  const enableAdmin = useMutation(api.auth.enableAdmin);
  const updateUserAdmin = useMutation(api.auth.updateUserAdmin);
  const deleteUserAdmin = useMutation(api.auth.deleteUserAdmin);

  return {
    signup,
    login,
    updateUserProfile,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    enableAdmin,
    updateUserAdmin,
    deleteUserAdmin,
  };
};

export const useUserById = (userId) => {
  return useQuery(api.auth.getUserById, userId ? { userId } : "skip");
};

export const useUserByEmail = (email) => {
  return useQuery(api.auth.getUserByEmail, email ? { email } : "skip");
};

export const useAllUsers = (role) => {
  return useQuery(api.auth.getAllUsers, role ? { role } : {});
};

export const useVerifyResetToken = () => {
  return useMutation(api.auth.verifyResetToken);
};

export const useProfile = (userId) => {
  return useQuery(api.auth.getProfile, userId ? { userId } : "skip");
};

export const useExamNotifications = (userId) => {
  return useQuery(api.auth.getExamNotifications, userId ? { userId } : "skip");
};

export const useOverview = () => {
  return useQuery(api.auth.getOverview, {});
};

// Exam hooks
export const useExamFunctions = () => {
  const createExam = useMutation(api.exams.createExam);
  const addParticipants = useMutation(api.exams.addParticipants);
  const sendInvitations = useMutation(api.exams.sendInvitations);
  const updateExam = useMutation(api.exams.updateExam);
  const deleteExam = useMutation(api.exams.deleteExam);
  const publishExam = useMutation(api.exams.publishExam);

  return {
    createExam,
    addParticipants,
    sendInvitations,
    updateExam,
    deleteExam,
    publishExam,
  };
};

// Video hooks
export const useVideoFunctions = () => {
  const createVideo = useMutation(api.videos.createVideo);
  const updateVideo = useMutation(api.videos.updateVideo);
  const deleteVideo = useMutation(api.videos.deleteVideo);
  const publishVideo = useMutation(api.videos.publishVideo);
  const unpublishVideo = useMutation(api.videos.unpublishVideo);
  const incrementViews = useMutation(api.videos.incrementViews);
  const generateVideoUploadUrl = useAction(api.videos.generateVideoUploadUrl);

  return {
    createVideo,
    updateVideo,
    deleteVideo,
    publishVideo,
    unpublishVideo,
    incrementViews,
    generateVideoUploadUrl,
  };
};

export const useAllExams = (adminId) => {
  return useQuery(api.exams.getAllExams, adminId ? { adminId } : "skip");
};

export const useExamDetail = (examId, adminId) => {
  const args = !examId ? "skip" : adminId ? { examId, adminId } : { examId };
  return useQuery(api.exams.getExamDetail, args);
};

export const useSearchStudents = (search) => {
  return useQuery(api.exams.searchStudents, search ? { search } : {});
};

export const useExamStats = (examId) => {
  return useQuery(api.exams.getExamStats, examId ? { examId } : "skip");
};

export const useAllVideos = () => {
  return useQuery(api.videos.getAllVideos, {});
};

export const useVideoById = (videoId) => {
  return useQuery(api.videos.getVideoById, videoId ? { videoId } : "skip");
};

export const useVideosByCategory = (category) => {
  return useQuery(api.videos.getVideosByCategory, category ? { category } : "skip");
};

export const useVideosByAdmin = (adminId) => {
  return useQuery(api.videos.getVideosByAdmin, adminId ? { adminId } : "skip");
};
