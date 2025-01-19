import nodemailer from 'nodemailer';

// Configuration options for nodemailer
const configOptions = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: true,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
}

// Creating nodemailer createTransport
const transporter = nodemailer.createTransport(configOptions);

export default transporter