const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const { createRepairLog, notifyAdminsAndDistrictOfficers } = require('../utils/faultHelpers');

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
  const {
    assignment_id,
    transport_cost,
    materials_cost,
    problem_found,
    remedy,
    additional_notes,
  } = req.body;
  const technician_id = req.user.id; // From token
  try {
    const repair = await createRepairLog({
      assignmentId: assignment_id,
      technicianId: technician_id,
      transportCost: transport_cost,
      materialsCost: materials_cost,
      problemFound: problem_found,
      remedy,
      additionalNotes: additional_notes,
    });

    const repairInfo = await pool.query(
      `SELECT wp.district, wp.name AS water_point_name
       FROM assignments a
       JOIN fault_reports fr ON a.fault_report_id = fr.id
       JOIN water_points wp ON fr.water_point_id = wp.id
       WHERE a.id = $1`,
      [assignment_id]
    );

    if (repairInfo.rows.length) {
      const { district, water_point_name } = repairInfo.rows[0];
      await notifyAdminsAndDistrictOfficers(
        district,
        `Repair log submitted for assignment #${assignment_id} at ${water_point_name}. Status: ${repair.repair_status}.`,
        'repair_progress'
      );
    }

    res.status(201).json(repair);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update repair
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { notes, cost, transport_cost, materials_cost, problem_found, remedy, additional_notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE repairs
       SET notes = $1,
           cost = $2,
           transport_cost = $3,
           materials_cost = $4,
           problem_found = $5,
           remedy = $6,
           additional_notes = $7
       WHERE id = $8
       RETURNING *`,
      [notes, cost, transport_cost, materials_cost, problem_found, remedy, additional_notes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Repair not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;