#!/bin/bash

echo "🚀 TaskFlow Deployment Setup Script"
echo "=================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Create .env.example files
echo "📝 Creating environment variable examples..."

# Backend .env.example
cat > backend/.env.example << EOF
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Server Configuration
NODE_ENV=production
PORT=10000

# Frontend URL (update after deployment)
FRONTEND_URL=https://taskflow-frontend.onrender.com
EOF

# Frontend .env.example
cat > frontend/.env.example << EOF
# API Configuration
VITE_API_URL=https://taskflow-backend.onrender.com/api
EOF

echo "✅ Environment variable examples created!"

# Check if .gitignore includes .env files
if ! grep -q ".env" .gitignore; then
    echo "📝 Adding .env files to .gitignore..."
    echo "" >> .gitignore
    echo "# Environment variables" >> .gitignore
    echo ".env" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env.production" >> .gitignore
fi

echo "✅ .gitignore updated!"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

echo "✅ Dependencies installed!"

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Set up MongoDB Atlas:"
echo "   - Go to https://www.mongodb.com/atlas"
echo "   - Create a free account and cluster"
echo "   - Get your connection string"
echo ""
echo "2. Deploy to Render:"
echo "   - Go to https://render.com"
echo "   - Sign up with GitHub"
echo "   - Follow the deployment guide in DEPLOYMENT.md"
echo ""
echo "3. Environment Variables:"
echo "   - Copy backend/.env.example to backend/.env"
echo "   - Update with your MongoDB connection string"
echo "   - Add JWT secret"
echo ""
echo "📖 Read DEPLOYMENT.md for detailed instructions!"
echo "" 