const { otpMap } = require("./Otpstore");

function verifyOtp(email, otp) {
  const storedOtp = otpMap.get(email);
  if (storedOtp === otp) {
    otpMap.delete(email); 
    return true;
  }
  return false;
}

module.exports = verifyOtp;
