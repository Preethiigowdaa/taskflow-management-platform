const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Middleware to check workspace permissions
const workspacePermissionMiddleware = (requiredRole = 'member') => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.id || req.params.workspaceId;
      const userId = req.user._id;

      console.log('Workspace permission middleware - workspaceId:', workspaceId);
      console.log('Workspace permission middleware - userId:', userId);

      // Import Workspace model here to avoid circular dependency
      const Workspace = require('../models/Workspace');
      
      const workspace = await Workspace.findById(workspaceId);
      
      console.log('Workspace permission middleware - workspace found:', !!workspace);
      
      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: 'Workspace not found.'
        });
      }

      // Check if user has permission
      if (!workspace.hasPermission(userId, requiredRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${requiredRole} role required.`
        });
      }

      req.workspace = workspace;
      next();
    } catch (error) {
      console.error('Workspace permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  };
};

// Middleware to check task permissions
const taskPermissionMiddleware = (requiredRole = 'member') => {
  return async (req, res, next) => {
    try {
      const taskId = req.params.id || req.params.taskId;
      const userId = req.user._id;

      console.log('Task permission middleware - taskId:', taskId);
      console.log('Task permission middleware - userId:', userId);

      // Import Task model here to avoid circular dependency
      const Task = require('../models/Task');
      
      const task = await Task.findById(taskId).populate('workspace');
      
      console.log('Task permission middleware - task found:', !!task);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found.'
        });
      }

      // Check workspace permissions
      if (!task.workspace.hasPermission(userId, requiredRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${requiredRole} role required.`
        });
      }

      req.task = task;
      next();
    } catch (error) {
      console.error('Task permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  };
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  workspacePermissionMiddleware,
  taskPermissionMiddleware,
  optionalAuthMiddleware
}; 