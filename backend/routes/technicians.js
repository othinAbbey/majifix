const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Role middleware
const authorizeRole = (allowedRoles) => (req, res, next) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};

// Protect all routes
router.use(authenticateToken);

// ==========================
// Get all technicians
// ==========================
router.get('/', authorizeRole(['admin', 'district_officer']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, contact_number, district, village, latitude, longitude, created_at
       FROM users
       WHERE role = 'technician'
       ORDER BY username`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// Get technician by ID
// ==========================
router.get('/:id', authorizeRole(['admin', 'district_officer']), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, username, contact_number, email, district, village, latitude, longitude, created_at
       FROM users
       WHERE role = 'technician' AND id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// Create technician
// ==========================
router.post('/', authorizeRole('admin'), async (req, res) => {
  const { username, password, contact_number, email, district, village, latitude, longitude } = req.body;

  if (!username || !password || !contact_number) {
    return res.status(400).json({ error: 'username, password, and contact_number are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, contact_number, email, role, district, village, latitude, longitude)
       VALUES ($1, $2, $3, $4, 'technician', $5, $6, $7, $8)
       RETURNING id, username, contact_number, email, district, village, latitude, longitude, created_at`,
      [username, hashedPassword, contact_number, email || null, district || null, village || null, latitude || null, longitude || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    res.status(500).json({ error: err.message });
  }
});

// ==========================
// Update technician
// ==========================
router.put('/:id', authorizeRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { contact_number, email, district, village, latitude, longitude } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET contact_number = COALESCE($1, contact_number),
           email = COALESCE($2, email),
           district = COALESCE($3, district),
           village = COALESCE($4, village),
           latitude = COALESCE($5, latitude),
           longitude = COALESCE($6, longitude)
       WHERE id = $7 AND role = 'technician'
       RETURNING id, username, contact_number, email, district, village, latitude, longitude, created_at`,
      [contact_number, email || null, district || null, village || null, latitude || null, longitude || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// Delete technician
// ==========================
router.delete('/:id', authorizeRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND role = \'technician\' RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json({ message: 'Technician deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;