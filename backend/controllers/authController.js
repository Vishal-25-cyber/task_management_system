const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      title: user.title,
      department: user.department,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
      createdAt: user.createdAt
    },
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  res.json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      title: user.title,
      department: user.department,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
      createdAt: user.createdAt
    },
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      title: user.title,
      department: user.department,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
      createdAt: user.createdAt
    },
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, avatar, title, department, bio, location, phone } = req.body;

  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, email, avatar, title, department, bio, location, phone },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      title: user.title,
      department: user.department,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
      createdAt: user.createdAt
    },
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
};

// @desc    Send test email notification
// @route   POST /api/auth/send-test-email
// @access  Private
const sendTestEmail = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
      <h2 style="color: #4f46e5; margin-bottom: 12px; font-weight: 700; font-size: 20px;">🔔 TaskHub Alert</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">This is a test notification email dispatched from your **TaskHub** settings. This confirms that your email notifications are correctly active!</p>
      <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 8px;">
        <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Notification Channel:</strong> SMTP Web Alert</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #475569;"><strong>Status:</strong> Success / Connected</p>
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">Have a productive day!<br/>TaskHub Support Team</p>
    </div>
  `;

  try {
    const result = await sendEmail({
      email: user.email,
      subject: '🔔 Test Notification from TaskHub',
      html,
    });

    res.json({
      success: true,
      message: 'Test email notification sent successfully!',
      previewUrl: result.previewUrl
    });
  } catch (err) {
    console.error('Failed to send test email:', err);
    res.status(500).json({ success: false, message: 'Failed to send test email notification' });
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword, sendTestEmail };
