const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,  
  },
});

async function sendOtp(email, otp) {
  const mailOptions = {
    from: `"Ecommerce App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "OTP Verification",
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOtp;
