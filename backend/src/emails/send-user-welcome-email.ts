/**
 * User Welcome Email Module
 * Handles sending welcome emails to newly registered users using nodemailer.
 */

import { SendMailOptions } from 'nodemailer';
import transporter from '../utils/nodemailer';
import { User } from '../types/email.type';

/**
 * Sends a welcome email to a newly registered user
 * @param user - Object containing user's name and email
 * @returns Promise that resolves when email is sent
 * @throws Error if email sending fails
 */
export const sendUserWelcomeEmail = async (user: User): Promise<void> => {
  try {
    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Welcome to Ryde, ${user.name}!`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome mail for user</title>
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
            background-color: #4CAF50;
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
        .footer {
            background-color: #f5f5f5;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Welcome to Ryde! 🚗</h1>
        </div>
        <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Welcome to Ryde! We're excited to have you on board.</p>
            <p>With Ryde, you can:</p>
            <ul>
                <li>Book rides quickly and easily</li>
                <li>Track your driver in real-time</li>
                <li>Pay securely through the app</li>
                <li>Rate your experience</li>
            </ul>
            <p>Ready to get started?</p>
            <a href="${process.env.FRONTEND_URL}" class="button">Open Ryde App</a>
            <p>If you have any questions, our support team is here to help!</p>
            <p>Best regards,<br>The Ryde Team</p>
        </div>
        <div class="footer">
            <p>This email was sent to ${user.email}</p>
            <p> ${new Date().getFullYear()} Ryde. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', user.email);
  } catch (error) {
    console.error('Error while sending welcome email:', error);
    throw error;
  }
};
