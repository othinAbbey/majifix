const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Use authentication middleware for all routes
router.use(authenticateToken);

// Get all water points
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM water_points');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get water point by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM water_points WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Water point not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create water point
router.post('/', async (req, res) => {
  const { name, district, village, latitude, longitude, install_date, water_source_type, status, managing_org } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO water_points (name, district, village, latitude, longitude, install_date, water_source_type, status, managing_org) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, district, village, latitude, longitude, install_date, water_source_type, status, managing_org]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update water point
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, district, village, latitude, longitude, install_date, water_source_type, status, managing_org } = req.body;
  try {
    const result = await pool.query(
      'UPDATE water_points SET name = $1, district = $2, village = $3, latitude = $4, longitude = $5, install_date = $6, water_source_type = $7, status = $8, managing_org = $9 WHERE id = $10 RETURNING *',
      [name, district, village, latitude, longitude, install_date, water_source_type, status, managing_org, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Water point not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete water point
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM water_points WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Water point not found' });
    res.json({ message: 'Water point deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;