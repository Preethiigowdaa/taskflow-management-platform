const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { workspacePermissionMiddleware } = require('../middleware/auth');

const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', asyncHandler(async (req, res) => {
  const Task = require('../models/Task');
  const Workspace = require('../models/Workspace');

  const userId = req.user._id;

  // Get user's workspaces
  const workspaces = await Workspace.findByUser(userId);

  // Get overall task statistics
  const taskStats = await Task.aggregate([
    {
      $match: {
        $or: [
          { assignee: userId },
          { reporter: userId }
        ],
        isArchived: false
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get overdue tasks
  const overdueTasks = await Task.find({
    $or: [
      { assignee: userId },
      { reporter: userId }
    ],
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' },
    isArchived: false
  }).populate('workspace', 'name color');

  // Get recent activity (last 7 days)
  const recentActivity = await Task.find({
    $or: [
      { assignee: userId },
      { reporter: userId }
    ],
    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    isArchived: false
  })
    .populate('workspace', 'name color')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ updatedAt: -1 })
    .limit(10);

  // Calculate completion rates
  const totalTasks = taskStats.reduce((sum, stat) => sum + stat.count, 0);
  const completedTasks = taskStats.find(stat => stat._id === 'done')?.count || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get productivity trends (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const productivityTrends = await Task.aggregate([
    {
      $match: {
        $or: [
          { assignee: userId },
          { reporter: userId }
        ],
        completedAt: { $gte: thirtyDaysAgo },
        isArchived: false
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
        },
        completed: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      workspaces: workspaces.length,
      totalTasks,
      completedTasks,
      overdueTasks: overdueTasks.length,
      completionRate,
      recentActivity,
      productivityTrends
    }
  });
}));

// @desc    Get workspace analytics
// @route   GET /api/analytics/workspace/:workspaceId
// @access  Private
router.get('/workspace/:workspaceId', workspacePermissionMiddleware('viewer'), asyncHandler(async (req, res) => {
  const Task = require('../models/Task');
  const workspaceId = req.params.workspaceId;

  // Get task statistics by status
  const taskStats = await Task.aggregate([
    { $match: { workspace: workspaceId, isArchived: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get task statistics by priority
  const priorityStats = await Task.aggregate([
    { $match: { workspace: workspaceId, isArchived: false } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get tasks by assignee
  const assigneeStats = await Task.aggregate([
    { $match: { workspace: workspaceId, isArchived: false } },
    {
      $group: {
        _id: '$assignee',
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        avatar: '$user.avatar',
        total: 1,
        completed: 1,
        completionRate: {
          $round: [
            { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
            1
          ]
        }
      }
    }
  ]);

  // Get overdue tasks
  const overdueTasks = await Task.findOverdue(workspaceId);

  // Get completion trends (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const completionTrends = await Task.aggregate([
    {
      $match: {
        workspace: workspaceId,
        completedAt: { $gte: thirtyDaysAgo },
        isArchived: false
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
        },
        completed: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get task creation trends (last 30 days)
  const creationTrends = await Task.aggregate([
    {
      $match: {
        workspace: workspaceId,
        createdAt: { $gte: thirtyDaysAgo },
        isArchived: false
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        created: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Calculate average completion time
  const avgCompletionTime = await Task.aggregate([
    {
      $match: {
        workspace: workspaceId,
        status: 'done',
        completedAt: { $exists: true },
        createdAt: { $exists: true },
        isArchived: false
      }
    },
    {
      $addFields: {
        completionTime: {
          $divide: [
            { $subtract: ['$completedAt', '$createdAt'] },
            1000 * 60 * 60 * 24 // Convert to days
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgDays: { $avg: '$completionTime' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      taskStats,
      priorityStats,
      assigneeStats,
      overdueTasks: overdueTasks.length,
      completionTrends,
      creationTrends,
      avgCompletionTime: avgCompletionTime[0]?.avgDays || 0
    }
  });
}));

// @desc    Get user productivity analytics
// @route   GET /api/analytics/productivity
// @access  Private
router.get('/productivity', asyncHandler(async (req, res) => {
  const Task = require('../models/Task');
  const { period = '30' } = req.query; // days

  const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
  const userId = req.user._id;

  // Get tasks completed by user in the period
  const completedTasks = await Task.find({
    assignee: userId,
    status: 'done',
    completedAt: { $gte: daysAgo },
    isArchived: false
  }).populate('workspace', 'name color');

  // Get tasks created by user in the period
  const createdTasks = await Task.find({
    reporter: userId,
    createdAt: { $gte: daysAgo },
    isArchived: false
  }).populate('workspace', 'name color');

  // Calculate daily productivity
  const dailyProductivity = await Task.aggregate([
    {
      $match: {
        assignee: userId,
        status: 'done',
        completedAt: { $gte: daysAgo },
        isArchived: false
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
        },
        completed: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Calculate workspace productivity
  const workspaceProductivity = await Task.aggregate([
    {
      $match: {
        assignee: userId,
        status: 'done',
        completedAt: { $gte: daysAgo },
        isArchived: false
      }
    },
    {
      $group: {
        _id: '$workspace',
        completed: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'workspaces',
        localField: '_id',
        foreignField: '_id',
        as: 'workspace'
      }
    },
    {
      $unwind: '$workspace'
    },
    {
      $project: {
        workspaceName: '$workspace.name',
        workspaceColor: '$workspace.color',
        completed: 1
      }
    }
  ]);

  // Calculate average completion time
  const avgCompletionTime = await Task.aggregate([
    {
      $match: {
        assignee: userId,
        status: 'done',
        completedAt: { $exists: true },
        createdAt: { $exists: true },
        isArchived: false
      }
    },
    {
      $addFields: {
        completionTime: {
          $divide: [
            { $subtract: ['$completedAt', '$createdAt'] },
            1000 * 60 * 60 * 24 // Convert to days
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgDays: { $avg: '$completionTime' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      period: parseInt(period),
      completedTasks: completedTasks.length,
      createdTasks: createdTasks.length,
      dailyProductivity,
      workspaceProductivity,
      avgCompletionTime: avgCompletionTime[0]?.avgDays || 0,
      recentCompleted: completedTasks.slice(0, 10),
      recentCreated: createdTasks.slice(0, 10)
    }
  });
}));

// @desc    Get team analytics
// @route   GET /api/analytics/team/:workspaceId
// @access  Private
router.get('/team/:workspaceId', workspacePermissionMiddleware('viewer'), asyncHandler(async (req, res) => {
  const Task = require('../models/Task');
  const Workspace = require('../models/Workspace');
  const workspaceId = req.params.workspaceId;
  const { period = '30' } = req.query;

  const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

  // Get workspace members
  const workspace = await Workspace.findById(workspaceId)
    .populate('members.user', 'name email avatar');

  // Get team performance
  const teamPerformance = await Task.aggregate([
    {
      $match: {
        workspace: workspaceId,
        isArchived: false
      }
    },
    {
      $group: {
        _id: '$assignee',
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$status', 'done'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        avatar: '$user.avatar',
        total: 1,
        completed: 1,
        overdue: 1,
        completionRate: {
          $round: [
            { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
            1
          ]
        }
      }
    }
  ]);

  // Get recent team activity
  const recentActivity = await Task.find({
    workspace: workspaceId,
    updatedAt: { $gte: daysAgo },
    isArchived: false
  })
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ updatedAt: -1 })
    .limit(20);

  // Get team workload distribution
  const workloadDistribution = await Task.aggregate([
    {
      $match: {
        workspace: workspaceId,
        status: { $ne: 'done' },
        isArchived: false
      }
    },
    {
      $group: {
        _id: '$assignee',
        activeTasks: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        avatar: '$user.avatar',
        activeTasks: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      period: parseInt(period),
      members: workspace.members,
      teamPerformance,
      recentActivity,
      workloadDistribution
    }
  });
}));

module.exports = router; 