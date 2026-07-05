const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const sendEmail = require('../utils/sendEmail');

(async () => {
  try {
    const res = await sendEmail({
      email: process.env.SMTP_USER,
      subject: 'Test: TaskHub Overdue SMTP Delivery',
      html: `<p>This is a test email sent via configured SMTP (Gmail).</p><p>Timestamp: ${new Date().toISOString()}</p>`
    });
    console.log('send_test_email result:', res);
    process.exit(0);
  } catch (err) {
    console.error('send_test_email failed:', err);
    process.exit(1);
  }
})();
