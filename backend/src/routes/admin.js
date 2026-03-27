// backend/src/routes/admin.js
import express from 'express';
import verifyAdmin from '../middleware/admin.js';
import { authenticateToken } from '../middleware/auth.js';
import * as examController from '../controllers/examController.js';
import * as videoService from '../services/videoService.js';
import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ===== ADMIN SETUP =====
/**
 * POST /api/admin/enable-admin
 * Enable admin privileges for authenticated user with "admin" role
 * User must have role='admin' but isAdmin=false to use this
 */
router.post('/enable-admin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'User does not have admin role assigned'
      });
    }

    // Enable admin flag
    if (!user.isAdmin) {
      user.isAdmin = true;
      user.isActive = true;
      await user.save();
      console.log(`✅ Admin privileges enabled for: ${user.email}`);
    }

    res.json({
      success: true,
      message: 'Admin privileges enabled',
      user: {
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error enabling admin:', error);
    res.status(500).json({
      success: false,
      error: 'Error enabling admin',
      details: error.message
    });
  }
});

// GET all exams
router.get('/exams', verifyAdmin, examController.getAllExams);

// GET single exam with participants
router.get('/exams/:id', verifyAdmin, examController.getExamDetail);

// GET available students for exam
router.get('/students', verifyAdmin, examController.searchStudents);

// POST create new exam
router.post('/exams', verifyAdmin, examController.createExam);

// POST add participants to exam
router.post('/exams/:id/add-participants', verifyAdmin, examController.addParticipants);

// POST send exam invitations
router.post('/exams/:id/send-invitations', verifyAdmin, examController.sendInvitations);

// PUT update exam details
router.put('/exams/:id', verifyAdmin, examController.updateExam);

// DELETE exam
router.delete('/exams/:id', verifyAdmin, examController.deleteExam);

// ===== VIDEO MANAGEMENT =====
/**
 * POST /api/admin/videos
 * Upload video metadata (called by UploadVideo component)
 */
router.post('/videos', verifyAdmin, async (req, res) => {
  try {
    const { title, description, category, thumbnailUrl, thumbnailFileId, videoUrl, duration } = req.body;

    if (!title || !thumbnailUrl) {
      return res.status(400).json({
        success: false,
        error: 'Title and thumbnail URL are required'
      });
    }

    // Get admin ID from authenticated user
    const adminId = req.user?.userId;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: 'Admin user not properly authenticated'
      });
    }

    // Create video using videoService directly
    const video = await videoService.createVideo({
      title,
      description,
      thumbnail: thumbnailUrl,
      thumbnailFileId,
      videoUrl: videoUrl || '', // Empty string if not provided
      duration: duration ? parseInt(duration) : null,
      category: category || 'tutorial',
      createdBy: adminId, // Admin who created
      tags: []
    });

    // Send success response ✅
    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating video',
      details: error.message
    });
  }
});

// ===== USER MANAGEMENT =====
/**
 * GET /api/admin/users
 * Get all users for admin management
 */
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('_id fullName email role isActive isEmailVerified createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching users',
      details: error.message
    });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user details (except password)
 */
router.put('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, isActive, isEmailVerified } = req.body;

    if (
      fullName === undefined &&
      email === undefined &&
      role === undefined &&
      isActive === undefined &&
      isEmailVerified === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'At least one field to update is required'
      });
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role value'
        });
      }
      updateData.role = role;
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isEmailVerified !== undefined) updateData.isEmailVerified = Boolean(isEmailVerified);

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    ).select('_id fullName email role isActive isEmailVerified createdAt updatedAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: user
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating user',
      details: error.message
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting user',
      details: error.message
    });
  }
});

// ===== OVERVIEW STATS =====
router.get('/overview', verifyAdmin, async (_req, res) => {
  try {
    const [totalUsers, activeUsers, verifiedUsers, totalVideos, publishedVideos, latestVideos] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'user', isEmailVerified: true }),
      Video.countDocuments({ status: { $ne: 'archived' } }),
      Video.countDocuments({ status: 'published' }),
      Video.find({ status: { $ne: 'archived' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title thumbnail category status createdAt duration'),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalVideos,
        publishedVideos,
        latestVideos,
      },
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching overview',
      details: error.message,
    });
  }
});

export default router;
