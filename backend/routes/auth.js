const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const sendOtp = require("../utils/send-otp");
const verifyOtp = require("../utils/verify-otp");
const { otpMap } = require("../utils/Otpstore");
const User = require('../models/User'); 

router.post("/login", login);
router.post("/signup", signup);

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    otpMap.set(email, otp);

    await sendOtp(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err.message);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const isValid = verifyOtp(email, otp);
  if (isValid) {
    return res.status(200).json({ verified: true });
  }

  return res.status(400).json({ verified: false, message: "Invalid or expired OTP" });
});

module.exports = router;
