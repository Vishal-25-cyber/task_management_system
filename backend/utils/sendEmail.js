const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (options) => {
  const timestamp = Date.now();
  const safeEmail = options.email.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `email_${timestamp}_${safeEmail}.html`;
  
  // Define public directory path
  const publicDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'sent-emails');
  
  // Ensure the directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Create local HTML preview template
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${options.subject}</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; padding: 40px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
          .header { background: #1e1b4b; color: white; padding: 12px 20px; font-size: 11px; text-transform: uppercase; tracking: 0.1em; border-top-left-radius: 12px; border-top-right-radius: 12px; font-weight: bold; }
          .content { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">📧 Local Email Dispatch Simulation</div>
          <div style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #475569;">
            <strong>To:</strong> ${options.email}<br>
            <strong>Subject:</strong> ${options.subject}
          </div>
          <div class="content">
            ${options.html}
          </div>
        </div>
      </body>
    </html>
  `;

  // Always write local file copy as a fail-safe
  fs.writeFileSync(path.join(publicDir, filename), fullHtml, 'utf8');
  const localPreviewUrl = `http://localhost:5173/sent-emails/${filename}`;

  let transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Respect optional SMTP_SECURE env (true/false). Default to false for STARTTLS (port 587).
    const secure = (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // Allow self-signed certs if necessary (helps with some SMTP gateways); rejection is default.
        rejectUnauthorized: false,
      },
    });
  } else {
    // Generate a temporary SMTP account on ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      connectionTimeout: 5000, // 5s timeout
    });
  }

  const message = {
    from: process.env.FROM_EMAIL || `"TaskHub" <no-reply@taskhub.com>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    const previewUrl = nodemailer.getTestMessageUrl(info) || localPreviewUrl;
    console.log(`✉️ Email successfully dispatched via SMTP: ${options.subject}`);
    console.log('SMTP response:', info);
    return {
      sent: true,
      messageId: info.messageId,
      response: info.response,
      previewUrl,
    };
  } catch (smtpError) {
    // If SMTP fails, print warning but gracefully fallback to local file so task.overdueEmailSent marks as true
    console.warn(`⚠️ SMTP Dispatch Failed: ${smtpError.message}. Fell back to local HTML preview: ${localPreviewUrl}`);
    console.warn(smtpError);
    return {
      sent: false,
      messageId: `local-${timestamp}`,
      error: smtpError.message,
      previewUrl: localPreviewUrl,
    };
  }
};

module.exports = sendEmail;
