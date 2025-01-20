/**
 * Forgot OTP Email Module
 * Handles sending forgot OTP emails to exists users using nodemailer.
 */

import { SendMailOptions } from 'nodemailer';
import transporter from '../utils/nodemailer';
import { User } from '../types/email.type';

/**
 * Sends a forgot password otp email to an existing user
 * @param user - Object containing user's name and email
 * @param otp - String containing forgot password otp
 * @returns Promise that resolves when email is sent
 * @throws Error if email sending fails
 */
export const sendForgotOtpEmail = async (user: User, otp: string) => {
  try {
    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Reset Your Password - Ryde',
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Ryde</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #ff5722;
            color: white;
            text-align: center;
            padding: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }
        .content h2 {
            color: #ff5722;
            font-size: 20px;
            margin-bottom: 10px;
        }
        .otp-code {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #f1f1f1;
            color: #333;
            font-weight: bold;
            font-size: 18px;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 10px;
            background: #f1f1f1;
            color: #777;
            font-size: 12px;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <table class="email-container">
        <tr>
            <td class="header">
                <h1>Password Reset Request</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <h2>Hello ${user.name},</h2>
                <p>We received a request to reset your password. Use the OTP code below to proceed with resetting your password. This code will expire in 10 minutes.</p>
                <div class="otp-code">${otp}</div>
                <p>If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.</p>
                <p>Thank you,<br>The Ryde Team</p>
            </td>
        </tr>
        <tr>
            <td class="footer">
                <p>&copy; 2025 Ryde, Inc. All rights reserved.</p>
                <p>123 Ryde Lane, Mobility City, TX 75001</p>
            </td>
        </tr>
    </table>
</body>
</html>`
    };

    await transporter.sendMail(mailOptions);
    console.log('Forgot email send successfully!', user.email);
  } catch (error) {
    console.error('Error while sending forgot otp email:', error);
    throw error;
  }
}