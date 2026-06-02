const express = require('express');
const router = express.Router();
const pool = require('../db');

// 📊 MAP SUMMARY STATS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'working') AS working,
        COUNT(*) FILTER (WHERE status = 'broken') AS broken,
        COUNT(*) FILTER (WHERE status = 'maintenance') AS maintenance,
        COUNT(*) AS total
      FROM water_points
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
    `);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;