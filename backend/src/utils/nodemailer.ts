/**
 * Nodemailer Configuration
 * This module configures and exports a nodemailer transport for sending emails.
 * Uses Gmail SMTP for sending emails with environment-based authentication.
 */

import nodemailer from 'nodemailer';

// SMTP Configuration for Gmai
const configOptions = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: true,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

// Create reusable transporter object using SMTP configuration
const transporter = nodemailer.createTransport(configOptions);

export default transporter;
