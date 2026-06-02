const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Use authentication middleware for all routes
router.use(authenticateToken);

// Get all water points
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        district,
        parish,
        village,
        water_point_number,
        latitude,
        longitude,
        status,
        created_at
      FROM water_points
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (err) {
    console.error("Error fetching water points:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch water points"
    });
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
  const {
    name,
    district,
    parish,
    village,
    water_point_number,
    latitude,
    longitude,
    install_date,
    water_source_type,
    status,
    managing_org,
    created_via_ussd,
  } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO water_points (name, district, parish, village, water_point_number, latitude, longitude, install_date, water_source_type, status, managing_org, created_via_ussd) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [name, district, parish, village, water_point_number, latitude, longitude, install_date, water_source_type, status, managing_org, created_via_ussd || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update water point
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    district,
    parish,
    village,
    water_point_number,
    latitude,
    longitude,
    install_date,
    water_source_type,
    status,
    managing_org,
    created_via_ussd,
  } = req.body;
  try {
    const result = await pool.query(
      'UPDATE water_points SET name = $1, district = $2, parish = $3, village = $4, water_point_number = $5, latitude = $6, longitude = $7, install_date = $8, water_source_type = $9, status = $10, managing_org = $11, created_via_ussd = $12 WHERE id = $13 RETURNING *',
      [name, district, parish, village, water_point_number, latitude, longitude, install_date, water_source_type, status, managing_org, created_via_ussd || false, id]
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