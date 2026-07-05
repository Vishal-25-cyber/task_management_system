const express = require('express');
const router = express.Router();
const checkOverdueTasks = require('../utils/overdueChecker');
const Task = require('../models/Task');

// GET /api/utils/overdue-status
// Return overdue tasks and their `overdueEmailSent` flag for quick inspection
router.get('/overdue-status', async (req, res) => {
  try {
    const tasks = await Task.find({
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() }
    }).select('title userId dueDate overdueEmailSent').populate('userId', 'name email');
    return res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    console.error('Error fetching overdue status:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch overdue status' });
  }
});

// POST /api/utils/run-overdue
// Trigger overdue check immediately (useful for testing)
router.post('/run-overdue', async (req, res) => {
  try {
    await checkOverdueTasks();
    return res.json({ success: true, message: 'Overdue check executed' });
  } catch (err) {
    console.error('Error triggering overdue check:', err);
    return res.status(500).json({ success: false, message: 'Failed to execute overdue check' });
  }
});

module.exports = router;
