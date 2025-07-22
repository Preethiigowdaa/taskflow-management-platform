# 🚀 TaskFlow Deployment Guide

## Overview
This guide will help you deploy your TaskFlow application for free on Render. The app consists of:
- **Backend**: Node.js/Express API
- **Frontend**: React/Vite application
- **Database**: MongoDB Atlas (free tier)

## Prerequisites
- GitHub account with your TaskFlow repository
- Render account (free)
- MongoDB Atlas account (free)

---

## Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose the "Free" tier (M0)

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS/Google Cloud/Azure)
4. Choose a region close to your users
5. Click "Create"

### 1.3 Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 1.4 Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### 1.5 Get Your Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `taskflow`

**Example connection string (replace with your actual credentials):**
```
mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
```

---

## Step 2: Prepare Your Repository

### 2.1 Environment Variables
Create a `.env` file in your backend directory with these variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
FRONTEND_URL=https://taskflow-frontend.onrender.com
```

### 2.2 Update Frontend API URL
The frontend will automatically use the correct API URL when deployed.

---

## Step 3: Deploy on Render

### 3.1 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with your GitHub account
3. Verify your email

### 3.2 Deploy Backend Service

1. **Connect Repository**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your TaskFlow repository

2. **Configure Backend Service**
   - **Name**: `taskflow-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Add Environment Variables**
   - Click "Environment" tab
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=10000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_super_secret_jwt_key
     JWT_EXPIRE=30d
     FRONTEND_URL=https://taskflow-frontend.onrender.com
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the URL (e.g., `https://taskflow-backend.onrender.com`)

### 3.3 Deploy Frontend Service

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository again

2. **Configure Frontend Service**
   - **Name**: `taskflow-frontend`
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Add Environment Variables**
   - Click "Environment" tab
   - Add this variable:
     ```
     VITE_API_URL=https://taskflow-backend.onrender.com/api
     ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Note the URL (e.g., `https://taskflow-frontend.onrender.com`)

---

## Step 4: Update Configuration

### 4.1 Update Backend CORS
Make sure your backend allows requests from your frontend domain.

### 4.2 Update Frontend API URL
The frontend should automatically use the correct API URL from the environment variable.

---

## Step 5: Test Your Deployment

1. **Test Backend API**
   - Visit: `https://taskflow-backend.onrender.com/api/health`
   - Should return: `{"success":true,"message":"TaskFlow API is running"}`

2. **Test Frontend**
   - Visit your frontend URL
   - Try to register/login
   - Create a workspace and tasks

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain
1. Go to your Render dashboard
2. Select your service
3. Go to "Settings" → "Custom Domains"
4. Add your domain
5. Update DNS records as instructed

---

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network access in MongoDB Atlas
   - Ensure database user has correct permissions

3. **CORS Errors**
   - Verify FRONTEND_URL in backend environment variables
   - Check CORS configuration in server.js

4. **Environment Variables Not Working**
   - Ensure variables are set in Render dashboard
   - Check variable names match your code
   - Redeploy after adding variables

### Useful Commands:
```bash
# Check build logs
# View in Render dashboard

# Test API locally
curl https://taskflow-backend.onrender.com/api/health

# Check frontend build
npm run build
```

---

## Cost Breakdown (Free Tier)

- **Render Backend**: Free (750 hours/month)
- **Render Frontend**: Free (unlimited)
- **MongoDB Atlas**: Free (512MB storage)
- **Total Cost**: $0/month

---

## Maintenance

### Regular Tasks:
1. Monitor Render dashboard for any issues
2. Check MongoDB Atlas for storage usage
3. Update dependencies periodically
4. Monitor application logs

### Scaling (When Needed):
- Upgrade to paid Render plans
- Consider MongoDB Atlas paid tiers
- Add CDN for static assets

---

## Support

If you encounter issues:
1. Check Render documentation
2. Review MongoDB Atlas guides
3. Check application logs in Render dashboard
4. Verify environment variables are set correctly

---

**🎉 Congratulations! Your TaskFlow app is now deployed and accessible worldwide!** 