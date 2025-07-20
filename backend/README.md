# TaskFlow Backend API

A comprehensive RESTful API for the TaskFlow task management platform built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

- **🔐 JWT Authentication** - Secure user authentication with refresh tokens
- **👥 User Management** - User profiles, preferences, and activity tracking
- **🏢 Workspace Management** - Team workspaces with role-based permissions
- **📋 Task Management** - Full CRUD operations with drag-and-drop support
- **💬 Comments & Collaboration** - Task comments, mentions, and file attachments
- **📊 Analytics & Reporting** - Comprehensive analytics and productivity metrics
- **🔒 Role-Based Access Control** - Granular permissions for workspaces and tasks
- **📈 Real-time Statistics** - Live workspace and user statistics

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer
- **Real-time**: Socket.io (ready for implementation)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

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
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Workspace Endpoints

#### Get All Workspaces
```http
GET /api/workspaces
Authorization: Bearer <token>
```

#### Create Workspace
```http
POST /api/workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Development",
  "description": "Main product development workspace",
  "color": "#3B82F6",
  "icon": "📋"
}
```

#### Add Member to Workspace
```http
POST /api/workspaces/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "member@example.com",
  "role": "member"
}
```

### Task Endpoints

#### Get Tasks for Workspace
```http
GET /api/tasks?workspaceId=:workspaceId
Authorization: Bearer <token>
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add secure user authentication with JWT",
  "status": "todo",
  "priority": "high",
  "assignee": "user_id",
  "dueDate": "2024-02-15T00:00:00.000Z",
  "tags": ["backend", "security"]
}
```

#### Update Task (Drag & Drop)
```http
PUT /api/tasks/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "tasks": [
    {
      "id": "task_id",
      "status": "in-progress",
      "position": 0
    }
  ]
}
```

### Analytics Endpoints

#### Get Dashboard Analytics
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

#### Get Workspace Analytics
```http
GET /api/analytics/workspace/:workspaceId
Authorization: Bearer <token>
```

#### Get User Productivity
```http
GET /api/analytics/productivity?period=30
Authorization: Bearer <token>
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Structure

- **Access Token**: Valid for 7 days
- **Refresh Token**: Valid for 30 days
- **Automatic Refresh**: Use refresh token to get new access token

## 🏢 Workspace Roles

- **Owner**: Full control, can delete workspace
- **Admin**: Can manage members and settings
- **Member**: Can create and edit tasks
- **Viewer**: Read-only access

## 📋 Task Status Flow

```
Todo → In Progress → Review → Done
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse
- **CORS Protection**: Configurable cross-origin requests
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Mongoose ODM protection
- **XSS Protection**: Helmet security headers

## 📊 Database Models

### User Model
- Profile information (name, email, avatar)
- Authentication (password, tokens)
- Preferences (theme, notifications, timezone)
- Workspace memberships

### Workspace Model
- Basic info (name, description, color, icon)
- Members with roles
- Settings and permissions
- Statistics tracking

### Task Model
- Task details (title, description, status, priority)
- Assignment and reporting
- Comments and attachments
- Subtasks and dependencies
- Time tracking and due dates

## 🚀 Development

### Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

### Available Scripts

```bash
npm run dev          # Start development server
npm start           # Start production server
npm test            # Run tests
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/taskflow` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🔧 Customization

### Adding New Routes

1. Create route file in `routes/` directory
2. Import in `server.js`
3. Add middleware as needed

### Adding New Models

1. Create model file in `models/` directory
2. Define schema and methods
3. Export model

### Custom Middleware

1. Create middleware file in `middleware/` directory
2. Export middleware function
3. Use in routes or globally

## 🐛 Error Handling

The API uses centralized error handling with consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors
}
```

## 📈 Performance

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Large dataset handling
- **Caching**: Ready for Redis integration
- **Compression**: Response compression
- **Rate Limiting**: API abuse prevention

## 🔮 Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] File upload with cloud storage
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] API rate limiting per user
- [ ] Database backup and recovery
- [ ] Performance monitoring
- [ ] API documentation with Swagger

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

---

**TaskFlow Backend API** - Built with ❤️ for modern task management 