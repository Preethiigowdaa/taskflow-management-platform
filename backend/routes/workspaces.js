const express = require('express');
const { body, validationResult } = require('express-validator');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware, workspacePermissionMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @desc    Get all workspaces for current user
// @route   GET /api/workspaces
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const workspaces = await Workspace.findByUser(req.user._id)
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: workspaces.length,
    data: workspaces
  });
}));

// @desc    Get single workspace
// @route   GET /api/workspaces/:id
// @access  Private
router.get('/:id', workspacePermissionMiddleware('viewer'), asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('members.invitedBy', 'name email');

  res.status(200).json({
    success: true,
    data: workspace
  });
}));

// @desc    Create workspace
// @route   POST /api/workspaces
// @access  Private
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Workspace name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Icon must be less than 10 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { name, description, color, icon, settings } = req.body;

  const workspace = await Workspace.create({
    name,
    description,
    color,
    icon,
    settings,
    owner: req.user._id,
    members: [{
      user: req.user._id,
      role: 'owner'
    }]
  });

  // Add workspace to user's workspaces
  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      workspaces: {
        workspace: workspace._id,
        role: 'owner'
      }
    }
  });

  const populatedWorkspace = await Workspace.findById(workspace._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.status(201).json({
    success: true,
    data: populatedWorkspace
  });
}));

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
router.put('/:id', workspacePermissionMiddleware('admin'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Workspace name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Icon must be less than 10 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const workspace = await Workspace.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  res.status(200).json({
    success: true,
    data: workspace
  });
}));

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
router.delete('/:id', workspacePermissionMiddleware('owner'), asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  // Soft delete - just mark as inactive
  workspace.isActive = false;
  await workspace.save();

  res.status(200).json({
    success: true,
    message: 'Workspace deleted successfully'
  });
}));

// @desc    Add member to workspace
// @route   POST /api/workspaces/:id/members
// @access  Private
router.post('/:id/members', workspacePermissionMiddleware('admin'), [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Role must be admin, member, or viewer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { email, role = 'member' } = req.body;
  const workspace = req.workspace;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user is already a member
  const existingMember = workspace.members.find(member => 
    member.user.toString() === user._id.toString()
  );

  if (existingMember) {
    return res.status(400).json({
      success: false,
      message: 'User is already a member of this workspace'
    });
  }

  // Add member to workspace
  await workspace.addMember(user._id, role, req.user._id);

  // Add workspace to user's workspaces
  await User.findByIdAndUpdate(user._id, {
    $push: {
      workspaces: {
        workspace: workspace._id,
        role
      }
    }
  });

  const updatedWorkspace = await Workspace.findById(workspace._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('members.invitedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Member added successfully',
    data: updatedWorkspace
  });
}));

// @desc    Update member role
// @route   PUT /api/workspaces/:id/members/:userId
// @access  Private
router.put('/:id/members/:userId', workspacePermissionMiddleware('admin'), [
  body('role')
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Role must be admin, member, or viewer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { role } = req.body;
  const { userId } = req.params;
  const workspace = req.workspace;

  // Check if user is trying to change owner role
  const member = workspace.members.find(m => m.user.toString() === userId);
  if (member && member.role === 'owner') {
    return res.status(400).json({
      success: false,
      message: 'Cannot change owner role'
    });
  }

  // Update member role in workspace
  await workspace.updateMemberRole(userId, role);

  // Update role in user's workspaces
  await User.findByIdAndUpdate(userId, {
    $set: {
      'workspaces.$[elem].role': role
    }
  }, {
    arrayFilters: [{ 'elem.workspace': workspace._id }]
  });

  const updatedWorkspace = await Workspace.findById(workspace._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Member role updated successfully',
    data: updatedWorkspace
  });
}));

// @desc    Remove member from workspace
// @route   DELETE /api/workspaces/:id/members/:userId
// @access  Private
router.delete('/:id/members/:userId', workspacePermissionMiddleware('admin'), asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const workspace = req.workspace;

  // Check if user is trying to remove owner
  const member = workspace.members.find(m => m.user.toString() === userId);
  if (member && member.role === 'owner') {
    return res.status(400).json({
      success: false,
      message: 'Cannot remove workspace owner'
    });
  }

  // Remove member from workspace
  await workspace.removeMember(userId);

  // Remove workspace from user's workspaces
  await User.findByIdAndUpdate(userId, {
    $pull: {
      workspaces: { workspace: workspace._id }
    }
  });

  const updatedWorkspace = await Workspace.findById(workspace._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Member removed successfully',
    data: updatedWorkspace
  });
}));

// @desc    Get workspace statistics
// @route   GET /api/workspaces/:id/stats
// @access  Private
router.get('/:id/stats', workspacePermissionMiddleware('viewer'), asyncHandler(async (req, res) => {
  const Task = require('../models/Task');
  
  const workspaceId = req.params.id;
  
  // Get task statistics
  const taskStats = await Task.aggregate([
    { $match: { workspace: workspaceId, isArchived: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get overdue tasks
  const overdueTasks = await Task.findOverdue(workspaceId);

  // Get recent activity (last 7 days)
  const recentActivity = await Task.find({
    workspace: workspaceId,
    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  })
    .populate('assignee', 'name email avatar')
    .sort({ updatedAt: -1 })
    .limit(10);

  // Calculate completion rate
  const totalTasks = taskStats.reduce((sum, stat) => sum + stat.count, 0);
  const completedTasks = taskStats.find(stat => stat._id === 'done')?.count || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      taskStats,
      overdueTasks: overdueTasks.length,
      completionRate,
      recentActivity
    }
  });
}));

module.exports = router; 