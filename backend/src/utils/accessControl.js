// backend/src/utils/accessControl.js
/**
 * Access Control Utilities
 * Prevent IDOR (Insecure Direct Object Reference) vulnerabilities
 */

import { Exam } from '../models/Exam.js';
import { Video } from '../models/Video.js';
import { User } from '../models/User.js';

/**
 * Verify user owns the exam
 * Prevents accessing other admin's exams
 */
export const verifyExamOwnership = async (examId, userId) => {
  if (!examId || !userId) {
    throw new Error('Invalid exam ID or user ID');
  }

  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  // Check if user created this exam
  if (exam.createdBy.toString() !== userId.toString()) {
    throw new Error('You do not have permission to access this exam');
  }

  return exam;
};

/**
 * Verify user owns the video
 */
export const verifyVideoOwnership = async (videoId, userId) => {
  if (!videoId || !userId) {
    throw new Error('Invalid video ID or user ID');
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new Error('Video not found');
  }

  // Check if user created this video
  if (video.createdBy?.toString() !== userId.toString()) {
    throw new Error('You do not have permission to access this video');
  }

  return video;
};

/**
 * Verify user can access/modify another user
 * Admins can only edit their own profile or admin-designated user management
 */
export const verifyUserAccess = async (targetUserId, requestingUserId, isAdmin) => {
  if (!targetUserId || !requestingUserId) {
    throw new Error('Invalid user ID');
  }

  // Users can only access their own profile
  if (!isAdmin) {
    if (targetUserId.toString() !== requestingUserId.toString()) {
      throw new Error('You do not have permission to access this user');
    }
  }

  // For admin users, they can manage users but not themselves (prevent privilege escalation)
  // This is handled by the admin middleware

  const user = await User.findById(targetUserId);
  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Verify user can access exam participant data
 */
export const verifyParticipantAccess = async (examId, userId, isAdmin) => {
  if (!examId || !userId) {
    throw new Error('Invalid exam ID or user ID');
  }

  if (!isAdmin) {
    // Non-admin users cannot view participant data
    throw new Error('You do not have permission to view participant data');
  }

  // For admin, verify they own the exam
  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  if (exam.createdBy.toString() !== userId.toString()) {
    throw new Error('You do not have permission to view this exam\'s participants');
  }

  return exam;
};

/**
 * Sanitize query to prevent IDOR in list operations
 */
export const sanitizeListQuery = (userId, isAdmin, includeAdmin = false) => {
  const query = { isActive: true };

  if (!isAdmin) {
    // Non-admin users can only see non-admin users
    query.role = 'user';
  } else if (!includeAdmin) {
    // Admin users (unless specified) don't see other admin users
    query.role = 'user';
  }

  return query;
};

/**
 * Verify resource ownership middleware
 */
export const checkResourceOwnership = (resourceField = 'createdBy') => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || req.admin?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Fetch the resource
      let resourceModel;
      if (req.path.includes('exams')) {
        resourceModel = await Exam.findById(id);
      } else if (req.path.includes('videos')) {
        resourceModel = await Video.findById(id);
      }

      if (!resourceModel) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check ownership
      const owner = resourceModel[resourceField];
      if (owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }

      // Attach resource to request
      req.resource = resourceModel;
      next();
    } catch (error) {
      console.error('Resource ownership check failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: error.message
      });
    }
  };
};
