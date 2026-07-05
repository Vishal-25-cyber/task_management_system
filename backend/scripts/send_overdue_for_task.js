const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
let Task;
let sendEmail;

const TASK_ID = process.argv[2] || '6a49f8d6303bcf11297a08db';

(async () => {
  try {
    await connectDB();
    // require models after DB connection to ensure schemas are registered on the active connection
    require('../models/User');
    Task = require('../models/Task');
    sendEmail = require('../utils/sendEmail');

    const task = await Task.findById(TASK_ID).populate('userId');
    if (!task) {
      console.error('Task not found:', TASK_ID);
      process.exit(1);
    }
    if (!task.userId || !task.userId.email) {
      console.error('Task has no user or user has no email');
      process.exit(1);
    }

    const user = task.userId;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #fee2e2; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
        <h2 style="color: #ef4444; margin-bottom: 12px; font-weight: 700; font-size: 20px;">🚨 Task Overdue Alert</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">This is a notification that your task **${task.title}** has passed its due date and is now marked as overdue.</p>
        <div style="margin: 24px 0; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px;">
          <p style="margin: 0; font-size: 13px; color: #991b1b;"><strong>Task:</strong> ${task.title}</p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #991b1b;"><strong>Category:</strong> ${task.category}</p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #991b1b;"><strong>Due Date:</strong> ${task.dueDate.toLocaleDateString()}</p>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">Please update the status or adjust the deadline.<br/>TaskHub Support Team</p>
      </div>
    `;

    console.log('Sending overdue email to', user.email);
    const res = await sendEmail({ email: user.email, subject: `🚨 OVERDUE: ${task.title}`, html });
    // save metadata on the task
    task.overdueEmailMessageId = res.messageId || null;
    task.overdueEmailPreviewUrl = res.previewUrl || null;
    if (res.sent) {
      task.overdueEmailSent = true;
      task.overdueEmailSentAt = new Date();
      task.overdueEmailError = null;
      await task.save();
      console.log('sendOverdueForTask result:', res);
    } else {
      task.overdueEmailError = res.error || 'Unknown SMTP error';
      await task.save();
      console.warn('sendOverdueForTask fallback result:', res);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error sending overdue for task:', err);
    process.exit(1);
  }
})();
