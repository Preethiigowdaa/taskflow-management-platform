const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware, workspacePermissionMiddleware, taskPermissionMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @desc    Get all tasks for a workspace
// @route   GET /api/tasks
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { workspaceId, status, assignee, priority, search } = req.query;

  console.log('GET /api/tasks - Query params:', req.query);

  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      message: 'Workspace ID is required'
    });
  }

  const options = {};
  if (status) options.status = status;
  if (assignee) options.assignee = assignee;
  if (priority) options.priority = priority;

  let tasks = await Task.findByWorkspace(workspaceId, options);

  // Apply search filter if provided
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    tasks = tasks.filter(task => 
      task.title.match(searchRegex) || 
      task.description?.match(searchRegex) ||
      task.tags.some(tag => tag.match(searchRegex))
    );
  }

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
}));

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', taskPermissionMiddleware('viewer'), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .populate('workspace', 'name color')
    .populate('comments.user', 'name email avatar')
    .populate('comments.mentions', 'name email avatar')
    .populate('watchers', 'name email avatar')
    .populate('dependencies.task', 'title status priority');

  res.status(200).json({
    success: true,
    data: task
  });
}));

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot be more than 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('Invalid assignee ID'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a positive number'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  console.log('POST /api/tasks - Body:', req.body);

  const { workspaceId } = req.body;
  
  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      message: 'Workspace ID is required'
    });
  }

  const workspace = await Workspace.findById(workspaceId);
  
  if (!workspace) {
    return res.status(404).json({
      success: false,
      message: 'Workspace not found'
    });
  }

  // Get the highest position in the current status column
  const maxPosition = await Task.findOne({ 
    workspace: workspaceId, 
    status: req.body.status || 'todo' 
  }).sort({ position: -1 }).select('position');
  
  const position = maxPosition ? maxPosition.position + 1 : 0;

  const task = await Task.create({
    ...req.body,
    workspace: workspaceId,
    reporter: req.user._id,
    position
  });

  // Update workspace stats
  workspace.stats.totalTasks += 1;
  await workspace.save();

  const populatedTask = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .populate('workspace', 'name color');

  res.status(201).json({
    success: true,
    data: populatedTask
  });
}));

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', taskPermissionMiddleware('member'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot be more than 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('Invalid assignee ID'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a positive number'),
  body('actualHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual hours must be a positive number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .populate('workspace', 'name color');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Update workspace stats if status changed
  if (req.body.status) {
    const workspace = await Workspace.findById(task.workspace);
    if (workspace) {
      // Recalculate stats
      const stats = await Task.aggregate([
        { $match: { workspace: task.workspace, isArchived: false } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      workspace.stats.totalTasks = stats.reduce((sum, stat) => sum + stat.count, 0);
      workspace.stats.completedTasks = stats.find(stat => stat._id === 'done')?.count || 0;
      await workspace.save();
    }
  }

  res.status(200).json({
    success: true,
    data: task
  });
}));

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', taskPermissionMiddleware('member'), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Soft delete - mark as archived
  task.isArchived = true;
  await task.save();

  // Update workspace stats
  const workspace = await Workspace.findById(task.workspace);
  if (workspace) {
    workspace.stats.totalTasks = Math.max(0, workspace.stats.totalTasks - 1);
    if (task.status === 'done') {
      workspace.stats.completedTasks = Math.max(0, workspace.stats.completedTasks - 1);
    }
    await workspace.save();
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// @desc    Update task positions (for drag and drop)
// @route   PUT /api/tasks/reorder
// @access  Private
router.put('/reorder', workspacePermissionMiddleware('member'), [
  body('tasks')
    .isArray()
    .withMessage('Tasks must be an array'),
  body('tasks.*.id')
    .isMongoId()
    .withMessage('Invalid task ID'),
  body('tasks.*.status')
    .isIn(['todo', 'in-progress', 'review', 'done'])
    .withMessage('Invalid status'),
  body('tasks.*.position')
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { tasks } = req.body;
  const { workspaceId } = req.params;

  // Update all tasks in bulk
  const updatePromises = tasks.map(task => 
    Task.findByIdAndUpdate(task.id, {
      status: task.status,
      position: task.position
    })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: 'Tasks reordered successfully'
  });
}));

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
router.post('/:id/comments', taskPermissionMiddleware('member'), [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content must be between 1 and 1000 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { content } = req.body;
  const task = req.task;

  await task.addComment(req.user._id, content);

  const updatedTask = await Task.findById(task._id)
    .populate('comments.user', 'name email avatar')
    .populate('comments.mentions', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Comment added successfully',
    data: updatedTask.comments[updatedTask.comments.length - 1]
  });
}));

// @desc    Add subtask to task
// @route   POST /api/tasks/:id/subtasks
// @access  Private
router.post('/:id/subtasks', taskPermissionMiddleware('member'), [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subtask title must be between 1 and 200 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { title } = req.body;
  const task = req.task;

  await task.addSubtask(title);

  const updatedTask = await Task.findById(task._id);
  const newSubtask = updatedTask.subtasks[updatedTask.subtasks.length - 1];

  res.status(200).json({
    success: true,
    message: 'Subtask added successfully',
    data: newSubtask
  });
}));

// @desc    Complete subtask
// @route   PUT /api/tasks/:id/subtasks/:subtaskIndex
// @access  Private
router.put('/:id/subtasks/:subtaskIndex', taskPermissionMiddleware('member'), asyncHandler(async (req, res) => {
  const { subtaskIndex } = req.params;
  const task = req.task;

  if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
    return res.status(400).json({
      success: false,
      message: 'Invalid subtask index'
    });
  }

  await task.completeSubtask(parseInt(subtaskIndex), req.user._id);

  const updatedTask = await Task.findById(task._id);
  const updatedSubtask = updatedTask.subtasks[parseInt(subtaskIndex)];

  res.status(200).json({
    success: true,
    message: 'Subtask updated successfully',
    data: updatedSubtask
  });
}));

// @desc    Add watcher to task
// @route   POST /api/tasks/:id/watchers
// @access  Private
router.post('/:id/watchers', taskPermissionMiddleware('member'), asyncHandler(async (req, res) => {
  const task = req.task;

  await task.addWatcher(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Added as watcher successfully'
  });
}));

// @desc    Remove watcher from task
// @route   DELETE /api/tasks/:id/watchers
// @access  Private
router.delete('/:id/watchers', taskPermissionMiddleware('member'), asyncHandler(async (req, res) => {
  const task = req.task;

  await task.removeWatcher(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Removed as watcher successfully'
  });
}));

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
router.get('/overdue', workspacePermissionMiddleware('viewer'), asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const overdueTasks = await Task.findOverdue(workspaceId);

  res.status(200).json({
    success: true,
    count: overdueTasks.length,
    data: overdueTasks
  });
}));

// @desc    Get tasks by assignee
// @route   GET /api/tasks/assigned
// @access  Private
router.get('/assigned', asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    assignee: req.user._id,
    isArchived: false
  })
    .populate('workspace', 'name color')
    .populate('reporter', 'name email avatar')
    .sort({ dueDate: 1, priority: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
}));

// @desc    Get tasks by reporter
// @route   GET /api/tasks/reported
// @access  Private
router.get('/reported', asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    reporter: req.user._id,
    isArchived: false
  })
    .populate('workspace', 'name color')
    .populate('assignee', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
}));

module.exports = router; 