const nodemailer = require('nodemailer');

// Cache the transporter so we don't recreate it on every email
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const secure = (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return _transporter;
};

const sendEmail = async (options) => {
  const transporter = getTransporter();

  // If no SMTP configured at all, log and bail gracefully
  if (!transporter) {
    console.warn('⚠️ No SMTP config found. Set SMTP_HOST and SMTP_USER env vars to enable emails.');
    return {
      sent: false,
      messageId: null,
      error: 'No SMTP configuration provided',
      previewUrl: null,
    };
  }

  const message = {
    from: process.env.FROM_EMAIL || '"TaskHub" <no-reply@taskhub.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`✉️ Email sent to ${options.email}: ${options.subject}`);
    console.log('SMTP response:', info.response);
    return {
      sent: true,
      messageId: info.messageId,
      response: info.response,
      previewUrl: null,
    };
  } catch (smtpError) {
    console.error(`❌ SMTP Error for ${options.email}: ${smtpError.message}`);
    // Reset cached transporter so next call retries fresh connection
    _transporter = null;
    return {
      sent: false,
      messageId: null,
      error: smtpError.message,
      previewUrl: null,
    };
  }
};

module.exports = sendEmail;
