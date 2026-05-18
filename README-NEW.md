# 🚰 MajiFix MVP - Rural Water System Management Platform

A comprehensive full-stack web application designed to solve the critical problem of broken rural water systems not being reported and repaired efficiently.

## 📋 Problem Statement

In rural areas, water point failures go unreported for extended periods, leading to:
- Lack of clean water access
- Health emergencies
- Loss of productive time
- Delayed repairs due to poor communication

**MajiFix** streamlines the entire process: from reporting faults to assigning technicians and tracking repairs.

---

## ✨ Key Features

### 1. **User Authentication & Role Management**
- Secure login/register with JWT tokens
- Role-based access control (Admin, District Officer, Technician, NGO Staff)
- Password security with bcrypt hashing

### 2. **Water Point Registry**
- Central database of all water infrastructure
- GPS location tracking
- Real-time status updates
- Multiple water source types support

### 3. **Fault Reporting System**
- Community and field officer reporting
- 6 issue types (no water, low pressure, broken pump, leakage, contamination, vandalism)
- Optional image uploads
- Auto-timestamping

### 4. **Technician Assignment System**
- Admin assigns repair tasks
- Priority-based queue (low, medium, high)
- Task status tracking (pending, assigned, in progress, completed, escalated)
- Technician performance metrics

### 5. **Repair Tracking & Maintenance Logs**
- Completion records with timestamps
- Maintenance notes and cost tracking
- Technician activity logs
- Repair history

### 6. **Analytics Dashboard**
- Real-time statistics
- Working vs broken systems count
- Open fault reports
- Repair completion rates
- Technician performance data

### 7. **Notifications System**
- Technician assignment alerts
- Status update notifications
- Maintenance reminders
- In-app notification center

### 8. **Search & Filtering**
- Search water points by name or location
- Filter by district, status, issue type, or technician

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 12+
- Git

### Installation

1. **Clone & Setup**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../majifix-frontend/majifix-frontend
npm install
```

2. **Database Setup**
```bash
# Create database
createdb majifix

# Load schema
psql majifix < backend/database.sql

# (Optional) Load test data
psql majifix < backend/seeds.sql
```

3. **Environment Configuration**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

4. **Start Development Servers**
```bash
# Terminal 1: Backend (port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (port 3000)
cd majifix-frontend/majifix-frontend
npm start
```

5. **Access the App**
- Frontend: http://localhost:3000
- Backend API: https://majifix.onrender.com/api

---

## 🐳 Docker Setup (Alternative)

```bash
# Build and run with Docker Compose
docker-compose up

# Access
# Frontend: http://localhost:3000
# Backend: https://majifix.onrender.com
```

---

## 📚 Documentation

- **[Development Guide](./DEVELOPMENT.md)** - Setup, troubleshooting, deployment
- **[API Reference](./API.md)** - Complete endpoint documentation
- **[Database Schema](./backend/database.sql)** - Table structure and relationships

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcryptjs
- **ORM**: Raw SQL queries (pg library)
- **Security**: Helmet, CORS

### Frontend
- **Framework**: React 18
- **UI Library**: React Bootstrap
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **State**: React Hooks

---

## 📁 Project Structure

```
MajiFix/
├── backend/
│   ├── routes/              # API endpoints
│   ├── middleware/          # Authentication, validation
│   ├── database.sql         # Schema
│   ├── seeds.sql            # Test data
│   ├── server.js            # Express app
│   ├── db.js                # Database connection
│   └── .env.example         # Environment template
├── majifix-frontend/
│   └── majifix-frontend/
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── App.js       # Main app
│       │   └── index.js     # Entry point
│       └── package.json
├── docker-compose.yml       # Docker configuration
├── DEVELOPMENT.md           # Setup & deployment guide
├── API.md                   # API documentation
└── README.md                # This file
```

---

## 🔐 Default Test User

After running seeds.sql:
- **Username**: `admin`
- **Password**: `password123`
- **Role**: Admin

Additional test users: district_officer, tech1, tech2, ngo_staff (same password)

---

## 📊 MVP Success Criteria

The MVP successfully:
- ✅ Registers and manages water points
- ✅ Accepts and tracks fault reports
- ✅ Assigns technicians to repairs
- ✅ Logs repair completion
- ✅ Reduces response time to faults
- ✅ Generates real-time analytics

---

## 🚀 Deployment

### Quick Deploy Checklist

```bash
# 1. Set production environment variables
# 2. Build frontend
npm run build

# 3. Deploy backend (Railway, Heroku, etc)
# 4. Deploy frontend (Vercel, Netlify, etc)
# 5. Set up production database (Supabase, AWS RDS)
# 6. Configure CORS and SSL
# 7. Enable monitoring and logging
# 8. Set up backups
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed deployment instructions.

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/water-points` | List all water points |
| POST | `/water-points` | Create water point |
| GET | `/fault-reports` | List fault reports |
| POST | `/fault-reports` | Report new fault |
| GET | `/assignments` | List assignments |
| POST | `/assignments` | Create assignment |
| GET | `/repairs` | List repairs |
| POST | `/repairs` | Log repair |
| GET | `/analytics` | Get statistics |
| GET | `/notifications` | Get notifications |

See [API.md](./API.md) for complete documentation.

---

## 🐛 Troubleshooting

### Connection Refused
```bash
# Ensure PostgreSQL is running
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Port Already in Use
```bash
# Change port in .env or find and kill process
lsof -i :5000
kill -9 <PID>
```

### CORS Errors
Ensure backend CORS includes your frontend URL in `.env`:
```
FRONTEND_URL=http://localhost:3000
```

---

## 📞 Support & Contributing

- **Issues**: Check [Troubleshooting](./DEVELOPMENT.md#troubleshooting)
- **Questions**: Review [API Docs](./API.md) or [Dev Guide](./DEVELOPMENT.md)
- **Contributing**: Fork, create branch, submit pull request

---

## 📈 Future Enhancements

- SMS/WhatsApp notifications
- Mobile app (React Native)
- Advanced GIS mapping
- AI-powered fault prediction
- Offline sync capability
- Machine learning analytics
- IoT sensor integration
- Multi-language support

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

Built to address the water crisis in rural communities. Special thanks to UNICEF, Red Cross, and local water organizations for inspiration and requirements gathering.

---

**Made with ❤️ for clean water access** 🚰✨