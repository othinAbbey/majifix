# MajiFix MVP - Development Setup & Deployment Guide

## 📋 Table of Contents
- Quick Start
- Prerequisites
- Local Development Setup
- Testing the Application
- Deployment
- API Documentation
- Troubleshooting

---

## 🚀 Quick Start

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd majifix-frontend/majifix-frontend
npm install
npm start
```

---

## ✅ Prerequisites

### Required Software
- **Node.js** v18+ ([Download](https://nodejs.org))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download))
- **Git** ([Download](https://git-scm.com))
- **npm** v10+ (included with Node.js)

### Accounts (for Production)
- Twilio (SMS notifications)
- SendGrid (Email notifications)
- AWS S3 or similar (image storage)

---

## 🛠️ Local Development Setup

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb majifix

# Run schema
psql majifix < backend/database.sql

# Optional: Load test data
psql majifix < backend/seeds.sql
```

### 2. Backend Configuration

```bash
cd backend
cp .env.example .env
```

**Edit `.env` with your values:**
```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/majifix
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
```

**Install dependencies:**
```bash
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Configuration

```bash
cd majifix-frontend/majifix-frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

---

## 🧪 Testing the Application

### Create Test User
```bash
# Via SQL
psql majifix

INSERT INTO users (username, password_hash, email, role) 
VALUES ('admin', '$2a$10$...', 'admin@example.com', 'admin');
```

Or register via frontend:
1. Open http://localhost:3000
2. API call to `/api/auth/register` with test credentials
3. Login and start testing

### Test Data

Add water points, fault reports, and assignments via the dashboard:
- **Dashboard**: View all water points
- **Report Fault**: Create a new fault
- **Assignments**: Assign technicians
- **Repairs**: Log completed work
- **Analytics**: View statistics
- **Notifications**: Check alerts

---

## 📦 Deployment

### Deploying Frontend

**Option 1: Vercel (Recommended)**
```bash
npm install -g vercel
cd majifix-frontend/majifix-frontend
vercel
```

**Option 2: Netlify**
- Connect GitHub repo
- Build command: `npm run build`
- Publish directory: `build`

### Deploying Backend

**Option 1: Railway**
1. Connect GitHub repo
2. Set environment variables
3. Deploy

**Option 2: Heroku**
```bash
heroku login
heroku create majifix-api
git push heroku main
heroku config:set DATABASE_URL=postgresql://...
```

**Option 3: AWS/GCP/Azure**
- Use Docker: `docker build -t majifix .`
- Deploy to container service

### Database Hosting

**Supabase** (PostgreSQL SaaS)
1. Create account at supabase.io
2. Create new project
3. Run `database.sql` in SQL editor
4. Update `DATABASE_URL` in backend env

**AWS RDS**
1. Create RDS instance
2. Run `database.sql`
3. Update connection string

---

## 📚 API Documentation

### Base URL
- Local: `http://localhost:5000/api`
- Production: `https://your-api.com/api`

### Authentication
All endpoints except `/auth/*` require JWT token:
```
Authorization: Bearer <token>
```

### Endpoints

#### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user

#### Water Points
- `GET /water-points` - List all
- `GET /water-points/:id` - Get one
- `POST /water-points` - Create
- `PUT /water-points/:id` - Update
- `DELETE /water-points/:id` - Delete

#### Fault Reports
- `GET /fault-reports` - List all
- `GET /fault-reports/:id` - Get one
- `POST /fault-reports` - Create
- `PUT /fault-reports/:id` - Update
- `DELETE /fault-reports/:id` - Delete

#### Assignments
- `GET /assignments` - List all
- `POST /assignments` - Create
- `PUT /assignments/:id` - Update status

#### Repairs
- `GET /repairs` - List all
- `POST /repairs` - Log repair

#### Analytics
- `GET /analytics` - Get statistics

#### Notifications
- `GET /notifications` - List user notifications
- `PUT /notifications/:id/read` - Mark as read

---

## 🔧 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
services.msc → PostgreSQL → Start
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change port in `.env` or kill process
```bash
# Find process on port 5000
lsof -i :5000

# Kill it
kill -9 <PID>
```

### CORS Errors
**Problem**: "Access to XMLHttpRequest blocked by CORS policy"
**Solution**: Ensure backend CORS is configured
```javascript
// In server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
```

### JWT Token Expired
**Solution**: Login again to get new token
```javascript
// Frontend: Clear and redirect
localStorage.removeItem('token');
window.location.href = '/';
```

---

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/majifix
JWT_SECRET=super_secret_key_change_in_production
NODE_ENV=development

# Optional for SMS

## USSD Integration
This project now supports a generic USSD webhook endpoint at `POST /api/ussd`.

Example request body:
```json
{
  "sessionId": "12345",
  "phoneNumber": "+255123456789",
  "text": ""
}
```

Response payload returns `response` and `action` values for JSON-based USSD providers.

For Africa's Talking, use the dedicated endpoint `POST /api/ussd/at` and return plain-text USSD responses with `CON` / `END` prefixes.

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE=+1234567890

# Optional for Email
SENDGRID_API_KEY=your_sendgrid_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚢 Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Use environment-specific configs
- [ ] Set up database backups
- [ ] Configure CORS for production domain
- [ ] Add rate limiting
- [ ] Set up monitoring/logging
- [ ] Test all features
- [ ] Add SSL certificate
- [ ] Set up CI/CD pipeline
- [ ] Add error tracking (Sentry)

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API docs
3. Check console logs
4. Open an issue on GitHub

Happy building! 🎉