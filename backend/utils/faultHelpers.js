const pool = require('../db');
const AfricasTalking = require('africastalking');

// ==========================
// AFRICA'S TALKING SETUP
// ==========================
const AT_USERNAME = process.env.AT_USERNAME || 'sandbox';
const AT_API_KEY = process.env.AT_API_KEY;

// if (!AT_API_KEY) {
//   console.log('⚠️ WARNING: AT_API_KEY missing');
// }

const at = AfricasTalking({
  username: AT_USERNAME,
  apiKey: AT_API_KEY,
});

const smsService = at.SMS;

// ==========================
// PHONE FORMATTER (E.164 SAFE)
// ==========================
const formatPhoneNumber = (phone) => {
  if (!phone) return null;

  let num = String(phone).trim();

  // remove spaces, brackets, dashes
  num = num.replace(/[\s()-]/g, '');

  // convert 07XXXXXXXX → +2567XXXXXXXX
  if (num.startsWith('0')) {
    num = '+256' + num.substring(1);
  }

  // convert 256XXXXXXXX → +256XXXXXXXX
  else if (num.startsWith('256')) {
    num = '+' + num;
  }

  // already correct
  else if (num.startsWith('+')) {
    num = num;
  } else {
    return null;
  }

  // strict Uganda validation
  if (!/^\+256\d{9}$/.test(num)) {
    console.log('❌ INVALID UG NUMBER:', num);
    return null;
  }

  return num;
};

// ==========================
// SMS SENDER (FULLY FIXED)
// ==========================
const sendSMS = async (phoneNumber, message) => {
  console.log('\n🚀 SMS START');

  try {
    if (!smsService) {
      console.log('❌ SMS SERVICE NOT INITIALIZED');
      return null;
    }

    if (!phoneNumber) {
      console.log('❌ NO PHONE NUMBER PROVIDED');
      return null;
    }

    let recipients = [];

    if (Array.isArray(phoneNumber)) {
      recipients = phoneNumber
        .map(formatPhoneNumber)
        .filter(n => n);
    } else {
      const single = formatPhoneNumber(phoneNumber);
      if (single) recipients.push(single);
    }

    console.log('📲 CLEAN RECIPIENTS:', recipients);
    console.log('📝 MESSAGE:', message);

    if (recipients.length === 0) {
      console.log('❌ NO VALID NUMBERS AFTER CLEANING');
      return null;
    }

    const response = await smsService.send({
      to: recipients,
      message: String(message).trim(),
    });

    console.log('✅ SMS SENT SUCCESSFULLY');
    console.log('📡 RESPONSE:', response);

    return response;

  } catch (err) {
    console.log('❌ SMS ERROR');
    console.log(err.message);
    return null;
  }
};

// ==========================
// NOTIFICATIONS
// ==========================
const createNotification = async (userId, message, type) => {
  if (!userId) return;

  try {
    await pool.query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)',
      [userId, message, type]
    );
  } catch (err) {
    console.log('❌ NOTIFICATION ERROR:', err.message);
  }
};

const notifyAdminsAndDistrictOfficers = async (district, message, type) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, message, type)
       SELECT id, $1, $2
       FROM users
       WHERE role = 'admin'
          OR (role = 'district_officer' AND district = $3)`,
      [message, type, district]
    );
  } catch (err) {
    console.log('❌ ADMIN NOTIFY ERROR:', err.message);
  }
};

// ==========================
// SEND TO ADMINS
// ==========================
const sendSMSToAdmins = async (message) => {
  try {
    const result = await pool.query(
      `SELECT contact_number FROM users 
       WHERE role = 'admin' AND contact_number IS NOT NULL`
    );

    for (const admin of result.rows) {
      await sendSMS(admin.contact_number, message);
    }
  } catch (err) {
    console.log('❌ ADMIN SMS ERROR:', err.message);
  }
};

// ==========================
// WATER POINT
// ==========================
const findWaterPointById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM water_points WHERE id = $1',
    [id]
  );

  return result.rows[0];
};

const createWaterPoint = async (data) => {
  const name = data.name || `WP ${data.waterPointNumber}`;

  const result = await pool.query(
    `INSERT INTO water_points
     (name, district, parish, village, water_point_number, latitude, longitude, install_date, water_source_type, status, managing_org, created_via_ussd)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      name,
      data.district,
      data.parish,
      data.village,
      data.waterPointNumber,
      data.latitude,
      data.longitude,
      data.installDate,
      data.waterSourceType,
      data.status || 'working',
      data.managingOrg,
      data.createdViaUssd || false,
    ]
  );

  return result.rows[0];
};

// ==========================
// TECHNICIANS
// ==========================
const findTechniciansByLocation = async (district, village) => {
  const result = await pool.query(
    `SELECT * FROM users
     WHERE role = 'technician'
       AND (district = $1 OR village = $2)`,
    [district, village]
  );

  return result.rows;
};

const findTechnicianByPhoneNumber = async (phoneNumber) => {
  const normalized = String(phoneNumber || '').replace(/[^\d]/g, '');

  const result = await pool.query(
    `SELECT * FROM users
     WHERE role = 'technician'
       AND translate(contact_number, '+-() ', '') = $1
     LIMIT 1`,
    [normalized]
  );

  return result.rows[0];
};

// ==========================
// FAULT REPORT
// ==========================
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
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
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
  console.log('✅ FAULT REPORT CREATED:', result.rows[0]);
};

// ==========================
// ASSIGN TECHNICIAN
// ==========================
const assignTechnicianToFault = async (faultReportId, waterPoint) => {
  if (!waterPoint) return null;

  const technicians = await findTechniciansByLocation(
    waterPoint.district,
    waterPoint.village
  );

  if (!technicians.length) {
    console.log('❌ NO TECHNICIANS FOUND');
    return null;
  }

  const tech = technicians[0];

  const result = await pool.query(
    `INSERT INTO assignments (fault_report_id, technician_id, status)
     VALUES ($1,$2,'assigned')
     RETURNING *`,
    [faultReportId, tech.id]
  );

  const assignment = result.rows[0];

  await createNotification(
    tech.id,
    `New assignment #${assignment.id}`,
    'assignment_created'
  );

  await notifyAdminsAndDistrictOfficers(
    waterPoint.district,
    `Fault #${faultReportId} assigned`,
    'fault_assignment'
  );

  return assignment;
};

// ==========================
// WATER POINT STATUS
// ==========================
const updateWaterPointStatus = async (id, status = 'broken') => {
  await pool.query(
    'UPDATE water_points SET status = $1 WHERE id = $2',
    [status, id]
  );
};

// ==========================
// REPAIR LOG
// ==========================
const createRepairLog = async (data) => {
  const total =
    (parseFloat(data.transportCost || 0) +
      parseFloat(data.materialsCost || 0));

  const status =
    ['new_part_bought', 'old_part_repaired'].includes(data.remedy)
      ? 'completed'
      : 'in_progress';

  const result = await pool.query(
    `INSERT INTO repairs
     (assignment_id, repair_date, transport_cost, materials_cost, cost, problem_found, remedy, additional_notes, technician_id, repair_status)
     VALUES ($1,NOW(),$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.assignmentId,
      data.transportCost,
      data.materialsCost,
      total,
      data.problemFound,
      data.remedy,
      data.additionalNotes,
      data.technicianId,
      status,
    ]
  );

  await pool.query(
    'UPDATE assignments SET status = $1 WHERE id = $2',
    [status, data.assignmentId]
  );

  return result.rows[0];
};

// ==========================
// EXPORTS
// ==========================
module.exports = {
  sendSMS,
  createNotification,
  notifyAdminsAndDistrictOfficers,
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