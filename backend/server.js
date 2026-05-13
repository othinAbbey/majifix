require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 5000;

// Routes
const authRoutes = require('./routes/auth');
const waterPointsRoutes = require('./routes/waterPoints');
const faultReportsRoutes = require('./routes/faultReports');
const assignmentsRoutes = require('./routes/assignments');
const repairsRoutes = require('./routes/repairs');
const analyticsRoutes = require('./routes/analytics');
const notificationsRoutes = require('./routes/notifications');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/water-points', waterPointsRoutes);
app.use('/api/fault-reports', faultReportsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/repairs', repairsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('MajiFix API');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port https://localhost:${port}`);
});