# 🚀 TaskFlow - Task Management Platform

A comprehensive project management tool with real-time collaboration, drag-and-drop functionality, team workspaces, and advanced filtering.

## ✨ Features

- **📋 Task Management**: Create, edit, and organize tasks with drag-and-drop
- **👥 Team Collaboration**: Real-time updates and team workspaces
- **📊 Analytics Dashboard**: Track progress and productivity metrics
- **🎯 Goal Tracking**: Set and monitor team goals
- **🔍 Advanced Filtering**: Search and filter tasks by various criteria
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **🔐 Secure Authentication**: JWT-based authentication system

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT tokens
- **Database**: MongoDB Atlas
- **Deployment**: Render (Free tier)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskflow-management-platform.git
   cd taskflow-management-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy example files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit backend/.env with your MongoDB connection string
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🌐 Deployment

### Free Deployment on Render

This app is configured for free deployment on Render. Follow these steps:

1. **Set up MongoDB Atlas** (Free database)
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account and cluster
   - Get your connection string

2. **Deploy to Render**
   - Go to [Render](https://render.com)
   - Sign up with GitHub
   - Connect your repository
   - Deploy both backend and frontend services

3. **Configure Environment Variables**
   - Add your MongoDB connection string
   - Set JWT secrets
   - Update frontend API URL

📖 **Detailed deployment guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Deployment URLs
After deployment, your app will be available at:
- **Frontend**: `https://taskflow-frontend.onrender.com`
- **Backend**: `https://taskflow-backend.onrender.com`

## 📁 Project Structure

```
taskflow-management-platform/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & validation
│   ├── scripts/            # Database seeding
│   └── server.js           # Main server file
├── frontend/               # React/Vite application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   └── contexts/       # React contexts
│   ├── public/             # Static assets
│   └── index.html          # Entry point
├── render.yaml             # Render deployment config
└── DEPLOYMENT.md           # Detailed deployment guide
```

## 🔧 Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend in development
- `npm run install:all` - Install dependencies for all packages
- `npm run build` - Build frontend for production

### Backend
- `npm run dev` - Start backend with nodemon
- `npm start` - Start backend in production
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://taskflow-frontend.onrender.com
```

### Frontend (.env)
```env
VITE_API_URL=https://taskflow-backend.onrender.com/api
```

## 🧪 Testing

```bash
# Test backend
cd backend
npm test

# Test frontend
cd frontend
npm run test
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Workspaces
- `GET /api/workspaces` - Get user workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace details

### Tasks
- `GET /api/tasks` - Get workspace tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Analytics
- `GET /api/analytics` - Get workspace analytics
- `GET /api/analytics/realtime` - Get real-time metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting section](./DEPLOYMENT.md#troubleshooting)
2. Review the deployment logs in Render dashboard
3. Verify environment variables are set correctly
4. Test locally first

## 🎉 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [MongoDB](https://mongodb.com/) - Database
- [Render](https://render.com/) - Free hosting
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://framer.com/motion/) - Animations

---

**Made with ❤️ by the TaskFlow Team** 