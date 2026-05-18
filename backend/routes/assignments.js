const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const { createNotification, notifyAdminsAndDistrictOfficers, sendSMS } = require('../utils/faultHelpers');

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
  const { fault_report_id, technician_id, priority, status } = req.body || {};

  if (!fault_report_id || !technician_id) {
    return res.status(400).json({ error: 'fault_report_id and technician_id are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO assignments (fault_report_id, technician_id, priority, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [fault_report_id, technician_id, priority || 'medium', status || 'assigned']
    );
    const assignment = result.rows[0];

    const technicianResult = await pool.query('SELECT id, username, contact_number FROM users WHERE id = $1 AND role = $2', [technician_id, 'technician']);
    if (technicianResult.rows.length) {
      const technician = technicianResult.rows[0];
      await createNotification(
        technician_id,
        `New assignment #${assignment.id} has been created for fault report #${fault_report_id}.`,
        'assignment_created'
      );
      
      // Send SMS to technician
      if (technician.contact_number) {
        await sendSMS(
          technician.contact_number,
          `MajiFix: You have been assigned task #${assignment.id}. Fault report #${fault_report_id} needs your attention. Please check the app for details.`
        );
      }
    }

    const faultInfo = await pool.query(
      `SELECT wp.district, wp.name AS water_point_name
       FROM fault_reports fr
       JOIN water_points wp ON fr.water_point_id = wp.id
       WHERE fr.id = $1`,
      [fault_report_id]
    );
    if (faultInfo.rows.length) {
      const { district, water_point_name } = faultInfo.rows[0];
      await notifyAdminsAndDistrictOfficers(
        district,
        `Assignment #${assignment.id} created for ${water_point_name}.`,
        'assignment_created'
      );
    }

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update assignment status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }
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