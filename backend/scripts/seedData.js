const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Task.deleteMany({});
    await Goal.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            taskUpdates: true,
            mentions: true
          },
          timezone: 'UTC'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            taskUpdates: true,
            mentions: true
          },
          timezone: 'UTC'
        }
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        preferences: {
          theme: 'dark',
          notifications: {
            email: true,
            push: false,
            taskUpdates: true,
            mentions: true
          },
          timezone: 'UTC'
        }
      }
    ]);

    console.log('Created users:', users.length);

    // Create workspace
    const workspace = await Workspace.create({
      name: 'TaskFlow Development',
      description: 'Main workspace for TaskFlow platform development',
      owner: users[0]._id,
      members: [
        {
          user: users[0]._id,
          role: 'owner',
          joinedAt: new Date()
        },
        {
          user: users[1]._id,
          role: 'admin',
          joinedAt: new Date()
        },
        {
          user: users[2]._id,
          role: 'member',
          joinedAt: new Date()
        }
      ],
      settings: {
        visibility: 'team',
        allowGuestAccess: false,
        defaultTaskStatus: 'todo',
        taskLabels: [
          { name: 'Bug', color: '#ef4444' },
          { name: 'Feature', color: '#3b82f6' },
          { name: 'Enhancement', color: '#10b981' }
        ],
        taskPriorities: ['low', 'medium', 'high', 'urgent']
      },
      color: '#3b82f6',
      icon: '🚀',
      isActive: true
    });

    console.log('Created workspace:', workspace.name);

    // Create tasks
    const tasks = await Task.create([
      {
        title: 'Design new landing page',
        description: 'Create a modern and responsive landing page for the TaskFlow platform',
        workspace: workspace._id,
        status: 'in-progress',
        priority: 'high',
        assignee: users[1]._id,
        reporter: users[0]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        estimatedHours: 16,
        tags: ['design', 'frontend'],
        labels: [{ name: 'Feature', color: '#3b82f6' }],
        position: 0
      },
      {
        title: 'Implement user authentication',
        description: 'Set up JWT-based authentication with refresh tokens',
        workspace: workspace._id,
        status: 'done',
        priority: 'high',
        assignee: users[0]._id,
        reporter: users[0]._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        estimatedHours: 12,
        actualHours: 10,
        tags: ['backend', 'security'],
        labels: [{ name: 'Feature', color: '#3b82f6' }],
        position: 1,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Fix login page bug',
        description: 'Users are experiencing issues with the login form validation',
        workspace: workspace._id,
        status: 'review',
        priority: 'urgent',
        assignee: users[2]._id,
        reporter: users[1]._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        estimatedHours: 4,
        tags: ['bug', 'frontend'],
        labels: [{ name: 'Bug', color: '#ef4444' }],
        position: 2
      },
      {
        title: 'Add analytics dashboard',
        description: 'Create comprehensive analytics and reporting features',
        workspace: workspace._id,
        status: 'todo',
        priority: 'medium',
        assignee: users[1]._id,
        reporter: users[0]._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        estimatedHours: 24,
        tags: ['analytics', 'dashboard'],
        labels: [{ name: 'Feature', color: '#3b82f6' }],
        position: 3
      },
      {
        title: 'Optimize database queries',
        description: 'Improve performance by optimizing MongoDB queries',
        workspace: workspace._id,
        status: 'todo',
        priority: 'medium',
        assignee: users[0]._id,
        reporter: users[2]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        estimatedHours: 8,
        tags: ['backend', 'performance'],
        labels: [{ name: 'Enhancement', color: '#10b981' }],
        position: 4
      }
    ]);

    console.log('Created tasks:', tasks.length);

    // Create goals
    const goals = await Goal.create([
      {
        title: 'Complete 50 tasks this month',
        description: 'Increase team productivity by completing 50 tasks across all projects',
        workspace: workspace._id,
        target: 50,
        current: 32,
        unit: 'tasks',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
        createdBy: users[0]._id,
        assignedTo: [
          { user: users[0]._id, role: 'owner' },
          { user: users[1]._id, role: 'contributor' },
          { user: users[2]._id, role: 'contributor' }
        ]
      },
      {
        title: 'Reduce average completion time',
        description: 'Improve efficiency by reducing task completion time from 5 to 3 days',
        workspace: workspace._id,
        target: 3,
        current: 4.2,
        unit: 'days',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        status: 'active',
        createdBy: users[1]._id,
        assignedTo: [
          { user: users[0]._id, role: 'contributor' },
          { user: users[1]._id, role: 'owner' }
        ]
      },
      {
        title: 'Onboard 3 new team members',
        description: 'Expand the team by adding 3 new members to increase capacity',
        workspace: workspace._id,
        target: 3,
        current: 1,
        unit: 'members',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'active',
        createdBy: users[0]._id,
        assignedTo: [
          { user: users[0]._id, role: 'owner' }
        ]
      }
    ]);

    console.log('Created goals:', goals.length);

    // Create activities
    const activities = await Activity.create([
      {
        workspace: workspace._id,
        user: users[0]._id,
        type: 'workspace_created',
        entity: {
          type: 'workspace',
          id: workspace._id
        },
        metadata: {
          title: workspace.name
        },
        message: 'created a new workspace'
      },
      {
        workspace: workspace._id,
        user: users[0]._id,
        type: 'task_created',
        entity: {
          type: 'task',
          id: tasks[0]._id
        },
        metadata: {
          title: tasks[0].title
        },
        message: 'created a new task'
      },
      {
        workspace: workspace._id,
        user: users[1]._id,
        type: 'task_completed',
        entity: {
          type: 'task',
          id: tasks[1]._id
        },
        metadata: {
          title: tasks[1].title
        },
        message: 'completed a task'
      },
      {
        workspace: workspace._id,
        user: users[2]._id,
        type: 'member_joined',
        entity: {
          type: 'member',
          id: users[2]._id
        },
        metadata: {
          title: users[2].name
        },
        message: 'joined the workspace'
      },
      {
        workspace: workspace._id,
        user: users[0]._id,
        type: 'goal_created',
        entity: {
          type: 'goal',
          id: goals[0]._id
        },
        metadata: {
          title: goals[0].title
        },
        message: 'created a new goal'
      },
      {
        workspace: workspace._id,
        user: users[1]._id,
        type: 'task_updated',
        entity: {
          type: 'task',
          id: tasks[2]._id
        },
        metadata: {
          title: tasks[2].title,
          oldValue: 'todo',
          newValue: 'review'
        },
        message: 'updated a task'
      }
    ]);

    console.log('Created activities:', activities.length);

    // Update workspace stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const totalMembers = workspace.members.length;

    await Workspace.findByIdAndUpdate(workspace._id, {
      stats: {
        totalTasks,
        completedTasks,
        totalMembers
      },
      completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    });

    console.log('✅ Seed data created successfully!');
    console.log(`📊 Users: ${users.length}`);
    console.log(`🏢 Workspace: ${workspace.name}`);
    console.log(`📋 Tasks: ${tasks.length}`);
    console.log(`🎯 Goals: ${goals.length}`);
    console.log(`📈 Activities: ${activities.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData(); 