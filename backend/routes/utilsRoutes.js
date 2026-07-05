const express = require('express');
const router = express.Router();
const checkOverdueTasks = require('../utils/overdueChecker');

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
