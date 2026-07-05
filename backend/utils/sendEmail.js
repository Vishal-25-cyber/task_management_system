const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');

// Cache the transporter so we don't recreate it on every email
let _transporter = null;

// Resolve hostname to IPv4 address dynamically to prevent IPv6 ENETUNREACH issues in restricted networks
const resolveToIPv4 = async (host) => {
  if (!host) return host;
  try {
    // If it's already an IP address, return it
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host)) {
      return host;
    }
    const addresses = await dns.resolve4(host);
    if (addresses && addresses.length > 0) {
      console.log(`📡 SMTP Resolver: Resolved "${host}" to IPv4: "${addresses[0]}"`);
      return addresses[0];
    }
  } catch (err) {
    console.warn(`⚠️ SMTP Resolver: IPv4 DNS resolution failed for "${host}": ${err.message}. Using hostname directly.`);
  }
  return host;
};

const getTransporter = async (resolvedHost) => {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const secure = (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
    _transporter = nodemailer.createTransport({
      host: resolvedHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        servername: process.env.SMTP_HOST, // Crucial: matches original host name for SSL certificate validation
      },
      connectionTimeout: 10000, // 10s connection timeout
      greetingTimeout: 10000,   // 10s greeting timeout
      socketTimeout: 10000,     // 10s socket idle timeout
    });
  }
  return _transporter;
};

const sendEmail = async (options) => {
  let resolvedHost = process.env.SMTP_HOST;
  if (resolvedHost) {
    resolvedHost = await resolveToIPv4(resolvedHost);
  }

  const transporter = await getTransporter(resolvedHost);

  // Generate local HTML preview copy as a fail-safe in development
  let localPreviewUrl = null;
  try {
    const timestamp = Date.now();
    const safeEmail = options.email.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `email_${timestamp}_${safeEmail}.html`;
    const publicDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'sent-emails');

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

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

    fs.writeFileSync(path.join(publicDir, filename), fullHtml, 'utf8');
    localPreviewUrl = `http://localhost:5173/sent-emails/${filename}`;
  } catch (err) {
    // Fail silently on Render/production where frontend public dir doesn't exist
  }

  // If no SMTP configured at all, log and bail gracefully
  if (!transporter) {
    console.warn('⚠️ No SMTP config found. Set SMTP_HOST and SMTP_USER env vars to enable emails.');
    return {
      sent: false,
      messageId: null,
      error: 'No SMTP configuration provided',
      previewUrl: localPreviewUrl,
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
      previewUrl: localPreviewUrl,
    };
  } catch (smtpError) {
    console.error(`❌ SMTP Error for ${options.email}: ${smtpError.message}`);
    // Reset cached transporter so next call retries fresh connection
    _transporter = null;
    return {
      sent: false,
      messageId: null,
      error: smtpError.message,
      previewUrl: localPreviewUrl,
    };
  }
};

module.exports = sendEmail;
