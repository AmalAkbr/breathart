import express from 'express';
import * as videoController from '../controllers/videoController.js';
import { authenticateToken } from '../middleware/auth.js';
import verifyAdmin from '../middleware/admin.js';

const router = express.Router();

// GET all videos (public)
router.get('/', videoController.getAllVideos);

// GET single video (public)
router.get('/:videoId', videoController.getVideoById);

// POST create video entry (admin only)
router.post('/', verifyAdmin, videoController.createVideo);

// PUT update video (admin only)
router.put('/:videoId', verifyAdmin, videoController.updateVideo);

// DELETE video (admin only)
router.delete('/:videoId', verifyAdmin, videoController.deleteVideo);

export default router;

