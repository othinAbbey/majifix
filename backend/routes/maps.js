const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🌍 MAP DATA ENDPOINT
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        district,
        village,
        latitude,
        longitude,
        status,
        water_source_type,
        created_at
      FROM water_points
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND latitude BETWEEN -90 AND 90
        AND longitude BETWEEN -180 AND 180
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to load map data"
    });
  }
});

module.exports = router;