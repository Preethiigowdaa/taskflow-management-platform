const express = require('express');
const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errorHandler');
const { workspacePermissionMiddleware } = require('../middleware/auth');

const router = express.Router();

// @desc    Get workspace activity feed
// @route   GET /api/activities
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { workspaceId, limit = 50, offset = 0, type, userId } = req.query;

  const activities = await Activity.findByWorkspace(workspaceId, {
    limit: parseInt(limit),
    offset: parseInt(offset),
    type,
    userId
  });

  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities
  });
}));

// @desc    Get user activity
// @route   GET /api/activities/user
// @access  Private
router.get('/user', asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const activities = await Activity.getUserActivity(req.user._id, {
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities
  });
}));

// @desc    Mark activity as read
// @route   PUT /api/activities/:id/read
// @access  Private
router.put('/:id/read', asyncHandler(async (req, res) => {
  const activity = await Activity.markAsRead(req.params.id, req.user._id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Activity marked as read'
  });
}));

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
  const { workspaceId, period = '7' } = req.query;
  const days = parseInt(period);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const activities = await Activity.find({
    workspace: workspaceId,
    createdAt: { $gte: startDate }
  });

  // Group by type
  const typeStats = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {});

  // Group by user
  const userStats = activities.reduce((acc, activity) => {
    const userId = activity.user.toString();
    acc[userId] = (acc[userId] || 0) + 1;
    return acc;
  }, {});

  // Daily activity
  const dailyStats = {};
  activities.forEach(activity => {
    const date = activity.createdAt.toISOString().split('T')[0];
    dailyStats[date] = (dailyStats[date] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    data: {
      total: activities.length,
      typeStats,
      userStats,
      dailyStats,
      period: days
    }
  });
}));

module.exports = router; 