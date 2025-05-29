export const emailTemplates = {
  confirmation: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Email - Frankie AI</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #7c3aed;
          border-radius: 8px 8px 0 0;
        }
        .logo {
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
        }
        .content {
          padding: 30px;
        }
        h1 {
          color: #7c3aed;
          font-size: 24px;
          margin-bottom: 20px;
          text-align: center;
        }
        p {
          margin-bottom: 20px;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #7c3aed;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #6d28d9;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://raw.githubusercontent.com/frankiealive/frankiealive.github.io/main/assets/icon128.png" alt="Frankie AI" class="logo">
        </div>
        <div class="content">
          <h1>Welcome to Frankie AI!</h1>
          <p>Thank you for signing up for Frankie AI. To complete your registration and start using our Chrome extension, please confirm your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="https://frankiealive.github.io?token={{ .Token }}&type=signup" class="button">Confirm Email Address</a>
          </div>
          <p>If you did not create an account with Frankie AI, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>© 2024 Frankie AI. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  resetPassword: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Frankie AI</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #7c3aed;
          border-radius: 8px 8px 0 0;
        }
        .logo {
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
        }
        .content {
          padding: 30px;
        }
        h1 {
          color: #7c3aed;
          font-size: 24px;
          margin-bottom: 20px;
          text-align: center;
        }
        p {
          margin-bottom: 20px;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #7c3aed;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #6d28d9;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://raw.githubusercontent.com/frankiealive/frankiealive.github.io/main/assets/icon128.png" alt="Frankie AI" class="logo">
        </div>
        <div class="content">
          <h1>Reset Your Password</h1>
          <p>We received a request to reset your password for your Frankie AI account. To proceed with the password reset, please click the button below:</p>
          <div style="text-align: center;">
            <a href="https://frankiealive.github.io?token={{ .Token }}&type=recovery" class="button">Reset Password</a>
          </div>
          <p>If you did not request a password reset, you can safely ignore this email. Your account security is important to us.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>© 2024 Frankie AI. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}; 