// backend/src/utils/emailService.js
import nodemailer from 'nodemailer';
import { env } from './envConfig.js';

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


  const mailOptions = {
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_EMAIL}>`,
    to: email,
    subject: '📧 Confirm your email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Breath Art Institute!</h2>
        <p style="color: #666; font-size: 16px;">
          Thank you for signing up. Please confirm your email address by clicking the button below:
        </p>
        <a href="${verificationUrl}" style="
          display: inline-block;
          background-color: #0066cc;
          color: white;
          padding: 12px 24px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          margin: 20px 0;
        ">
          Confirm Email
        </a>
        <h2 style="color: #333;"><b>In case button did not works!</b> copy paste this token: <h4>${new URL(verificationUrl).searchParams.get("token")}</h4></h2 >
        <p style="color: #999; font-size: 12px;">
          <strong>This link expires in 24 hours.</strong><br>
          If you didn't create this account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2026 Breath Art Institute. All rights reserved.
        </p>
      </div>
  `,
    text: `
Welcome to Breath Art Institute!

Please confirm your email by visiting this link:
${verificationUrl}

This link expires in 24 hours.

If you didn't create this account, you can safely ignore this email.
    `
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send password reset email to user
 * @param {string} email - User email
 * @param {string} fullName - User's full name
 * @param {string} resetUrl - Full password reset link
 * @returns {Promise<object>} - Nodemailer response
 */
export const sendPasswordResetEmail = async (email, fullName = 'User', resetUrl) => {
  if (!email || !resetUrl) {
    throw new Error('Missing parameters: email, resetUrl');
  }

  const mailOptions = {
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_EMAIL}>`,
    to: email,
    subject: '🔐 Reset your password',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="color: #666; font-size: 16px;">
        We received a request to reset your password. Click the button below to set a new password:
      </p>
      <a href="${resetUrl}" style="
          display: inline-block;
          background-color: #0066cc;
          color: white;
          padding: 12px 24px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          margin: 20px 0;
        ">
        Reset Password
      </a>
      <p style="color: #999; font-size: 12px;">
        <strong>This link expires in 24 hours.</strong><br>
          If you didn't request a password reset, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2026 Breath Art Institute. All rights reserved.
        </p>
    </div>
    `,
    text: `
    Password Reset Request

    Please reset your password by visiting this link:
    ${resetUrl}

    This link expires in 24 hours.

    If you didn't request a password reset, you can safely ignore this email.
    `
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

  const {
    title,
    googleFormLink,
    description,
    startDate,
    endDate,
  } = examDetails;

  // Format dates
  const startDateStr = startDate ? new Date(startDate).toLocaleString() : 'Not specified';
  const endDateStr = endDate ? new Date(endDate).toLocaleString() : 'Not specified';

  // HTML email template
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Exam Invitation - Breath Art Institute</title>
            <style>
              body {
                font - family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
        }
              .container {
                max - width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
        }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
        }
              .header h1 {
                margin: 0;
              font-size: 28px;
              font-weight: 600;
        }
              .header p {
                margin: 5px 0 0 0;
              font-size: 14px;
              opacity: 0.9;
        }
              .content {
                padding: 30px 20px;
        }
              .greeting {
                font - size: 18px;
              color: #333;
              margin-bottom: 20px;
        }
              .exam-details {
                background: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
        }
              .exam-details h3 {
                margin: 0 0 10px 0;
              color: #333;
              font-size: 16px;
        }
              .detail-row {
                margin: 8px 0;
              font-size: 14px;
              color: #555;
        }
              .detail-label {
                font - weight: 600;
              color: #333;
              display: inline-block;
              width: 100px;
        }
              .cta-button {
                display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 600;
              margin: 20px 0;
              transition: transform 0.3s ease;
        }
              .cta-button:hover {
                transform: translateY(-2px);
        }
              .footer {
                background: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #e0e0e0;
        }
              .footer a {
                color: #667eea;
              text-decoration: none;
        }
              .important-note {
                background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 15px 0;
              border-radius: 4px;
              font-size: 13px;
              color: #856404;
        }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎬 Exam Invitation</h1>
                <p>Breath Art Institute</p>
              </div>

              <div class="content">
                <div class="greeting">
                  Hello <strong>${studentName}</strong>,
                </div>

                <p style="color: #555; line-height: 1.6;">
                  You have been selected to participate in an exam. Please review the details below and access the exam using the link provided.
                </p>

                <div class="exam-details">
                  <h3>📋 Exam Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">Title:</span>
                    <strong>${title}</strong>
                  </div>
                  ${description ? `
            <div class="detail-row">
              <span class="detail-label">Description:</span>
              ${description}
            </div>
            ` : ''}
                  <div class="detail-row">
                    <span class="detail-label">Start Date:</span>
                    ${startDateStr}
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">End Date:</span>
                    ${endDateStr}
                  </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${googleFormLink}" class="cta-button">Access Exam →</a>
                </div>

                <div class="important-note">
                  <strong>⚠️ Important:</strong> Please complete this exam before the end date. Once submitted, you cannot resubmit your responses.
                </div>

                <p style="color: #777; font-size: 14px; line-height: 1.6;">
                  If you have any questions or face any technical issues, please contact your instructor or our support team.
                </p>
              </div>

              <div class="footer">
                <p>© 2026 Breath Art Institute. All rights reserved.</p>
                <p><a href="https://breathart.com">Visit our website</a></p>
              </div>
            </div>
          </body>
        </html>
        `;

  // Plain text version for email clients that don't support HTML
  const textTemplate = `
        EXAM INVITATION
===============

Hello ${studentName},

You have been selected to participate in an exam.

EXAM DETAILS
============
Title: ${title}
${description ? `Description: ${description}\n` : ''}Start Date: ${startDateStr}
End Date: ${endDateStr}

ACCESS EXAM
===========
Please visit the link below to access the exam:
${googleFormLink}

IMPORTANT
=========
Please complete this exam before the end date. Once submitted, you cannot resubmit your responses.

If you have any questions, please contact your instructor.

---
© 2026 Breath Art Institute
  `;

  try {
    const mailOptions = {
      from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_EMAIL}>`,
      to: studentEmail,
      subject: `📋 Exam Invitation: ${title}`,
      text: textTemplate,
      html: htmlTemplate,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${studentEmail} for exam: ${title}`);
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
