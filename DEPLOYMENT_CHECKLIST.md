# ✅ TaskFlow Deployment Checklist

## Pre-Deployment Checklist

### 📋 Repository Setup
- [ ] Code is pushed to GitHub
- [ ] All dependencies are in package.json files
- [ ] Environment variables are documented
- [ ] .gitignore includes .env files
- [ ] README.md is updated

### 🗄️ Database Setup (MongoDB Atlas)
- [ ] MongoDB Atlas account created
- [ ] Free cluster created (M0)
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] Database name set to "taskflow"

### 🔧 Environment Variables
- [ ] Backend .env file created with:
  - [ ] MONGODB_URI (your connection string)
  - [ ] JWT_SECRET (strong secret key)
  - [ ] JWT_EXPIRE=30d
  - [ ] NODE_ENV=production
  - [ ] PORT=10000
  - [ ] FRONTEND_URL (will be set after frontend deployment)

- [ ] Frontend .env file created with:
  - [ ] VITE_API_URL (will be set after backend deployment)

---

## Deployment Steps

### 🚀 Step 1: Deploy Backend to Render
- [ ] Go to [Render.com](https://render.com)
- [ ] Sign up with GitHub account
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Configure service:
  - [ ] Name: `taskflow-backend`
  - [ ] Environment: `Node`
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
- [ ] Add environment variables:
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRE=30d
  - [ ] NODE_ENV=production
  - [ ] PORT=10000
  - [ ] FRONTEND_URL (temporary placeholder)
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Note the backend URL (e.g., `https://taskflow-backend.onrender.com`)

### 🌐 Step 2: Deploy Frontend to Render
- [ ] Click "New +" → "Static Site"
- [ ] Connect your GitHub repository again
- [ ] Configure service:
  - [ ] Name: `taskflow-frontend`
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Publish Directory: `dist`
- [ ] Add environment variable:
  - [ ] VITE_API_URL=https://taskflow-backend.onrender.com/api
- [ ] Click "Create Static Site"
- [ ] Wait for deployment to complete
- [ ] Note the frontend URL (e.g., `https://taskflow-frontend.onrender.com`)

### ⚙️ Step 3: Update Configuration
- [ ] Go back to backend service in Render
- [ ] Update FRONTEND_URL environment variable with your frontend URL
- [ ] Redeploy backend service
- [ ] Test the connection between frontend and backend

---

## Testing Checklist

### 🔍 Backend Testing
- [ ] Health check endpoint works: `https://taskflow-backend.onrender.com/api/health`
- [ ] API returns: `{"success":true,"message":"TaskFlow API is running"}`
- [ ] No CORS errors in browser console
- [ ] Database connection is working

### 🎯 Frontend Testing
- [ ] Frontend loads without errors
- [ ] Registration form works
- [ ] Login form works
- [ ] Can create a workspace
- [ ] Can create tasks
- [ ] Drag and drop functionality works
- [ ] Responsive design works on mobile

### 🔐 Security Testing
- [ ] JWT authentication works
- [ ] Protected routes require login
- [ ] Logout clears tokens
- [ ] No sensitive data in browser console

---

## Post-Deployment

### 📊 Monitoring
- [ ] Set up monitoring in Render dashboard
- [ ] Check application logs regularly
- [ ] Monitor MongoDB Atlas usage
- [ ] Set up alerts for errors

### 🔄 Maintenance
- [ ] Regular dependency updates
- [ ] Database backups (if needed)
- [ ] Performance monitoring
- [ ] Security updates

---

## Troubleshooting

### Common Issues:
- [ ] **Build fails**: Check build logs, verify dependencies
- [ ] **Database connection**: Verify MONGODB_URI, check network access
- [ ] **CORS errors**: Verify FRONTEND_URL in backend environment
- [ ] **Environment variables**: Ensure all variables are set in Render
- [ ] **Cold starts**: Normal for free tier, consider paid plans for production

### Useful Commands:
```bash
# Test backend locally
cd backend && npm start

# Test frontend locally
cd frontend && npm run build && npm run preview

# Check environment variables
echo $MONGODB_URI
echo $JWT_SECRET
```

---

## 🎉 Success Criteria

Your deployment is successful when:
- [ ] Frontend loads at your Render URL
- [ ] Backend API responds to health checks
- [ ] Users can register and login
- [ ] Users can create workspaces and tasks
- [ ] All features work as expected
- [ ] No console errors in browser
- [ ] Mobile responsive design works

---

**🎊 Congratulations! Your TaskFlow app is now live and accessible worldwide!**

**Frontend URL**: https://taskflow-frontend.onrender.com
**Backend URL**: https://taskflow-backend.onrender.com
**API Health Check**: https://taskflow-backend.onrender.com/api/health 