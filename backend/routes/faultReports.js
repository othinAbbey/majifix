const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware for all routes
router.use(authenticateToken);

// Get all fault reports
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fault_reports');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get fault report by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM fault_reports WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Fault report not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create fault report
router.post('/', async (req, res) => {
  const { water_point_id, issue_type, description, image_url } = req.body;
  const reported_by = req.user.id; // From token
  try {
    const result = await pool.query(
      'INSERT INTO fault_reports (water_point_id, issue_type, description, image_url, reported_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [water_point_id, issue_type, description, image_url, reported_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update fault report
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { water_point_id, issue_type, description, image_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE fault_reports SET water_point_id = $1, issue_type = $2, description = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [water_point_id, issue_type, description, image_url, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Fault report not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete fault report
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM fault_reports WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Fault report not found' });
    res.json({ message: 'Fault report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;