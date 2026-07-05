const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Task = require('../models/Task');

// @desc    Add comment to task
// @route   POST /api/comments/:taskId
// @access  Private
const addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const task = await Task.findOne({ _id: req.params.taskId, userId: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const comment = await Comment.create({
    taskId: req.params.taskId,
    userId: req.user._id,
    comment: req.body.comment,
  });

  const populated = await Comment.findById(comment._id).populate('userId', 'name email');

  res.status(201).json({ success: true, message: 'Comment added', comment: populated });
};

// @desc    Update comment
// @route   PUT /api/comments/:commentId
// @access  Private
const updateComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const comment = await Comment.findOne({ _id: req.params.commentId, userId: req.user._id });
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  comment.comment = req.body.comment;
  await comment.save();

  const populated = await Comment.findById(comment._id).populate('userId', 'name email');

  res.json({ success: true, message: 'Comment updated', comment: populated });
};

// @desc    Delete comment
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  const comment = await Comment.findOne({ _id: req.params.commentId, userId: req.user._id });
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  await Comment.findByIdAndDelete(req.params.commentId);
  res.json({ success: true, message: 'Comment deleted' });
};

module.exports = { addComment, updateComment, deleteComment };
