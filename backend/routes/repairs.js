const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware for all routes
router.use(authenticateToken);

// Get all repairs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, a.fault_report_id, wp.name as water_point_name, u.username as technician_name
      FROM repairs r
      JOIN assignments a ON r.assignment_id = a.id
      JOIN fault_reports fr ON a.fault_report_id = fr.id
      JOIN water_points wp ON fr.water_point_id = wp.id
      JOIN users u ON r.technician_id = u.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create repair
router.post('/', async (req, res) => {
  const { assignment_id, notes, cost } = req.body;
  const technician_id = req.user.id; // From token
  try {
    const result = await pool.query(
      'INSERT INTO repairs (assignment_id, notes, cost, technician_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [assignment_id, notes, cost, technician_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update repair
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { notes, cost } = req.body;
  try {
    const result = await pool.query(
      'UPDATE repairs SET notes = $1, cost = $2 WHERE id = $3 RETURNING *',
      [notes, cost, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Repair not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;