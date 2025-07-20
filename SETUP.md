# TaskFlow MERN Stack Setup Guide

Complete setup instructions for running the TaskFlow task management platform with real authentication, database integration, and all features.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your configuration
# See Environment Configuration section below
```

### 2. Setup Frontend

```bash
# Navigate to frontend directory (root of project)
cd ..

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your configuration
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd ..
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Environment Configuration

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/taskflow

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:5000/api
```

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `taskflow`

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

## 🔐 Authentication Features

### User Registration
- Email validation
- Password hashing with bcrypt
- JWT token generation
- Automatic login after registration

### User Login
- Email/password authentication
- JWT token storage
- Refresh token support
- Automatic token refresh

### Security Features
- Password hashing (bcryptjs)
- JWT token authentication
- Rate limiting
- CORS protection
- Input validation
- XSS protection

## 🏢 Workspace Management

### Workspace Roles
- **Owner**: Full control, can delete workspace
- **Admin**: Can manage members and settings
- **Member**: Can create and edit tasks
- **Viewer**: Read-only access

### Workspace Features
- Create/update/delete workspaces
- Add/remove members
- Role-based permissions
- Workspace statistics
- Custom colors and icons

## 📋 Task Management

### Task Features
- Full CRUD operations
- Drag-and-drop reordering
- Status tracking (Todo → In Progress → Review → Done)
- Priority levels (Low, Medium, High, Urgent)
- Due dates and time tracking
- Assignees and reporters
- Tags and labels
- Subtasks
- Comments and mentions
- File attachments
- Task watchers

### Task Status Flow
```
Todo → In Progress → Review → Done
```

## 📊 Analytics & Reporting

### Dashboard Analytics
- Total tasks and completion rates
- Overdue tasks tracking
- Recent activity feed
- Productivity trends
- Workspace statistics

### User Analytics
- Personal productivity metrics
- Task completion rates
- Time tracking
- Activity history

### Team Analytics
- Team performance metrics
- Workload distribution
- Member productivity
- Collaboration insights

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Workspaces
- `GET /api/workspaces` - Get user workspaces
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/members` - Add member
- `PUT /api/workspaces/:id/members/:userId` - Update member role
- `DELETE /api/workspaces/:id/members/:userId` - Remove member

### Tasks
- `GET /api/tasks` - Get tasks for workspace
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/reorder` - Reorder tasks (drag & drop)
- `POST /api/tasks/:id/comments` - Add comment
- `POST /api/tasks/:id/subtasks` - Add subtask
- `PUT /api/tasks/:id/subtasks/:index` - Complete subtask

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/workspace/:id` - Workspace analytics
- `GET /api/analytics/productivity` - User productivity
- `GET /api/analytics/team/:id` - Team analytics

## 🎯 Testing the Application

### 1. Create Account
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in your details
4. Create account

### 2. Create Workspace
1. After login, click "Create Workspace"
2. Fill in workspace details
3. Set color and icon

### 3. Add Team Members
1. Go to workspace settings
2. Click "Add Member"
3. Enter email address
4. Set role (member/admin)

### 4. Create Tasks
1. Go to workspace board
2. Click "Add Task"
3. Fill in task details
4. Assign to team member

### 5. Test Drag & Drop
1. Drag tasks between columns
2. Reorder tasks within columns
3. Watch real-time updates

## 🚀 Production Deployment

### Backend Deployment

1. **Environment Variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-production-secret
   FRONTEND_URL=https://your-domain.com
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment

1. **Environment Variables**
   ```env
   VITE_API_URL=https://your-api-domain.com/api
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   # Deploy dist/ folder to your hosting service
   ```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon
```

### Frontend Development
```bash
npm run dev  # Start Vite dev server
```

### Database Management
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/taskflow

# View collections
show collections

# Query data
db.users.find()
db.workspaces.find()
db.tasks.find()
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity

2. **JWT Token Errors**
   - Clear browser localStorage
   - Check JWT_SECRET in backend `.env`
   - Verify token expiration settings

3. **CORS Errors**
   - Check FRONTEND_URL in backend `.env`
   - Verify frontend is running on correct port
   - Check browser console for CORS errors

4. **API Connection Errors**
   - Verify VITE_API_URL in frontend `.env.local`
   - Check if backend is running
   - Check network connectivity

### Debug Mode

Enable debug logging in backend:
```env
NODE_ENV=development
DEBUG=*
```

## 📚 API Documentation

For detailed API documentation, see:
- Backend README: `backend/README.md`
- API endpoints: Check the routes files in `backend/routes/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**TaskFlow** - Modern task management platform built with MERN stack 