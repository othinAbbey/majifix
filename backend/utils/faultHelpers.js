const pool = require('../db');
const AfricasTalking = require('africastalking');

const AT_USERNAME = process.env.AT_USERNAME || 'sandbox';
const AT_API_KEY = process.env.AT_API_KEY;

const atClient = AT_API_KEY ? AfricasTalking({ username: AT_USERNAME, apiKey: AT_API_KEY }) : null;
const smsService = atClient ? atClient.SMS : null;

const normalizePhoneNumber = (phoneNumber) => {
  return String(phoneNumber || '').replace(/\D/g, '');
};

const createNotification = async (userId, message, type) => {
  if (!userId) return;
  await pool.query(
    'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
    [userId, message, type]
  );
};

const notifyAdminsAndDistrictOfficers = async (district, message, type) => {
  await pool.query(
    `INSERT INTO notifications (user_id, message, type)
     SELECT id, $1, $2 FROM users
     WHERE role = 'admin' OR (role = 'district_officer' AND district = $3)`,
    [message, type, district]
  );
};

const sendSMS = async (phoneNumber, message) => {
  if (!smsService || !phoneNumber) {
    console.log(`[SMS] Would send to ${phoneNumber}: ${message}`);
    return;
  }
  try {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      console.log('Invalid phone number for SMS');
      return;
    }
    const result = await smsService.send({
      to: [normalizedPhone],
      message: message,
    });
    console.log('SMS sent:', result);
  } catch (err) {
    console.error('SMS send error:', err.message || err);
  }
};

const sendSMSToAdmins = async (message) => {
  const result = await pool.query(
    `SELECT contact_number FROM users WHERE role = 'admin' AND contact_number IS NOT NULL`
  );
  for (const admin of result.rows) {
    await sendSMS(admin.contact_number, message);
  }
};

const findWaterPointById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, district, parish, village, water_point_number, status FROM water_points WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const createWaterPoint = async ({
  name,
  district,
  parish,
  village,
  waterPointNumber,
  latitude = null,
  longitude = null,
  installDate = null,
  waterSourceType = null,
  status = 'working',
  managingOrg = null,
  createdViaUssd = false,
}) => {
  const pointName = name || `WP ${waterPointNumber}`;
  const result = await pool.query(
    `INSERT INTO water_points
     (name, district, parish, village, water_point_number, latitude, longitude, install_date, water_source_type, status, managing_org, created_via_ussd)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [pointName, district, parish, village, waterPointNumber, latitude, longitude, installDate, waterSourceType, status, managingOrg, createdViaUssd]
  );
  return result.rows[0];
};

const findTechniciansByLocation = async (district, village) => {
  const result = await pool.query(
    `SELECT id, username, contact_number, district, village
     FROM users
     WHERE role = 'technician'
       AND (district = $1 OR village = $2)
     ORDER BY village = $2 DESC, district = $1 DESC, username`,
    [district, village]
  );
  return result.rows;
};

const findTechnicianByPhoneNumber = async (phoneNumber) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const result = await pool.query(
    `SELECT * FROM users
     WHERE role = 'technician'
       AND translate(contact_number, '+-() ', '') = $1
     LIMIT 1`,
    [normalizedPhone]
  );
  return result.rows[0];
};

const createFaultReport = async (
  waterPointId,
  issueType,
  description,
  reportedBy = null,
  requestedFunds = false,
  requestedFundsAmount = null,
  requestedFundsReason = null,
  imageUrl = null
) => {
  const result = await pool.query(
    `INSERT INTO fault_reports 
     (water_point_id, issue_type, description, reported_by, requested_funds, requested_funds_amount, requested_funds_reason, image_url) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
     RETURNING *`,
    [
      waterPointId,
      issueType,
      description,
      reportedBy,
      requestedFunds,
      requestedFundsAmount,
      requestedFundsReason,
      imageUrl,
    ]
  );
  return result.rows[0];
};

const assignTechnicianToFault = async (faultReportId, waterPoint) => {
  if (!waterPoint) return null;
  const technicians = await findTechniciansByLocation(waterPoint.district, waterPoint.village);
  if (!technicians.length) return null;
  const technician = technicians[0];

  const result = await pool.query(
    `INSERT INTO assignments (fault_report_id, technician_id, status)
     VALUES ($1, $2, 'assigned')
     RETURNING *`,
    [faultReportId, technician.id]
  );

  const assignment = result.rows[0];
  assignment.technician = technician;
  await createNotification(
    technician.id,
    `New assignment #${assignment.id} created for fault report #${faultReportId}.`,
    'assignment_created'
  );
  await notifyAdminsAndDistrictOfficers(
    waterPoint.district,
    `New fault report #${faultReportId} has been assigned to ${technician.username}.`,
    'fault_assignment'
  );

  return assignment;
};

const updateWaterPointStatus = async (waterPointId, status = 'broken') => {
  await pool.query('UPDATE water_points SET status = $1 WHERE id = $2', [status, waterPointId]);
};

const createRepairLog = async ({
  assignmentId,
  technicianId,
  transportCost = null,
  materialsCost = null,
  problemFound,
  remedy,
  additionalNotes,
}) => {
  const totalCost = [transportCost || 0, materialsCost || 0].reduce((sum, value) => sum + parseFloat(value || 0), 0);
  const status = ['new_part_bought', 'old_part_repaired'].includes(remedy)
    ? 'completed'
    : 'in_progress';

  const result = await pool.query(
    `INSERT INTO repairs
     (assignment_id, repair_date, transport_cost, materials_cost, cost, problem_found, remedy, additional_notes, technician_id, repair_status)
     VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [assignmentId, transportCost, materialsCost, totalCost, problemFound, remedy, additionalNotes, technicianId, status]
  );

  await pool.query('UPDATE assignments SET status = $1 WHERE id = $2', [status, assignmentId]);

  return result.rows[0];
};

module.exports = {
  normalizePhoneNumber,
  createNotification,
  notifyAdminsAndDistrictOfficers,
  sendSMS,
  sendSMSToAdmins,
  findWaterPointById,
  createWaterPoint,
  findTechniciansByLocation,
  findTechnicianByPhoneNumber,
  createFaultReport,
  assignTechnicianToFault,
  updateWaterPointStatus,
  createRepairLog,
};
