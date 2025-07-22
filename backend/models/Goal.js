const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  target: {
    type: Number,
    required: true,
    min: 1
  },
  current: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['tasks', 'days', 'members', 'projects', 'hours'],
    default: 'tasks'
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'overdue'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'contributor', 'viewer'],
      default: 'contributor'
    }
  }],
  progressUpdates: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    value: {
      type: Number,
      required: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
goalSchema.index({ workspace: 1, status: 1 });
goalSchema.index({ deadline: 1 });
goalSchema.index({ createdBy: 1 });

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  return Math.min((this.current / this.target) * 100, 100);
});

// Virtual for time remaining
goalSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for isOverdue
goalSchema.virtual('isOverdue').get(function() {
  return new Date() > new Date(this.deadline) && this.status !== 'completed';
});

// Methods
goalSchema.methods.updateProgress = async function(newProgress, userId, note = '') {
  this.current = Math.max(0, Math.min(newProgress, this.target));
  
  // Add progress update
  this.progressUpdates.push({
    user: userId,
    value: this.current,
    note
  });

  // Update status
  if (this.current >= this.target) {
    this.status = 'completed';
  } else if (this.isOverdue) {
    this.status = 'overdue';
  } else {
    this.status = 'active';
  }

  return await this.save();
};

goalSchema.methods.addContributor = async function(userId, role = 'contributor') {
  const existingContributor = this.assignedTo.find(
    contributor => contributor.user.toString() === userId.toString()
  );

  if (!existingContributor) {
    this.assignedTo.push({ user: userId, role });
    return await this.save();
  }
  return this;
};

goalSchema.methods.removeContributor = async function(userId) {
  this.assignedTo = this.assignedTo.filter(
    contributor => contributor.user.toString() !== userId.toString()
  );
  return await this.save();
};

// Static methods
goalSchema.statics.findByWorkspace = async function(workspaceId, options = {}) {
  const query = { workspace: workspaceId, isActive: true };
  
  if (options.status) {
    query.status = options.status;
  }

  return await this.find(query)
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo.user', 'name email avatar')
    .populate('progressUpdates.user', 'name email avatar')
    .sort({ createdAt: -1 });
};

goalSchema.statics.getWorkspaceStats = async function(workspaceId) {
  const goals = await this.find({ workspace: workspaceId, isActive: true });
  
  const total = goals.length;
  const completed = goals.filter(goal => goal.status === 'completed').length;
  const active = goals.filter(goal => goal.status === 'active').length;
  const overdue = goals.filter(goal => goal.status === 'overdue').length;
  
  const averageProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => sum + goal.progressPercentage, 0) / goals.length 
    : 0;

  return {
    total,
    completed,
    active,
    overdue,
    averageProgress: Math.round(averageProgress * 100) / 100
  };
};

module.exports = mongoose.model('Goal', goalSchema); 