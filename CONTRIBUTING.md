# Contributing to TaskFlow

## Environment Setup

### Backend Setup
1. Copy `backend/env.example` to `backend/.env`
2. Update the following variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A random string for JWT signing
   - `JWT_REFRESH_SECRET`: A random string for refresh tokens

### Frontend Setup
1. Create `.env.local` in the root directory
2. Add: `VITE_API_URL=http://localhost:5000/api`

### Never Commit .env Files
- `.env` files contain sensitive information
- They are already in `.gitignore`
- Use `env.example` files as templates

## Development
1. Install dependencies: `npm install` (both root and backend)
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `npm run dev`
4. Access at: http://localhost:3000 