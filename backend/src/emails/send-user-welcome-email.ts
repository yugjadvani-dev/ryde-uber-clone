import { SendMailOptions } from 'nodemailer';
import transporter from '../utils/nodemailer';

// Interface for User
interface User {
  name: string;
  email: string;
}

// Sending user welcome email
export const sendUserWelcomeEmail = async (user: User) => {
  try {
    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Welcome back ${user.name} to Ryde`,
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        .content h2 {
            color: #4CAF50;
            font-size: 20px;
            margin-bottom: 10px;
        }
        .cta-button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .cta-button:hover {
            background-color: #45a049;
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
    <table class="email-container" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td class="header">
                <h1>Welcome to Ryde!</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <h2>Hi ${user.name},</h2>
                <p>Thank you for joining Ryde! We’re thrilled to have you on board. Whether you’re commuting to work, meeting friends, or exploring the city, we’ve got you covered with safe and reliable rides.</p>
                <p>To get started, download the Ryde app and book your first ride in just a few taps.</p>
                <a href="#" class="cta-button">Download the App</a>
                <p>If you have any questions, feel free to contact our support team at <a href="mailto:support@ryde.com">support@ryde.com</a>.</p>
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
</html>`,
    }

    await transporter.sendMail(mailOptions)
    console.log('Welcome to Ryde!')
  } catch (error) {
    console.log('Error sending welcome email', error);
  }
}