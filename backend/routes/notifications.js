const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware for all routes
router.use(authenticateToken);

// Get notifications for user
router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create notification
router.post('/', async (req, res) => {
  const { user_id, message, type } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3) RETURNING *',
      [user_id, message, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;