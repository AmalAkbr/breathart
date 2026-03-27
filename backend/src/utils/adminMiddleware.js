// backend/src/utils/adminMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

/**
 * Middleware to verify user is admin
 * Checks:
 * 1. User has valid JWT token
 * 2. User exists in User collection
 * 3. User role is 'admin'
 * 4. User has isAdmin = true (dual verification)
 * 5. User account is active
 */
const verifyAdmin = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Check if user exists and is admin
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Dual verification: Check both role and isAdmin flag
    if (user.role !== 'admin' || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'User is not an admin'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Admin account is inactive'
      });
    }

    // Attach user data to request
    req.user = user;
    req.admin = user; // For backward compatibility
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export default verifyAdmin;
