const Task = require('../models/Task');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

const checkOverdueTasks = async () => {
  try {
    const overdueTasks = await Task.find({
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() },
      overdueEmailSent: { $ne: true }
    }).populate('userId');

    for (const task of overdueTasks) {
      if (!task.userId) continue;

      const user = task.userId;
      const html = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #fee2e2; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
          <h2 style="color: #ef4444; margin-bottom: 12px; font-weight: 700; font-size: 20px;">🚨 Task Overdue Alert</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">This is a notification that your task **"${task.title}"** has passed its due date and is now marked as overdue.</p>
          
          <div style="margin: 24px 0; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px;">
            <p style="margin: 0; font-size: 13px; color: #991b1b;"><strong>Task:</strong> ${task.title}</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #991b1b;"><strong>Category:</strong> ${task.category}</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #991b1b;"><strong>Due Date:</strong> ${task.dueDate.toLocaleDateString()}</p>
          </div>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">Please update the status or adjust the deadline.<br/>TaskFlow Pro Support Team</p>
        </div>
      `;

      try {
        const result = await sendEmail({
          email: user.email,
          subject: `🚨 OVERDUE: ${task.title}`,
          html,
        });

        task.overdueEmailSent = true;
        await task.save();
        console.log(`✉️ Overdue email notification sent to ${user.email} for task "${task.title}". Preview URL: ${result.previewUrl || 'N/A'}`);
      } catch (emailErr) {
        console.error(`Failed to send overdue email for task ${task._id}:`, emailErr);
      }
    }
  } catch (err) {
    console.error('Error running checkOverdueTasks:', err);
  }
};

module.exports = checkOverdueTasks;
