const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    maxlength: [100, 'Workspace name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  settings: {
    visibility: {
      type: String,
      enum: ['public', 'private', 'team'],
      default: 'private'
    },
    allowGuestAccess: {
      type: Boolean,
      default: false
    },
    defaultTaskStatus: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo'
    },
    taskLabels: [{
      name: String,
      color: String
    }],
    taskPriorities: {
      type: [String],
      default: ['low', 'medium', 'high', 'urgent']
    }
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  icon: {
    type: String,
    default: '📋'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for completion percentage
workspaceSchema.virtual('completionPercentage').get(function() {
  if (this.stats.totalTasks === 0) return 0;
  return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
});

// Indexes for better query performance
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });
workspaceSchema.index({ isActive: 1 });

// Pre-save middleware to update member count
workspaceSchema.pre('save', function(next) {
  this.stats.totalMembers = this.members.length;
  next();
});

// Method to add member
workspaceSchema.methods.addMember = function(userId, role = 'member', invitedBy = null) {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this workspace');
  }

  this.members.push({
    user: userId,
    role,
    invitedBy
  });

  return this.save();
};

// Method to remove member
workspaceSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update member role
workspaceSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User is not a member of this workspace');
  }

  member.role = newRole;
  return this.save();
};

// Method to check if user has permission
workspaceSchema.methods.hasPermission = function(userId, requiredRole) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) return false;

  const roleHierarchy = {
    'owner': 4,
    'admin': 3,
    'member': 2,
    'viewer': 1
  };

  return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
};

// Method to get member role
workspaceSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  return member ? member.role : null;
};

// Static method to find workspaces by user
workspaceSchema.statics.findByUser = function(userId) {
  return this.find({
    'members.user': userId,
    isActive: true
  }).populate('owner', 'name email avatar');
};

module.exports = mongoose.model('Workspace', workspaceSchema); 