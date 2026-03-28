export const passwordResetEmailTemplate = ({ resetUrl }) => {
  const html = `
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
                <strong>Security Note:</strong> If you did not request a password reset, please ignore this email and your account will remain secure. Do not share this link with anyone.
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

  const text = `
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

  return {
    subject: 'Password Reset Request - Breath Art Institute',
    html,
    text,
  };
};
