const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');

(async () => {
  try {
    await connectDB();
    const mongoose = require('mongoose');
    // ensure User model is registered before populating
    require('../models/User');
    const Task = require('../models/Task');

    const tasks = await Task.find({ dueDate: { $lt: new Date() } })
      .select('title userId dueDate overdueEmailSent overdueEmailMessageId overdueEmailSentAt overdueEmailError overdueEmailPreviewUrl')
      .populate('userId', 'name email');

    console.log(JSON.stringify(tasks, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
