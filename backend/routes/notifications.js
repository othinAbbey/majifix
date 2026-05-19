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
const { sendSMS } = require('../utils/faultHelpers');

const router = express.Router();

// ==========================
// AUTH
// ==========================
router.use(authenticateToken);

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
    console.log('❌ GET NOTIFICATIONS ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// CREATE NOTIFICATION
// ==========================
router.post('/', async (req, res) => {
  console.log('📩 NOTIFICATION REQUEST:', req.body);

  const {
    user_id,
    message,
    type,
    technician_id,
    fault_report_id,
  } = req.body;

  try {
    // ==========================
    // SAVE NOTIFICATION
    // ==========================
    const notificationResult = await pool.query(
      `INSERT INTO notifications (user_id, message, type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, message, type]
    );

    const notification = notificationResult.rows[0];

    // ==========================
    // TASK ASSIGNMENT SMS FLOW
    // ==========================
    if (type === 'task_assignment') {
      console.log('🚀 TASK ASSIGNMENT TRIGGERED');

      if (!technician_id) {
        return res.status(400).json({ error: 'technician_id required' });
      }

      // GET TECHNICIAN
      const techResult = await pool.query(
        `SELECT id, username, contact_number
         FROM users
         WHERE id = $1 AND role = 'technician'`,
        [technician_id]
      );

      if (techResult.rows.length === 0) {
        return res.status(404).json({ error: 'Technician not found' });
      }

      const technician = techResult.rows[0];

      console.log('👤 TECH:', technician);

      // ==========================
      // IMPORTANT: DO NOT FORMAT HERE
      // ==========================
      const rawPhone = technician.contact_number;

      console.log('📲 RAW PHONE FROM DB:', rawPhone);

      const smsMessage = `
🔧 MajiFix Alert

New Task Assigned:
${message}

Fault ID: ${fault_report_id || 'N/A'}
      `;

      try {
        console.log('📤 SENDING SMS...');

        const result = await sendSMS(rawPhone, smsMessage);

        console.log('📡 SMS RESULT:', result);

      } catch (smsErr) {
        console.log('❌ SMS FAILED:', smsErr.message);
      }
    }

    // ==========================
    // FAULT REPORT SMS FLOW (ADMINS)
    // ==========================
    if (type === 'fault_report') {
      console.log('🚨 FAULT REPORT TRIGGERED');

      const admins = await pool.query(
        `SELECT contact_number FROM users WHERE role = 'admin'`
      );

      const smsMessage = `
🚨 New Fault Report

${message}

Fault ID: ${fault_report_id || 'N/A'}
      `;

      for (const admin of admins.rows) {
        try {
          console.log('📤 ADMIN SMS TO:', admin.contact_number);

          await sendSMS(admin.contact_number, smsMessage);

        } catch (err) {
          console.log('❌ ADMIN SMS FAILED:', err.message);
        }
      }
    }

    // ==========================
    // RESPONSE
    // ==========================
    res.status(201).json({
      success: true,
      notification,
    });

  } catch (err) {
    console.log('❌ SYSTEM ERROR:', err.message);
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
    console.log('❌ MARK READ ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;