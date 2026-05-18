// const express = require('express');
// const pool = require('../db');
// const authenticateToken = require('../middleware/auth');

// const router = express.Router();

// // Use authentication middleware for all routes
// router.use(authenticateToken);

// // Get notifications for user
// router.get('/', async (req, res) => {
//   const userId = req.user.id;
//   try {
//     const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Create notification
// router.post('/', async (req, res) => {
//   const { user_id, message, type } = req.body;
//   try {
//     const result = await pool.query(
//       'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3) RETURNING *',
//       [user_id, message, type]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Mark as read
// router.put('/:id/read', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
//     res.json({ message: 'Notification marked as read' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

// const express = require('express');
// const pool = require('../db');
// const authenticateToken = require('../middleware/auth');
// const africastalking = require('africastalking');

// const router = express.Router();

// // ==========================
// // Africa's Talking Setup
// // ==========================
// const AT = africastalking({
//   apiKey: process.env.AT_API_KEY,
//   username: process.env.AT_USERNAME,
// });

// const sms = AT.SMS;

// // ==========================
// // Middleware
// // ==========================
// router.use(authenticateToken);

// // ==========================
// // Format Phone Number
// // ==========================
// const formatPhoneNumber = (number) => {
//   if (!number) return null;

//   number = number.trim();

//   // Convert 077xxxxxxx -> +25677xxxxxxx
//   if (number.startsWith('0')) {
//     return '+256' + number.substring(1);
//   }

//   // Convert 2567xxxxxxx -> +2567xxxxxxx
//   if (number.startsWith('256')) {
//     return '+' + number;
//   }

//   return number;
// };

// // ==========================
// // Send SMS Helper
// // ==========================
// const sendSMS = async (to, message) => {
//   try {
//     await sms.send({
//       to,
//       message,
//       from: process.env.AT_SENDER_ID || undefined,
//     });

//     console.log(`SMS sent to ${to}`);
//   } catch (error) {
//     console.error('SMS Error:', error.message);
//   }
// };

// // ==========================
// // Get Notifications
// // ==========================
// router.get('/', async (req, res) => {
//   const userId = req.user.id;

//   try {
//     const result = await pool.query(
//       `SELECT *
//        FROM notifications
//        WHERE user_id = $1
//        ORDER BY created_at DESC`,
//       [userId]
//     );

//     res.json(result.rows);

//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//     });
//   }
// });

// // ==========================
// // Create Notification
// // ==========================
// router.post('/', async (req, res) => {
//   const {
//     user_id,
//     message,
//     type,
//     fault_report_id,
//     technician_id,
//   } = req.body;

//   try {

//     // ==========================
//     // Save Notification
//     // ==========================
//     const notificationResult = await pool.query(
//       `INSERT INTO notifications
//       (user_id, message, type)
//       VALUES ($1, $2, $3)
//       RETURNING *`,
//       [user_id, message, type]
//     );

//     const notification = notificationResult.rows[0];

//     // ==========================
//     // Fault Report Notification
//     // ==========================
//     if (type === 'fault_report') {

//       // Get admins
//       const adminResult = await pool.query(
//         `SELECT contact_number
//          FROM users
//          WHERE role = 'admin'`
//       );

//       const adminPhones = adminResult.rows
//         .map(admin => formatPhoneNumber(admin.contact_number))
//         .filter(Boolean);

//       // Get technicians
//       const technicianResult = await pool.query(
//         `SELECT contact_number
//          FROM users
//          WHERE role = 'technician'`
//       );

//       const technicianPhones = technicianResult.rows
//         .map(tech => formatPhoneNumber(tech.contact_number))
//         .filter(Boolean);

//       // SMS Message
//       const smsMessage = `
// New Water Fault Reported

// ${message}

// Fault Report ID: ${fault_report_id || 'N/A'}

// Please check the system for details.
// `;

//       // Send to admins
//       if (adminPhones.length > 0) {
//         await sendSMS(adminPhones, smsMessage);
//       }

//       // Send to technicians
//       if (technicianPhones.length > 0) {
//         await sendSMS(technicianPhones, smsMessage);
//       }
//     }

//     // ==========================
//     // Technician Assignment
//     // ==========================
//     if (type === 'task_assignment' && technician_id) {

//       // Get technician
//       const technicianResult = await pool.query(
//         `SELECT username, contact_number
//          FROM users
//          WHERE id = $1`,
//         [technician_id]
//       );

//       if (technicianResult.rows.length > 0) {

//         const technician = technicianResult.rows[0];

//         const technicianPhone = formatPhoneNumber(
//           technician.contact_number
//         );

//         // SMS to technician
//         if (technicianPhone) {
//           await sendSMS(
//             technicianPhone,
//             `
// New Task Assigned

// ${message}

// Fault Report ID: ${fault_report_id || 'N/A'}

// Please check the system for details.
// `
//           );
//         }

//         // Notify admins
//         const adminResult = await pool.query(
//           `SELECT contact_number
//            FROM users
//            WHERE role = 'admin'`
//         );

//         const adminPhones = adminResult.rows
//           .map(admin => formatPhoneNumber(admin.contact_number))
//           .filter(Boolean);

//         if (adminPhones.length > 0) {
//           await sendSMS(
//             adminPhones,
//             `Technician ${technician.username} has been assigned a new repair task.`
//           );
//         }
//       }
//     }

//     res.status(201).json(notification);

//   } catch (err) {
//     console.error(err);

//     res.status(500).json({
//       error: err.message,
//     });
//   }
// });

// // ==========================
// // Mark Notification As Read
// // ==========================
// router.put('/:id/read', async (req, res) => {
//   const { id } = req.params;

//   try {

//     await pool.query(
//       `UPDATE notifications
//        SET is_read = TRUE
//        WHERE id = $1`,
//       [id]
//     );

//     res.json({
//       message: 'Notification marked as read',
//     });

//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//     });
//   }
// });

// module.exports = router;
const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const twilio = require('twilio');

const router = express.Router();

// ==========================
// TWILIO SETUP
// ==========================
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ==========================
// MIDDLEWARE
// ==========================
router.use(authenticateToken);

// ==========================
// PHONE NORMALIZER (UG FIXED)
// ==========================
const formatPhoneNumber = (number) => {
  if (!number) return null;

  number = number.toString().trim();

  // Remove spaces
  number = number.replace(/\s/g, '');

  if (number.startsWith('0')) {
    return '+256' + number.substring(1);
  }

  if (number.startsWith('256')) {
    return '+' + number;
  }

  if (number.startsWith('+')) {
    return number;
  }

  return null;
};

// ==========================
// LOGGING HELPER
// ==========================
const log = (title, data) => {
  console.log(`\n========== ${title} ==========\n`, data, '\n============================\n');
};

// ==========================
// SEND SMS (NON-BLOCKING)
// ==========================
const sendSMS = async (to, message) => {
  try {
    if (!to) {
      console.log("❌ SMS skipped: no recipient");
      return;
    }

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    console.log("📲 SMS SENT SUCCESS:", response.sid);
    return response.sid;

  } catch (error) {
    console.error("❌ TWILIO FAILED:", error.message);
    return null;
  }
};

// ==========================
// GET NOTIFICATIONS
// ==========================
router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// CREATE NOTIFICATION (NEXT LEVEL)
// ==========================
router.post('/', async (req, res) => {

  log("INCOMING REQUEST", req.body);

  const {
    user_id,
    message,
    type,
    fault_report_id,
    technician_id,
  } = req.body;

  try {

    // ==========================
    // SAVE NOTIFICATION FIRST
    // ==========================
    const notificationResult = await pool.query(
      `INSERT INTO notifications (user_id, message, type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, message, type]
    );

    const notification = notificationResult.rows[0];

    // ==========================
    // TASK ASSIGNMENT FLOW
    // ==========================
    if (type === 'task_assignment') {

      log("TASK ASSIGNMENT TRIGGERED", { technician_id, fault_report_id });

      if (!technician_id) {
        return res.status(400).json({ error: 'technician_id required' });
      }

      // FETCH TECHNICIAN
      const techResult = await pool.query(
        `SELECT id, username, contact_number
         FROM users
         WHERE id = $1 AND role = 'technician'`,
        [technician_id]
      );

      if (techResult.rows.length === 0) {
        console.log("❌ Technician not found");
        return res.status(404).json({ error: 'Technician not found' });
      }

      const technician = techResult.rows[0];

      log("SELECTED TECHNICIAN", technician);

      const phone = formatPhoneNumber(technician.contact_number);

      log("FORMATTED PHONE", phone);

      if (!phone) {
        return res.status(400).json({ error: 'Invalid phone number' });
      }

      // ==========================
      // SMS CONTENT
      // ==========================
      const smsMessage = `
🔧 MajiFix Alert

New Task Assigned to you:
${message}

Fault ID: ${fault_report_id || 'N/A'}

Please open the system for details.
      `;

      // ==========================
      // SEND SMS (NON BLOCKING)
      // ==========================
      sendSMS(phone, smsMessage);

      // ==========================
      // OPTIONAL: ADMIN LOG
      // ==========================
      const adminResult = await pool.query(
        `SELECT username FROM users WHERE role = 'admin'`
      );

      log("ADMINS NOTIFIED IN SYSTEM (NO SMS REQUIRED)", adminResult.rows);
    }

    // ==========================
    // FAULT REPORT ALERT FLOW (BONUS UPGRADE)
    // ==========================
    if (type === 'fault_report') {

      const admins = await pool.query(
        `SELECT contact_number FROM users WHERE role = 'admin'`
      );

      const adminPhones = admins.rows
        .map(a => formatPhoneNumber(a.contact_number))
        .filter(Boolean);

      const smsMessage = `
🚨 New Fault Report

${message}

Fault ID: ${fault_report_id || 'N/A'}
      `;

      adminPhones.forEach(phone => {
        sendSMS(phone, smsMessage);
      });
    }

    // ==========================
    // RETURN RESPONSE FAST
    // ==========================
    res.status(201).json({
      success: true,
      notification
    });

  } catch (err) {
    console.error("❌ SYSTEM ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// MARK AS READ
// ==========================
router.put('/:id/read', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1`,
      [id]
    );

    res.json({ message: 'Notification marked as read' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;