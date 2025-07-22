const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'task_created',
      'task_updated',
      'task_completed',
      'task_deleted',
      'comment_added',
      'member_joined',
      'member_left',
      'member_role_changed',
      'goal_created',
      'goal_updated',
      'goal_completed',
      'workspace_created',
      'workspace_updated'
    ]
  },
  entity: {
    type: {
      type: String,
      enum: ['task', 'comment', 'member', 'goal', 'workspace']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'entity.type'
    }
  },
  metadata: {
    title: String,
    description: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  message: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notified: {
      type: Boolean,
      default: false
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
activitySchema.index({ workspace: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ 'entity.id': 1 });

// Static methods
activitySchema.statics.createActivity = async function(data) {
  // Generate message if not provided
  if (!data.message) {
    const messages = {
      task_created: 'created a new task',
      task_updated: 'updated a task',
      task_completed: 'completed a task',
      task_deleted: 'deleted a task',
      comment_added: 'added a comment',
      member_joined: 'joined the workspace',
      member_left: 'left the workspace',
      member_role_changed: 'changed member role',
      goal_created: 'created a new goal',
      goal_updated: 'updated a goal',
      goal_completed: 'completed a goal',
      workspace_created: 'created a new workspace',
      workspace_updated: 'updated workspace settings'
    };
    data.message = messages[data.type] || 'performed an action';
  }
  
  const activity = new this(data);
  return await activity.save();
};

activitySchema.statics.findByWorkspace = async function(workspaceId, options = {}) {
  const { limit = 50, offset = 0, type, userId } = options;
  
  const query = { workspace: workspaceId, isPublic: true };
  
  if (type) {
    query.type = type;
  }
  
  if (userId) {
    query.user = userId;
  }

  const activities = await this.find(query)
    .populate('user', 'name email avatar')
    .populate('mentions.user', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);

  // Manually populate entity.id based on entity.type
  for (let activity of activities) {
    if (activity.entity && activity.entity.id) {
      try {
        let model;
        switch (activity.entity.type) {
          case 'task':
            model = mongoose.model('Task');
            break;
          case 'goal':
            model = mongoose.model('Goal');
            break;
          case 'workspace':
            model = mongoose.model('Workspace');
            break;
          case 'comment':
            // Handle comment population if needed
            break;
          case 'member':
            model = mongoose.model('User');
            break;
        }
        
        if (model) {
          const entity = await model.findById(activity.entity.id);
          if (entity) {
            activity.entity.populatedId = entity;
          }
        }
      } catch (error) {
        console.log('Error populating entity:', error.message);
      }
    }
  }

  return activities;
};

activitySchema.statics.getUserActivity = async function(userId, options = {}) {
  const { limit = 20, offset = 0 } = options;
  
  const activities = await this.find({ user: userId })
    .populate('workspace', 'name color icon')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);

  // Manually populate entity.id based on entity.type
  for (let activity of activities) {
    if (activity.entity && activity.entity.id) {
      try {
        let model;
        switch (activity.entity.type) {
          case 'task':
            model = mongoose.model('Task');
            break;
          case 'goal':
            model = mongoose.model('Goal');
            break;
          case 'workspace':
            model = mongoose.model('Workspace');
            break;
          case 'comment':
            // Handle comment population if needed
            break;
          case 'member':
            model = mongoose.model('User');
            break;
        }
        
        if (model) {
          const entity = await model.findById(activity.entity.id);
          if (entity) {
            activity.entity.populatedId = entity;
          }
        }
      } catch (error) {
        console.log('Error populating entity:', error.message);
      }
    }
  }

  return activities;
};

activitySchema.statics.markAsRead = async function(activityId, userId) {
  return await this.findByIdAndUpdate(
    activityId,
    {
      $addToSet: {
        readBy: {
          user: userId,
          readAt: new Date()
        }
      }
    },
    { new: true }
  );
};

// Instance methods
activitySchema.methods.addMention = async function(userId) {
  const existingMention = this.mentions.find(
    mention => mention.user.toString() === userId.toString()
  );
  
  if (!existingMention) {
    this.mentions.push({ user: userId });
    return await this.save();
  }
  return this;
};

// Pre-save middleware to generate message if not provided
activitySchema.pre('save', function(next) {
  if (!this.message) {
    this.message = this.generateMessage();
  }
  next();
});

activitySchema.methods.generateMessage = function() {
  const messages = {
    task_created: 'created a new task',
    task_updated: 'updated a task',
    task_completed: 'completed a task',
    task_deleted: 'deleted a task',
    comment_added: 'added a comment',
    member_joined: 'joined the workspace',
    member_left: 'left the workspace',
    member_role_changed: 'changed member role',
    goal_created: 'created a new goal',
    goal_updated: 'updated a goal',
    goal_completed: 'completed a goal',
    workspace_created: 'created a new workspace',
    workspace_updated: 'updated workspace settings'
  };
  
  return messages[this.type] || 'performed an action';
};



module.exports = mongoose.model('Activity', activitySchema); 