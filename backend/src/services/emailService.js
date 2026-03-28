// backend/src/utils/emailService.js
import nodemailer from 'nodemailer';
import { env } from '../utils/envConfig.js';

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


  const token = new URL(verificationUrl).searchParams.get("token");

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Confirmation - Breath Art Institute</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
            color: #333;
          }
          .wrapper {
            background-color: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1a237e 0%, #37474f 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .header .institute-name {
            font-size: 13px;
            opacity: 0.85;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #1a237e;
          }
          .intro-text {
            color: #555;
            font-size: 14px;
            line-height: 1.8;
            margin-bottom: 28px;
          }
          .cta-section {
            text-align: center;
            margin: 32px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #1a237e 0%, #37474f 100%);
            color: white;
            padding: 14px 36px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
          }
          .cta-button:hover {
            box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
            transform: translateY(-1px);
          }
          .token-section {
            background: #f8fafb;
            border-left: 4px solid #1a237e;
            padding: 16px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .token-section p {
            font-size: 13px;
            color: #555;
            margin-bottom: 8px;
          }
          .token {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            word-break: break-all;
            color: #1a237e;
            font-weight: 600;
            font-size: 12px;
          }
          .expiry-note {
            background: #fff3cd;
            border-left: 4px solid #f39c12;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #7a5c0f;
          }
          .support-text {
            color: #777;
            font-size: 13px;
            line-height: 1.8;
            margin-top: 24px;
          }
          .divider {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 32px 0;
          }
          .footer {
            background: #f8fafb;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
          }
          .footer-text {
            font-size: 12px;
            color: #888;
            margin: 6px 0;
          }
          .footer a {
            color: #1a237e;
            text-decoration: none;
            font-weight: 500;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>Email Confirmation</h1>
              <div class="institute-name">Breath Art Institute</div>
            </div>

            <div class="content">
              <div class="greeting">Hello,</div>

              <p class="intro-text">
                Welcome to Breath Art Institute! Thank you for signing up. To complete your registration, please confirm your email address by clicking the button below.
              </p>

              <div class="cta-section">
                <a href="${verificationUrl}" class="cta-button" style="color:#FFF;">Confirm Email</a>
              </div>

              <div class="token-section">
                <p><strong>Token (if button doesn't work):</strong></p>
                <div class="token">${token}</div>
              </div>

              <div class="expiry-note">
                <strong>⏱ Note:</strong> This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
              </div>

              <p class="support-text">
                If you encounter any issues confirming your email, please contact our support team for assistance.
              </p>

              <hr class="divider">
            </div>

            <div class="footer">
              <p class="footer-text">© 2026 Breath Art Institute. All rights reserved.</p>
              <p class="footer-text"><a href="https://www.breathartinstitute.in/">Visit our website</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const textTemplate = `
EMAIL CONFIRMATION
================================================================================

Welcome to Breath Art Institute!

Thank you for signing up. Please confirm your email address using the link below.

VERIFICATION LINK
================================================================================

${verificationUrl}

TOKEN (if link doesn't work)
================================================================================

${token}

IMPORTANT
================================================================================

This link expires in 24 hours.

If you didn't create this account, you can safely ignore this email.

NEED HELP?
================================================================================

If you encounter any issues, please contact our support team.

---
© 2026 Breath Art Institute
Website: https://www.breathartinstitute.in/
================================================================================
  `;

  const mailOptions = {
    from: `${env.FROM_EMAIL}`,
    to: email,
    subject: 'Confirm Your Email - Breath Art Institute',
    text: textTemplate,
    html: htmlTemplate,
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

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Breath Art Institute</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
            color: #333;
          }
          .wrapper {
            background-color: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1a237e 0%, #37474f 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .header .institute-name {
            font-size: 13px;
            opacity: 0.85;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #1a237e;
          }
          .intro-text {
            color: #555;
            font-size: 14px;
            line-height: 1.8;
            margin-bottom: 28px;
          }
          .cta-section {
            text-align: center;
            margin: 32px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #1a237e 0%, #37474f 100%);
            color: white;
            padding: 14px 36px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
          }
          .cta-button:hover {
            box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
            transform: translateY(-1px);
          }
          .security-warning {
            background: #fef5e7;
            border-left: 4px solid #f39c12;
            padding: 16px;
            margin: 24px 0;
            border-radius: 6px;
            font-size: 13px;
            color: #7a5c0f;
          }
          .security-warning strong {
            color: #7a5c0f;
          }
          .support-text {
            color: #777;
            font-size: 13px;
            line-height: 1.8;
            margin-top: 24px;
          }
          .divider {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 32px 0;
          }
          .footer {
            background: #f8fafb;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
          }
          .footer-text {
            font-size: 12px;
            color: #888;
            margin: 6px 0;
          }
          .footer a {
            color: #1a237e;
            text-decoration: none;
            font-weight: 500;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
              <div class="institute-name">Breath Art Institute</div>
            </div>

            <div class="content">
              <div class="greeting">Hello,</div>

              <p class="intro-text">
                We received a request to reset your account password. Click the button below to create a new password. This link is valid for 24 hours.
              </p>

              <div class="cta-section">
                <a href="${resetUrl}" class="cta-button" style="color:#FFF;">Reset Password</a>
              </div>

              <div class="security-warning">
                <strong>⚠ Security Note:</strong> If you did not request a password reset, please ignore this email and your account will remain secure. Do not share this link with anyone.
              </div>

              <p class="support-text">
                If you encounter any issues resetting your password or need assistance, please contact our support team immediately.
              </p>

              <hr class="divider">
            </div>

            <div class="footer">
              <p class="footer-text">© 2026 Breath Art Institute. All rights reserved.</p>
              <p class="footer-text"><a href="https://www.breathartinstitute.in/">Visit our website</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const textTemplate = `
PASSWORD RESET REQUEST
================================================================================

Hello,

We received a request to reset your account password. Please visit the link below to create a new password. This link is valid for 24 hours.

RESET PASSWORD
================================================================================

${resetUrl}

SECURITY NOTE
================================================================================

If you did not request a password reset, please ignore this email and your account will remain secure. Do not share this link with anyone.

NEED HELP?
================================================================================

If you encounter any issues or need assistance, please contact our support team.

---
© 2026 Breath Art Institute
Website: https://www.breathartinstitute.in/
================================================================================
  `;

  const mailOptions = {
    from: `${env.FROM_EMAIL}`,
    to: email,
    subject: 'Password Reset Request - Breath Art Institute',
    text: textTemplate,
    html: htmlTemplate,
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

  // HTML email template - Professional design
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exam Invitation - Breath Art Institute</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
            color: #333;
          }
          .wrapper {
            background-color: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1a237e 0%, #37474f 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .header .institute-name {
            font-size: 13px;
            opacity: 0.85;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #1a237e;
          }
          .intro-text {
            color: #555;
            font-size: 14px;
            line-height: 1.8;
            margin-bottom: 28px;
          }
          .exam-details {
            background: #f8fafb;
            border-left: 4px solid #1a237e;
            padding: 20px;
            margin: 28px 0;
            border-radius: 6px;
          }
          .exam-details h3 {
            font-size: 14px;
            font-weight: 700;
            color: #1a237e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
          }
          .detail-row {
            margin: 12px 0;
            font-size: 13px;
            display: flex;
            gap: 12px;
          }
          .detail-label {
            font-weight: 600;
            color: #1a237e;
            min-width: 90px;
          }
          .detail-value {
            color: #555;
            flex: 1;
          }
          .cta-section {
            text-align: center;
            margin: 32px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #1a237e 0%, #37474f 100%);
            color: white;
            padding: 14px 36px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
          }
          .cta-button:hover {
            box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
            transform: translateY(-1px);
          }
          .important-note {
            background: #fef5e7;
            border-left: 4px solid #f39c12;
            padding: 16px;
            margin: 24px 0;
            border-radius: 6px;
            font-size: 13px;
            color: #7a5c0f;
          }
          .important-note strong {
            color: #7a5c0f;
          }
          .support-text {
            color: #777;
            font-size: 13px;
            line-height: 1.8;
            margin-top: 24px;
          }
          .divider {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 32px 0;
          }
          .footer {
            background: #f8fafb;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
          }
          .footer-text {
            font-size: 12px;
            color: #888;
            margin: 6px 0;
          }
          .footer a {
            color: #1a237e;
            text-decoration: none;
            font-weight: 500;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>Exam Invitation</h1>
              <div class="institute-name">Breath Art Institute</div>
            </div>

            <div class="content">
              <div class="greeting">Hello <strong>${studentName}</strong>,</div>

              <p class="intro-text">
                You have been invited to participate in an upcoming exam. Please review the exam details below and ensure you complete it before the deadline. Access the exam using the button provided.
              </p>

              <div class="exam-details">
                <h3>Exam Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Title:</span>
                  <span class="detail-value"><strong>${title}</strong></span>
                </div>
                ${description ? `
                <div class="detail-row">
                  <span class="detail-label">Description:</span>
                  <span class="detail-value">${description}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Start Date:</span>
                  <span class="detail-value">${startDateStr}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">End Date:</span>
                  <span class="detail-value"><strong>${endDateStr}</strong></span>
                </div>
              </div>

              <div class="cta-section">
                <a href="${googleFormLink}" class="cta-button" style="color:#FFF;">Access Exam</a>
              </div>

              <div class="important-note">
                <strong>Important Notice:</strong> Please complete this exam before the end date. Submissions cannot be resubmitted after the deadline.
              </div>

              <p class="support-text">
                If you encounter any technical issues or have questions regarding this exam, please contact your instructor or reach out to our support team for assistance.
              </p>

              <hr class="divider">
            </div>

            <div class="footer">
              <p class="footer-text">© 2026 Breath Art Institute. All rights reserved.</p>
              <p class="footer-text"><a href="https://www.breathartinstitute.in/">Visit our website</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Plain text version for email clients that don't support HTML
  const textTemplate = `
EXAM INVITATION
================================================================================

Hello ${studentName},

You have been invited to participate in an upcoming exam. Please review the exam details below and ensure you complete it before the deadline.

EXAM DETAILS
================================================================================

Title:       ${title}
${description ? `Description: ${description}\n` : ''}Start Date:  ${startDateStr}
End Date:    ${endDateStr}

ACCESS THE EXAM
================================================================================

Please visit the link below to access the exam:
${googleFormLink}

IMPORTANT NOTICE
================================================================================

Please complete this exam before the end date. Submissions cannot be resubmitted after the deadline.

NEED HELP?
================================================================================

If you encounter any technical issues or have questions regarding this exam, please contact your instructor or reach out to our support team for assistance.

---
© 2026 Breath Art Institute
Website: https://www.breathartinstitute.in/
================================================================================
  `;

  try {
    const mailOptions = {
      from: `${env.FROM_EMAIL}`,
      to: studentEmail,
      subject: `Exam Invitation: ${title}`,
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
