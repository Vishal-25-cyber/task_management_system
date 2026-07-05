const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Comment = require('../models/Comment');

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  const {
    search,
    status,
    priority,
    category,
    favorite,
    archived,
    sortBy = 'createdAt',
    order = 'desc',
    dueDateFrom,
    dueDateTo,
  } = req.query;

  const filter = { userId: req.user._id };

  // Archived filter
  filter.archived = archived === 'true' ? true : false;

  // Favorite filter
  if (favorite === 'true') filter.favorite = true;

  // Status filter
  if (status) filter.status = status;

  // Priority filter
  if (priority) filter.priority = priority;

  // Category filter
  if (category) filter.category = category;

  // Due date range
  if (dueDateFrom || dueDateTo) {
    filter.dueDate = {};
    if (dueDateFrom) {
      const fromDate = new Date(dueDateFrom);
      if (typeof dueDateFrom === 'string' && !dueDateFrom.includes('T')) {
        fromDate.setUTCHours(0, 0, 0, 0);
      }
      filter.dueDate.$gte = fromDate;
    }
    if (dueDateTo) {
      const toDate = new Date(dueDateTo);
      if (typeof dueDateTo === 'string' && !dueDateTo.includes('T')) {
        toDate.setUTCHours(23, 59, 59, 999);
      }
      filter.dueDate.$lte = toDate;
    }
  }

  // Search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  // Sort
  const sortOrder = order === 'asc' ? 1 : -1;
  let sortOptions = {};

  switch (sortBy) {
    case 'priority':
      sortOptions = { priority: sortOrder };
      break;
    case 'deadline':
      sortOptions = { dueDate: sortOrder };
      break;
    case 'title':
      sortOptions = { title: sortOrder };
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    default:
      sortOptions = { createdAt: sortOrder };
  }

  const tasks = await Task.find(filter).sort(sortOptions).lean();

  res.json({ success: true, count: tasks.length, tasks });
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const comments = await Comment.find({ taskId: task._id })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, task, comments });
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { title, description, category, priority, status, dueDate } = req.body;

  const task = await Task.create({
    userId: req.user._id,
    title,
    description,
    category,
    priority,
    status,
    dueDate: dueDate || null,
  });

  res.status(201).json({ success: true, message: 'Task created successfully', task });
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const { title, description, category, priority, status, dueDate, favorite, archived } = req.body;

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    { title, description, category, priority, status, dueDate, favorite, archived },
    { new: true, runValidators: true }
  );

  res.json({ success: true, message: 'Task updated successfully', task: updatedTask });
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  await Task.findByIdAndDelete(req.params.id);
  await Comment.deleteMany({ taskId: req.params.id });

  res.json({ success: true, message: 'Task deleted successfully' });
};

// @desc    Toggle archive task
// @route   PATCH /api/tasks/archive/:id
// @access  Private
const toggleArchive = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  task.archived = !task.archived;
  await task.save();

  res.json({
    success: true,
    message: task.archived ? 'Task archived' : 'Task restored',
    task,
  });
};

// @desc    Toggle favorite task
// @route   PATCH /api/tasks/favorite/:id
// @access  Private
const toggleFavorite = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  task.favorite = !task.favorite;
  await task.save();

  res.json({
    success: true,
    message: task.favorite ? 'Added to favorites' : 'Removed from favorites',
    task,
  });
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleArchive,
  toggleFavorite,
};
