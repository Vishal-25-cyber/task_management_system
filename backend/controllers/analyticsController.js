const Task = require('../models/Task');

// @desc    Get analytics for user
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  const userId = req.user._id;

  // Base filter for non-archived active tasks
  const baseFilter = { userId, archived: false };

  // Status distribution
  const statusDist = await Task.aggregate([
    { $match: baseFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Priority distribution
  const priorityDist = await Task.aggregate([
    { $match: baseFilter },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  // Monthly tasks created (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyTasks = await Task.aggregate([
    { $match: { userId, createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Category distribution
  const categoryDist = await Task.aggregate([
    { $match: baseFilter },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  // Overall stats
  const totalTasks = await Task.countDocuments({ userId, archived: false });
  const completedTasks = await Task.countDocuments({ userId, archived: false, status: 'Completed' });
  const pendingTasks = await Task.countDocuments({ userId, archived: false, status: 'Pending' });
  const inProgressTasks = await Task.countDocuments({ userId, archived: false, status: 'In Progress' });
  const highPriorityTasks = await Task.countDocuments({ userId, archived: false, priority: 'High' });

  const now = new Date();
  
  // Overdue count: Due date is in the past, and status is not Completed
  const overdueCount = await Task.countDocuments({
    userId,
    archived: false,
    status: { $ne: 'Completed' },
    dueDate: { $lt: now },
  });

  // Start & End of Today (in UTC)
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);

  // Due Today count: Due today (between todayStart and todayEnd) AND is NOT overdue (dueDate >= now)
  const dueTodayCount = await Task.countDocuments({
    userId,
    archived: false,
    status: { $ne: 'Completed' },
    dueDate: { $gte: now, $lte: todayEnd },
  });

  // Upcoming count: Due date is after today (strictly greater than todayEnd) and within 3 days (less than or equal to threeDaysFromNow)
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  threeDaysFromNow.setUTCHours(23, 59, 59, 999);

  const upcomingCount = await Task.countDocuments({
    userId,
    archived: false,
    status: { $ne: 'Completed' },
    dueDate: { $gt: todayEnd, $lte: threeDaysFromNow },
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.json({
    success: true,
    analytics: {
      statusDistribution: statusDist,
      priorityDistribution: priorityDist,
      monthlyTasks,
      categoryDistribution: categoryDist,
      overview: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        highPriorityTasks,
        dueTodayCount,
        overdueCount,
        upcomingCount,
        completionRate,
      },
    },
  });
};

module.exports = { getAnalytics };
