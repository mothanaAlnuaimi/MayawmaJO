#!/bin/bash
# Forsati Quick Setup Script
# Run: chmod +x setup.sh && ./setup.sh

echo "🚀 Setting up Forsati - فرصتي"
echo "================================"

# Backend setup
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🗄️  Setting up database..."
npx prisma db push

echo "🌱 Seeding with sample data..."
node prisma/seed.js

echo ""
echo "✅ Backend ready!"
echo ""

# Frontend setup
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Frontend ready!"
echo ""
echo "================================"
echo "🎉 Setup complete!"
echo ""
echo "To start the app:"
echo "  Terminal 1 (backend): cd backend && npm run dev"
echo "  Terminal 2 (frontend): cd frontend && npm run dev"
echo ""
echo "🔑 Test accounts:"
echo "  Seeker:   omar@student.jo / seeker123"
echo "  Employer: events@jordanpro.jo / employer123"
echo "  Admin:    admin@forsati.jo / admin123"
echo ""
echo "Open http://localhost:5173 in your browser"
