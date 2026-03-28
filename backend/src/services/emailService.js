// backend/src/utils/emailService.js
import nodemailer from 'nodemailer';
import { env } from '../utils/envConfig.js';
import { verificationEmailTemplate } from './templates/verificationEmailTemplate.js';
import { passwordResetEmailTemplate } from './templates/passwordResetEmailTemplate.js';
import { examInvitationEmailTemplate } from './templates/examInvitationEmailTemplate.js';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: env.EMAIL_SERVICE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else if (env.isDev) {
    console.log('✅ Email service ready to send mail ');
  }
});

/**
 * Send verification email to new user
 * @param {string} email - User email
 * @param {string} fullName - User's full name
 * @param {string} verificationUrl - Full verification link
 * @returns {Promise<object>} - Nodemailer response
 */
export const sendVerificationEmail = async (email, fullName = 'User', verificationUrl) => {
  if (!email || !verificationUrl) {
    throw new Error('Missing parameters: email, verificationUrl');
  }

  const { subject, text, html } = verificationEmailTemplate({ verificationUrl });

  const mailOptions = {
    from: `${env.FROM_EMAIL}`,
    to: email,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send password reset email to user
 * @param {string} email - User email
 * @param {string} fullName - User's full name
 * @param {string} resetUrl - Full password reset link with token
 * @param {string} resetToken - Plain reset token for manual entry
 * @returns {Promise<object>} - Nodemailer response
 */
export const sendPasswordResetEmail = async (email, fullName = 'User', resetUrl, resetToken) => {
  if (!email || !resetUrl) {
    throw new Error('Missing parameters: email, resetUrl');
  }

  const { subject, text, html } = passwordResetEmailTemplate({ resetUrl, resetToken });

  const mailOptions = {
    from: `${env.FROM_EMAIL}`,
    to: email,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send exam invitation email to student
 * @param {string} studentEmail - Student email address
    * @param {string} studentName - Student full name
    * @param {object} examDetails - Exam object with title, googleFormLink, startDate, endDate, description
    * @returns {Promise < object >} - Nodemailer response
    */
export const sendExamInvitation = async (studentEmail, studentName, examDetails) => {
  if (!studentEmail || !studentName || !examDetails) {
    throw new Error('Missing required parameters: studentEmail, studentName, examDetails');
  }


  const { subject, text, html } = examInvitationEmailTemplate({
    studentName,
    examDetails,
  });

  try {
    const mailOptions = {
      from: `${env.FROM_EMAIL}`,
      to: studentEmail,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${studentEmail} for exam: ${examDetails.title}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending email to ${studentEmail}:`, error.message);
    throw error;
  }
};

/**
 * Send bulk exam invitations to multiple students
 * @param {array} students - Array of {email, fullName}
 * @param {object} examDetails - Exam object
 * @returns {Promise<object>} - Results with successful and failed sends
 */
export const sendBulkExamInvitations = async (students, examDetails) => {
  const results = {
    success: [],
    failed: [],
  };

  for (const student of students) {
    try {
      await sendExamInvitation(student.email, student.fullName, examDetails);
      results.success.push(student.email);
    } catch (error) {
      results.failed.push({
        email: student.email,
        error: error.message,
      });
    }
  }

  return results;
};

export default transporter;
