const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: ['Work', 'College', 'Study', 'Personal', 'Shopping', 'Others'],
      default: 'Others',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    overdueEmailSent: {
      type: Boolean,
      default: false,
    },
    overdueEmailMessageId: {
      type: String,
      default: null,
    },
    overdueEmailSentAt: {
      type: Date,
      default: null,
    },
    overdueEmailError: {
      type: String,
      default: null,
    },
    overdueEmailPreviewUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
taskSchema.index({ userId: 1, archived: 1, status: 1 });
taskSchema.index({ userId: 1, favorite: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
