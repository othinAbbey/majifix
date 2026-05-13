const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware for all routes
router.use(authenticateToken);

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, fr.issue_type, fr.description, wp.name as water_point_name, u.username as technician_name
      FROM assignments a
      JOIN fault_reports fr ON a.fault_report_id = fr.id
      JOIN water_points wp ON fr.water_point_id = wp.id
      JOIN users u ON a.technician_id = u.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignment by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT a.*, fr.issue_type, fr.description, wp.name as water_point_name, u.username as technician_name
      FROM assignments a
      JOIN fault_reports fr ON a.fault_report_id = fr.id
      JOIN water_points wp ON fr.water_point_id = wp.id
      JOIN users u ON a.technician_id = u.id
      WHERE a.id = $1
    `, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create assignment
router.post('/', async (req, res) => {
  const { fault_report_id, technician_id, priority } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO assignments (fault_report_id, technician_id, priority) VALUES ($1, $2, $3) RETURNING *',
      [fault_report_id, technician_id, priority || 'medium']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update assignment status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE assignments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete assignment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM assignments WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;