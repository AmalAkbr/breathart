export const verificationEmailTemplate = ({ verificationUrl }) => {
  const token = new URL(verificationUrl).searchParams.get('token');

  const html = `
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
                <strong>Note:</strong> This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
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

  const text = `
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

  return {
    subject: 'Confirm Your Email - Breath Art Institute',
    html,
    text,
  };
};
