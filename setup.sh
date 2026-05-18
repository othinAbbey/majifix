#!/bin/bash

# MajiFix Development Environment Setup Script
# This script automates the setup of MajiFix MVP

set -e

echo "🚀 MajiFix MVP Setup Script"
echo "=============================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 12+"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ PostgreSQL $(psql --version)"
echo ""

# Create database
echo "🗄️  Setting up database..."
DB_NAME="majifix"
DB_EXISTS=$(psql -lqt | cut -d \| -f 1 | grep -w "$DB_NAME" | wc -l)

if [ "$DB_EXISTS" -eq 0 ]; then
    createdb "$DB_NAME"
    echo "✅ Database '$DB_NAME' created"
else
    echo "⚠️  Database '$DB_NAME' already exists"
fi

# Load schema
echo "📝 Loading database schema..."
psql "$DB_NAME" < backend/database.sql
echo "✅ Schema loaded"

# Load test data
read -p "Load test data (seeds.sql)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    psql "$DB_NAME" < backend/seeds.sql
    echo "✅ Test data loaded"
fi
echo ""

# Backend setup
echo "⚙️  Setting up backend..."
cd backend
cp .env.example .env
echo "📄 Created .env from .env.example"
echo "⚠️  Please edit backend/.env with your database credentials"
npm install
echo "✅ Backend dependencies installed"
cd ..
echo ""

# Frontend setup
echo "⚙️  Setting up frontend..."
cd majifix-frontend/majifix-frontend
npm install
echo "✅ Frontend dependencies installed"
cd ../..
echo ""

# Create .env for frontend if needed
if [ ! -f "majifix-frontend/majifix-frontend/.env" ]; then
    echo "REACT_APP_API_URL=https://majifix.onrender.com/api" > majifix-frontend/majifix-frontend/.env
    echo "✅ Frontend .env created"
fi
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "📚 Documentation:"
echo "   - Development Guide: ./DEVELOPMENT.md"
echo "   - API Reference: ./API.md"
echo "   - Project Checklist: ./PROJECT_CHECKLIST.md"
echo ""
echo "🚀 Next Steps:"
echo "   1. Edit backend/.env with your database credentials"
echo "   2. Start backend:  cd backend && npm run dev"
echo "   3. Start frontend: cd majifix-frontend/majifix-frontend && npm start"
echo "   4. Open http://localhost:3000 in your browser"
echo ""
echo "🔐 Test credentials (if using seeds):"
echo "   Username: admin"
echo "   Password: password123"
echo ""