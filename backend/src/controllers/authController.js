import { User } from '../models/User.js';
import { Exam } from '../models/Exam.js';
import { ExamParticipant } from '../models/ExamParticipant.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import jwt from 'jsonwebtoken';
import { env } from '../utils/envConfig.js';
import crypto from 'crypto';

/**
 * POST /api/auth/signup - Register new user
 */
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    console.log('[SIGNUP] Creating new user:', email);

    // Create new user
    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();

    // Save user with tokens
    await user.save();

    console.log('[SIGNUP] User created successfully');

    // Generate email verification link
    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.fullName, verificationLink);
      console.log('[SIGNUP] ✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('[SIGNUP] ❌ Error sending verification email:', emailError.message);
      // Don't fail signup if email fails
    }

    // Generate JWT token for user (they can access protected routes while verifying email)
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, isAdmin: user.isAdmin },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY || '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isAdmin: user.isAdmin,
          isEmailVerified: user.isEmailVerified,
        }
      }
    });
  } catch (error) {
    console.error('[SIGNUP] Error:', error.message);

    if (error.name === 'ValidationError') {
      const validationMessages = Object.values(error.errors || {}).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: validationMessages[0] || 'Validation error',
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error during signup',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/verify-email - Verify email
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, verificationToken } = req.body;

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    console.log('[VERIFY EMAIL] Processing verification token');

    // Find user with token
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    }).select('+emailVerificationToken +emailVerificationExpiry');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if token is expired
    if (user.emailVerificationExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired'
      });
    }

    console.log('[VERIFY EMAIL] ✅ Token valid for user:', user.email);

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();

    // Generate JWT token for verified user
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, isAdmin: user.isAdmin },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY || '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now access your profile.',
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isAdmin: user.isAdmin,
          isEmailVerified: user.isEmailVerified,
        }
      }
    });
  } catch (error) {
    console.error('[VERIFY EMAIL] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error during email verification',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/login - Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    console.log('[LOGIN] Login attempt for:', email);

    // Find user and get password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Compare passwords
    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated, Please contact admin'
      });
    }

    console.log('[LOGIN] ✅ Login successful for:', email);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY || '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set secure cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          userId: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isAdmin: user.isAdmin,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified,
        }
      }
    });
  } catch (error) {
    console.error('[LOGIN] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/forgot-password - Request password reset
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('[FORGOT PASSWORD] Password reset request for:', email);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If email exists, password reset link has been sent'
      });
    }

    // Generate reset token (only token)
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    console.log('[FORGOT PASSWORD] Token generated for:', email);

    // Generate reset link
    const resetLink = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    // Send reset email (pass both link and token)
    try {
      await sendPasswordResetEmail(user.email, user.fullName, resetLink, resetToken);
      console.log('[FORGOT PASSWORD] ✅ Reset email sent successfully');
    } catch (emailError) {
      console.error('[FORGOT PASSWORD] ❌ Error sending reset email:', emailError.message);
      // Clear token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Password reset instructions have been sent to your email'
    });
  } catch (error) {
    console.error('[FORGOT PASSWORD] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/verify-reset-token - Verify password reset token
 */
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    console.log('[VERIFY TOKEN] Verifying reset token');

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
    }).select('+passwordResetToken +passwordResetExpiry email');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Check if token is expired
    if (user.passwordResetExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    console.log('[VERIFY TOKEN] ✅ Token valid for:', user.email);

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        email: user.email,
        userId: user._id
      }
    });
  } catch (error) {
    console.error('[VERIFY TOKEN] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error verifying token',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/reset-password - Reset password with token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    console.log('[RESET PASSWORD] Processing password reset');

    // Find user with token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
    }).select('+passwordResetToken +passwordResetExpiry');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token is expired
    if (user.passwordResetExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    console.log('[RESET PASSWORD] ✅ Token valid, updating password');

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
      data: {
        userId: user._id,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('[RESET PASSWORD] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/resend-verification - Resend verification email
 */
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('[RESEND VERIFICATION] Request for:', email);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    console.log('[RESEND VERIFICATION] Token generated for:', email);

    // Generate verification link
    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.fullName, verificationLink);
      console.log('[RESEND VERIFICATION] ✅ Email sent successfully');
    } catch (emailError) {
      console.error('[RESEND VERIFICATION] ❌ Error sending email:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Verification email has been resent. Please check your inbox.'
    });
  } catch (error) {
    console.error('[RESEND VERIFICATION] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error resending verification email',
      error: error.message
    });
  }
};

/**
 * GET /api/auth/profile - Get user profile (protected)
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('[GET PROFILE] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

/**
 * GET /api/auth/exam-notifications - Get exam notifications for logged-in user
 */
export const getExamNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const participants = await ExamParticipant.find({
      userId,
      emailSent: true,
    })
      .sort({ emailSentAt: -1, createdAt: -1 })
      .populate({
        path: 'examId',
        model: Exam,
        select: 'title description googleFormLink startDate endDate status createdAt updatedAt',
      })
      .lean();

    const notifications = participants
      .filter((participant) => participant.examId)
      .map((participant) => ({
        participantId: participant._id,
        examId: participant.examId._id,
        title: participant.examId.title,
        description: participant.examId.description,
        googleFormLink: participant.examId.googleFormLink,
        startDate: participant.examId.startDate,
        endDate: participant.examId.endDate,
        examStatus: participant.examId.status,
        emailSentAt: participant.emailSentAt,
        submitted: participant.submitted,
        submittedAt: participant.submittedAt,
        createdAt: participant.createdAt,
      }));

    return res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('[GET EXAM NOTIFICATIONS] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching exam notifications',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/logout - Logout user
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie('authToken');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('[LOGOUT] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};
