const express = require('express');
const router = express.Router();
const africastalking = require('africastalking');
const app = express();
// ==========================
// AFRICAS TALKING SETUP
// ==========================
const AT = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = AT.SMS;
app.use(express.json());
// ==========================
// MIDDLEWARE (optional if you use auth)
// ==========================
// router.use(authenticateToken);

// ==========================
// FORMAT PHONE NUMBER
// ==========================
const formatPhoneNumber = (number) => {
  if (!number) return null;

  number = number.toString().trim();

  if (number.startsWith('0')) {
    return '+256' + number.substring(1);
  }

  if (number.startsWith('256')) {
    return '+' + number;
  }

  if (number.startsWith('+256')) {
    return number;
  }

  return null;
};

// ==========================
// SEND SMS CORE FUNCTION
// ==========================
const sendSMS = async (to, message) => {
  try {
    if (!to) {
      console.log("❌ No recipient");
      return;
    }

    const recipient = Array.isArray(to) ? to.join(',') : to;

    console.log("Sending SMS to:", recipient);
    console.log("Message:", message);

    const response = await sms.send({
      to: recipient,
      message,
    });

    console.log("✅ SMS SENT:", response);

    return response;
  } catch (error) {
    console.log("❌ SMS ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// ==========================
// TEST SMS ENDPOINT
// ==========================
router.post('/test', async (req, res) => {
  try {
    const { phone, message } = req.body;

    console.log("TEST SMS TRIGGERED");
    console.log("Phone:", phone);
    console.log("Message:", message);

    const formattedPhone = formatPhoneNumber(phone);

    console.log("Formatted Phone Number:", formattedPhone);

    await sendSMS(formattedPhone, message || "Test SMS from MajiFix");

    res.json({
      success: true,
      message: "SMS sent successfully"
    });

  } catch (err) {
    console.log("TEST SMS FAILED:", err.message);

    res.status(500).json({
      error: err.message
    });
  }
});

// ==========================
// DIRECT EXPORT FOR OTHER FILES
// ==========================
module.exports = {
  router,
  sendSMS,
};