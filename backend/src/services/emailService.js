// backend/src/services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else if (process.env.NODE_ENV === 'development') {
    console.log('✅ Email service ready (verification)');
  }
});

/**
 * Send exam invitation email to student
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
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
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
          font-size: 18px;
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
          font-weight: 600;
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
            ${description ? `<div class="detail-row"><span class="detail-label">Description:</span>${description}</div>` : ''}
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
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`,
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
