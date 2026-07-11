
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generic email function
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: '"DevNexus" <abcshalini1245@gmail.com>',
    to,
    subject,
    html,
  });

  console.log(`Email sent to ${to}`);
};

// OTP email
const sendOTP = async (email, otp) => {
  const html = `
      <h2>DevNexus Password Reset</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Password Reset OTP",
    html,
  });
};

module.exports = {
  sendEmail,
  sendOTP,
};