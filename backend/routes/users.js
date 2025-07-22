const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('workspaces.workspace', 'name description color icon');

  res.status(200).json({
    success: true,
    data: user.getPublicProfile()
  });
}));

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { name, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    {
      new: true,
      runValidators: true
    }
  ).populate('workspaces.workspace', 'name description color icon');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user.getPublicProfile()
  });
}));

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', [
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean'),
  body('notifications.taskUpdates')
    .optional()
    .isBoolean()
    .withMessage('Task updates must be a boolean'),
  body('notifications.mentions')
    .optional()
    .isBoolean()
    .withMessage('Mentions must be a boolean'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { theme, notifications, timezone } = req.body;

  const updateData = {};
  if (theme) updateData['preferences.theme'] = theme;
  if (notifications) {
    Object.keys(notifications).forEach(key => {
      updateData[`preferences.notifications.${key}`] = notifications[key];
    });
  }
  if (timezone) updateData['preferences.timezone'] = timezone;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    {
      new: true,
      runValidators: true
    }
  ).populate('workspaces.workspace', 'name description color icon');

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    data: user.getPublicProfile()
  });
}));

// @desc    Get user workspaces
// @route   GET /api/users/workspaces
// @access  Private
router.get('/workspaces', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'workspaces.workspace',
      select: 'name description color icon stats members',
      populate: {
        path: 'members.user',
        select: 'name email avatar'
      }
    });

  res.status(200).json({
    success: true,
    count: user.workspaces.length,
    data: user.workspaces
  });
}));

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
  const Task = require('../models/Task');

  // Get tasks assigned to user
  const assignedTasks = await Task.find({
    assignee: req.user._id,
    isArchived: false
  });

  // Get tasks created by user
  const createdTasks = await Task.find({
    reporter: req.user._id,
    isArchived: false
  });

  // Calculate statistics
  const stats = {
    totalAssigned: assignedTasks.length,
    completedAssigned: assignedTasks.filter(task => task.status === 'done').length,
    overdueAssigned: assignedTasks.filter(task => task.isOverdue).length,
    totalCreated: createdTasks.length,
    completedCreated: createdTasks.filter(task => task.status === 'done').length,
    workspacesCount: req.user.workspaces.length
  };

  // Calculate completion rates
  stats.assignedCompletionRate = stats.totalAssigned > 0 
    ? Math.round((stats.completedAssigned / stats.totalAssigned) * 100) 
    : 0;
  
  stats.createdCompletionRate = stats.totalCreated > 0 
    ? Math.round((stats.completedCreated / stats.totalCreated) * 100) 
    : 0;

  res.status(200).json({
    success: true,
    data: stats
  });
}));

// @desc    Search users (for adding to workspaces)
// @route   GET /api/users/search
// @access  Private
router.get('/search', [
  body('query')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters')
], asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ],
    _id: { $ne: req.user._id }, // Exclude current user
    isActive: true
  })
    .select('name email avatar')
    .limit(10);

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
}));

// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
router.get('/activity', asyncHandler(async (req, res) => {
  const Task = require('../models/Task');
  const { limit = 20 } = req.query;

  // Get recent tasks assigned to or created by user
  const recentTasks = await Task.find({
    $or: [
      { assignee: req.user._id },
      { reporter: req.user._id }
    ],
    isArchived: false
  })
    .populate('workspace', 'name color')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit));

  // Get recent comments by user
  const recentComments = await Task.aggregate([
    {
      $match: {
        'comments.user': req.user._id,
        isArchived: false
      }
    },
    {
      $unwind: '$comments'
    },
    {
      $match: {
        'comments.user': req.user._id
      }
    },
    {
      $sort: {
        'comments.createdAt': -1
      }
    },
    {
      $limit: parseInt(limit)
    },
    {
      $project: {
        taskId: '$_id',
        taskTitle: '$title',
        comment: '$comments',
        workspace: '$workspace'
      }
    }
  ]);

  // Populate workspace and user info for comments
  const populatedComments = await Task.populate(recentComments, [
    { path: 'workspace', select: 'name color' },
    { path: 'comment.user', select: 'name email avatar' }
  ]);

  res.status(200).json({
    success: true,
    data: {
      recentTasks,
      recentComments: populatedComments
    }
  });
}));

module.exports = router; 