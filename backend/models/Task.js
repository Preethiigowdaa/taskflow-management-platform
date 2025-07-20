const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date
  },
  startDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  labels: [{
    name: String,
    color: String
  }],
  attachments: [attachmentSchema],
  comments: [commentSchema],
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'relates_to'],
      default: 'blocks'
    }
  }],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  position: {
    type: Number,
    default: 0
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task progress
taskSchema.virtual('progress').get(function() {
  if (this.subtasks.length === 0) {
    return this.status === 'done' ? 100 : 0;
  }
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.isCompleted).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'done') return false;
  return new Date() > this.dueDate;
});

// Virtual for time remaining
taskSchema.virtual('timeRemaining').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diff = due - now;
  
  if (diff <= 0) return 'Overdue';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
});

// Indexes for better query performance
taskSchema.index({ workspace: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ 'watchers': 1 });
taskSchema.index({ isArchived: 1 });

// Pre-save middleware to update completion date
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'done' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Method to add comment
taskSchema.methods.addComment = function(userId, content, attachments = []) {
  this.comments.push({
    user: userId,
    content,
    attachments
  });
  return this.save();
};

// Method to add subtask
taskSchema.methods.addSubtask = function(title) {
  this.subtasks.push({ title });
  return this.save();
};

// Method to complete subtask
taskSchema.methods.completeSubtask = function(subtaskIndex, userId) {
  if (subtaskIndex >= 0 && subtaskIndex < this.subtasks.length) {
    this.subtasks[subtaskIndex].isCompleted = true;
    this.subtasks[subtaskIndex].completedAt = new Date();
    this.subtasks[subtaskIndex].completedBy = userId;
  }
  return this.save();
};

// Method to add watcher
taskSchema.methods.addWatcher = function(userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
  }
  return this.save();
};

// Method to remove watcher
taskSchema.methods.removeWatcher = function(userId) {
  this.watchers = this.watchers.filter(watcher => 
    watcher.toString() !== userId.toString()
  );
  return this.save();
};

// Method to add attachment
taskSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push(attachmentData);
  return this.save();
};

// Static method to find tasks by workspace
taskSchema.statics.findByWorkspace = function(workspaceId, options = {}) {
  const query = { workspace: workspaceId, isArchived: false };
  
  if (options.status) query.status = options.status;
  if (options.assignee) query.assignee = options.assignee;
  if (options.priority) query.priority = options.priority;
  
  return this.find(query)
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .populate('comments.user', 'name email avatar')
    .sort({ position: 1, createdAt: -1 });
};

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function(workspaceId) {
  return this.find({
    workspace: workspaceId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' },
    isArchived: false
  }).populate('assignee', 'name email avatar');
};

module.exports = mongoose.model('Task', taskSchema); 