const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware for all routes
router.use(authenticateToken);

// Get analytics data
router.get('/', async (req, res) => {
  try {
    const waterPoints = await pool.query('SELECT COUNT(*) as total FROM water_points');
    const working = await pool.query("SELECT COUNT(*) as working FROM water_points WHERE status = 'working'");
    const broken = await pool.query("SELECT COUNT(*) as broken FROM water_points WHERE status = 'broken'");
    const faults = await pool.query('SELECT COUNT(*) as total FROM fault_reports');
    const assignments = await pool.query('SELECT COUNT(*) as total FROM assignments');
    const pending = await pool.query("SELECT COUNT(*) as pending FROM assignments WHERE status = 'pending'");
    const inProgress = await pool.query("SELECT COUNT(*) as in_progress FROM assignments WHERE status = 'in_progress'");
    const completed = await pool.query("SELECT COUNT(*) as completed FROM assignments WHERE status = 'completed'");

    res.json({
      waterPoints: parseInt(waterPoints.rows[0].total),
      working: parseInt(working.rows[0].working),
      broken: parseInt(broken.rows[0].broken),
      faults: parseInt(faults.rows[0].total),
      assignments: parseInt(assignments.rows[0].total),
      pending: parseInt(pending.rows[0].pending),
      in_progress: parseInt(inProgress.rows[0].in_progress),
      completed: parseInt(completed.rows[0].completed)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;