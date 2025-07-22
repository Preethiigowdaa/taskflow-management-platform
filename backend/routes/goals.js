const express = require('express');
const { body, validationResult } = require('express-validator');
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const Workspace = require('../models/Workspace');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @desc    Get all goals for a workspace
// @route   GET /api/goals
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { workspaceId, status, limit = 50, offset = 0 } = req.query;

  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      message: 'Workspace ID is required'
    });
  }

  // Check workspace permission
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  const isMember = workspace.members.some(member => 
    member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const options = {};
  if (status) options.status = status;

  const goals = await Goal.findByWorkspace(workspaceId, options);

  res.status(200).json({
    success: true,
    count: goals.length,
    data: goals
  });
}));

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo.user', 'name email avatar')
    .populate('progressUpdates.user', 'name email avatar');

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  res.status(200).json({
    success: true,
    data: goal
  });
}));

// @desc    Create goal
// @route   POST /api/goals
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Goal title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot be more than 1000 characters'),
  body('target')
    .isInt({ min: 1 })
    .withMessage('Target must be a positive integer'),
  body('unit')
    .optional()
    .isIn(['tasks', 'days', 'members', 'projects', 'hours'])
    .withMessage('Invalid unit'),
  body('deadline')
    .isISO8601()
    .withMessage('Invalid deadline format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { title, description, target, unit = 'tasks', deadline, workspaceId } = req.body;
  const workspace = workspaceId || req.params.workspaceId || req.query.workspaceId;

  if (!workspace) {
    return res.status(400).json({
      success: false,
      message: 'Workspace ID is required'
    });
  }

  // Check workspace permission
  const workspaceDoc = await Workspace.findById(workspace);
  if (!workspaceDoc) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  const isMember = workspaceDoc.members.some(member => 
    member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const goal = await Goal.create({
    workspace: workspace,
    title,
    description,
    target,
    unit,
    deadline,
    createdBy: req.user._id
  });

  // Create activity
  await Activity.createActivity({
    workspace: workspace,
    user: req.user._id,
    type: 'goal_created',
    entity: {
      type: 'goal',
      id: goal._id
    },
    metadata: {
      title: goal.title
    }
  });

  const populatedGoal = await Goal.findById(goal._id)
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo.user', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Goal created successfully',
    data: populatedGoal
  });
}));

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Goal title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot be more than 1000 characters'),
  body('target')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target must be a positive integer'),
  body('unit')
    .optional()
    .isIn(['tasks', 'days', 'members', 'projects', 'hours'])
    .withMessage('Invalid unit'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Invalid deadline format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const goal = await Goal.findById(req.params.id);
  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  const oldData = {
    title: goal.title,
    target: goal.target,
    status: goal.status
  };

  Object.assign(goal, req.body);
  await goal.save();

  // Create activity
  await Activity.createActivity({
    workspace: goal.workspace,
    user: req.user._id,
    type: 'goal_updated',
    entity: {
      type: 'goal',
      id: goal._id
    },
    metadata: {
      title: goal.title,
      oldValue: oldData,
      newValue: {
        title: goal.title,
        target: goal.target,
        status: goal.status
      }
    }
  });

  const updatedGoal = await Goal.findById(goal._id)
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo.user', 'name email avatar')
    .populate('progressUpdates.user', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Goal updated successfully',
    data: updatedGoal
  });
}));

// @desc    Update goal progress
// @route   PUT /api/goals/:id/progress
// @access  Private
router.put('/:id/progress', [
  body('progress')
    .isInt({ min: 0 })
    .withMessage('Progress must be a non-negative integer'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot be more than 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { progress, note = '' } = req.body;

  const goal = await Goal.findById(req.params.id);
  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  const oldProgress = goal.current;
  await goal.updateProgress(progress, req.user._id, note);

  // Create activity if progress changed significantly
  if (Math.abs(progress - oldProgress) >= 1) {
    await Activity.createActivity({
      workspace: goal.workspace,
      user: req.user._id,
      type: 'goal_updated',
      entity: {
        type: 'goal',
        id: goal._id
      },
      metadata: {
        title: goal.title,
        oldValue: oldProgress,
        newValue: progress
      }
    });
  }

  const updatedGoal = await Goal.findById(goal._id)
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo.user', 'name email avatar')
    .populate('progressUpdates.user', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Goal progress updated successfully',
    data: updatedGoal
  });
}));

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  goal.isActive = false;
  await goal.save();

  res.status(200).json({
    success: true,
    message: 'Goal deleted successfully'
  });
}));

// @desc    Get goal statistics
// @route   GET /api/goals/stats
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId || req.query.workspaceId;
  const stats = await Goal.getWorkspaceStats(workspaceId);

  res.status(200).json({
    success: true,
    data: stats
  });
}));

module.exports = router; 