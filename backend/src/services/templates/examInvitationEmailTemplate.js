const formatDateTime = (value) => {
  if (!value) return 'Not specified';
  return new Date(value).toLocaleString();
};

export const examInvitationEmailTemplate = ({ studentName, examDetails }) => {
  const {
    title,
    googleFormLink,
    description,
    startDate,
    endDate,
  } = examDetails;

  const startDateStr = formatDateTime(startDate);
  const endDateStr = formatDateTime(endDate);

  const html = `
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

  const text = `
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

  return {
    subject: `Exam Invitation: ${title}`,
    html,
    text,
  };
};
