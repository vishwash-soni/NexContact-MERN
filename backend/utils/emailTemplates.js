const otpEmail = (otp, minutes) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px">
    <h2>Welcome to NexContact!</h2>
    <p>Use the OTP below to verify your email:</p>
    <h1 style="letter-spacing:6px">${otp}</h1>
    <p>This OTP will expire in ${minutes} minutes. If you didn't request it, you can ignore this email.</p>
  </div>
`;

module.exports = { otpEmail };
