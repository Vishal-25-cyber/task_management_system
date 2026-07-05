const nodemailer = require('nodemailer');
const dns = require('dns').promises;

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
