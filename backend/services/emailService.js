const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or "outlook", "yahoo", etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your app password
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate verification token (for link-based verification)
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "CookMate - Email Verification OTP",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background-color: white; border: 2px dashed #16a34a; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp { font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍳 CookMate</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for signing up. Please verify your email address using the OTP below:</p>

            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Your verification code is:</p>
              <div class="otp">${otp}</div>
            </div>

            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 CookMate. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Email send error:", error);
    return false;
  }
};

// Send verification link email
const sendVerificationLinkEmail = async (email, token, name) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "CookMate - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍳 CookMate</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>

            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>

            <p style="color: #6b7280; font-size: 12px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 12px;">${verificationUrl}</p>

            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 CookMate. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Email send error:", error);
    return false;
  }
};

module.exports = {
  generateOTP,
  generateVerificationToken,
  sendOTPEmail,
  sendVerificationLinkEmail,
};