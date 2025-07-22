const express = require('express');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const Workspace = require('../models/Workspace');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware, workspacePermissionMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @desc    Get comprehensive workspace analytics
// @route   GET /api/analytics
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { workspaceId, timeRange = '30' } = req.query;
  const days = parseInt(timeRange);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all tasks for the workspace
  const tasks = await Task.find({
    workspace: workspaceId,
    createdAt: { $gte: startDate }
  }).populate('reporter', 'name email avatar');

  // Get goals
  const goals = await Goal.find({
    workspace: workspaceId,
    isActive: true
  });

  // Get activities
  const activities = await Activity.find({
    workspace: workspaceId,
    createdAt: { $gte: startDate }
  }).populate('user', 'name email avatar');

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const overdueTasks = tasks.filter(task => {
    return task.dueDate && new Date() > new Date(task.dueDate) && task.status !== 'done';
  }).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate average completion time
  const completedTasksWithDates = tasks.filter(task => 
    task.status === 'done' && task.updatedAt && task.createdAt
  );
  
  let averageCompletionTime = 0;
  if (completedTasksWithDates.length > 0) {
    const totalTime = completedTasksWithDates.reduce((sum, task) => {
      const completionTime = new Date(task.updatedAt) - new Date(task.createdAt);
      return sum + completionTime;
    }, 0);
    averageCompletionTime = Math.round((totalTime / completedTasksWithDates.length) / (1000 * 60 * 60 * 24) * 10) / 10; // in days
  }

  // Team productivity
  const userTaskStats = {};
  tasks.forEach(task => {
    const userId = task.reporter._id.toString();
    if (!userTaskStats[userId]) {
      userTaskStats[userId] = {
        userId,
        name: task.reporter.name,
        avatar: task.reporter.avatar,
        tasksCompleted: 0,
        tasksAssigned: 0
      };
    }
    userTaskStats[userId].tasksAssigned++;
    if (task.status === 'done') {
      userTaskStats[userId].tasksCompleted++;
    }
  });

  const teamProductivity = Object.values(userTaskStats).map(user => ({
    ...user,
    completionRate: user.tasksAssigned > 0 ? Math.round((user.tasksCompleted / user.tasksAssigned) * 100) : 0
  }));

  // Weekly trends
  const weeklyTrends = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= dayStart && taskDate <= dayEnd;
    });

    const dayCompleted = tasks.filter(task => {
      const taskDate = new Date(task.updatedAt);
      return task.status === 'done' && taskDate >= dayStart && taskDate <= dayEnd;
    });

    weeklyTrends.push({
      date: dateStr,
      completed: dayCompleted.length,
      created: dayTasks.length
    });
  }

  // Priority distribution
  const priorityCounts = {};
  tasks.forEach(task => {
    priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
  });

  const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    count,
    percentage: Math.round((count / totalTasks) * 100)
  }));

  // Status distribution
  const statusCounts = {};
  tasks.forEach(task => {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
  });

  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage: Math.round((count / totalTasks) * 100)
  }));

  // Goal statistics
  const goalStats = {
    total: goals.length,
    completed: goals.filter(goal => goal.status === 'completed').length,
    active: goals.filter(goal => goal.status === 'active').length,
    overdue: goals.filter(goal => goal.status === 'overdue').length
  };

  // Activity summary
  const activityTypes = ['task_created', 'task_completed', 'member_joined', 'goal_created'];
  const activitySummary = activityTypes.map(type => ({
    type,
    count: activities.filter(activity => activity.type === type).length
  }));

  res.status(200).json({
    success: true,
    data: {
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate,
      averageCompletionTime,
      teamProductivity,
      weeklyTrends,
      priorityDistribution,
      statusDistribution,
      goalStats,
      activitySummary
    }
  });
}));

// @desc    Get real-time metrics
// @route   GET /api/analytics/realtime
// @access  Private
router.get('/realtime', asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get yesterday's date range
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Current active tasks
  const activeTasks = await Task.countDocuments({
    workspace: workspaceId,
    status: { $nin: ['done', 'archived'] }
  });

  // Tasks completed today
  const completedToday = await Task.countDocuments({
    workspace: workspaceId,
    status: 'done',
    updatedAt: { $gte: today, $lt: tomorrow }
  });

  // Tasks completed yesterday
  const completedYesterday = await Task.countDocuments({
    workspace: workspaceId,
    status: 'done',
    updatedAt: { $gte: yesterday, $lt: today }
  });

  // Team members count
  const workspace = await Workspace.findById(workspaceId).populate('members.user');
  const teamMembers = workspace.members.length;

  // Average completion time (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentCompletedTasks = await Task.find({
    workspace: workspaceId,
    status: 'done',
    updatedAt: { $gte: weekAgo }
  });

  let avgCompletionTime = 0;
  if (recentCompletedTasks.length > 0) {
    const totalTime = recentCompletedTasks.reduce((sum, task) => {
      const completionTime = new Date(task.updatedAt) - new Date(task.createdAt);
      return sum + completionTime;
    }, 0);
    avgCompletionTime = Math.round((totalTime / recentCompletedTasks.length) / (1000 * 60 * 60) * 10) / 10; // in hours
  }

  // Calculate changes
  const activeTasksChange = 0; // You could compare with previous period
  const completedChange = completedToday - completedYesterday;
  const teamMembersChange = 0; // You could track member additions
  const completionTimeChange = -0.5; // Mock improvement

  res.status(200).json({
    success: true,
    data: [
      {
        label: 'Active Tasks',
        value: activeTasks,
        change: activeTasksChange,
        changeType: activeTasksChange >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Completed Today',
        value: completedToday,
        change: completedChange,
        changeType: completedChange >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Team Members',
        value: teamMembers,
        change: teamMembersChange,
        changeType: teamMembersChange >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Avg. Completion Time',
        value: avgCompletionTime,
        change: completionTimeChange,
        changeType: completionTimeChange <= 0 ? 'positive' : 'negative'
      }
    ]
  });
}));

// @desc    Get user productivity analytics
// @route   GET /api/analytics/productivity
// @access  Private
router.get('/productivity', asyncHandler(async (req, res) => {
  const { workspaceId, userId, timeRange = '30' } = req.query;
  const days = parseInt(timeRange);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const tasks = await Task.find({
    workspace: workspaceId,
    reporter: userId,
    createdAt: { $gte: startDate }
  });

  const completedTasks = tasks.filter(task => task.status === 'done');
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Calculate average completion time
  let averageCompletionTime = 0;
  if (completedTasks.length > 0) {
    const totalTime = completedTasks.reduce((sum, task) => {
      const completionTime = new Date(task.updatedAt) - new Date(task.createdAt);
      return sum + completionTime;
    }, 0);
    averageCompletionTime = Math.round((totalTime / completedTasks.length) / (1000 * 60 * 60 * 24) * 10) / 10;
  }

  // Priority breakdown
  const priorityBreakdown = {};
  tasks.forEach(task => {
    priorityBreakdown[task.priority] = (priorityBreakdown[task.priority] || 0) + 1;
  });

  // Daily activity
  const dailyActivity = {};
  tasks.forEach(task => {
    const date = task.createdAt.toISOString().split('T')[0];
    dailyActivity[date] = (dailyActivity[date] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    data: {
      totalTasks,
      completedTasks: completedTasks.length,
      completionRate,
      averageCompletionTime,
      priorityBreakdown,
      dailyActivity
    }
  });
}));

module.exports = router; 