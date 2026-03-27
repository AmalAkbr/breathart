// backend/src/middleware/admin.js
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../utils/envConfig.js';

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
    // Get token from Authorization header or authToken cookie
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const cookieToken = req.cookies?.authToken;

    const token = headerToken || cookieToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

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
    const user = await User.findById(decoded.userId);

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
