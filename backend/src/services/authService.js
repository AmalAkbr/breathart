// backend/src/services/authService.js
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '30d';

/**
 * Generate JWT Access Token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

/**
 * Generate JWT Refresh Token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
};

/**
 * Verify access token and get user
 */
export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    return {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Refresh session token
 */
export const refreshSession = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  } catch (error) {
    throw new Error('Failed to refresh token');
  }
};

/**
 * Get user profile with database details
 */
export const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password -emailVerificationToken -emailVerificationExpiry -passwordResetToken -passwordResetExpiry');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error('Failed to fetch user profile');
  }
};

/**
 * Register new user
 */
export const registerUser = async (userData) => {
  const { fullName, email, password, phone } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const user = new User({
    fullName,
    email,
    password,
    phone,
    role: 'user',
  });

  await user.save();

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export default {
  verifyToken,
  refreshSession,
  getUserProfile,
  registerUser,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
};
