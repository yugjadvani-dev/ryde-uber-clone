/**
 * Database Configuration Module
 * Sets up and manages the PostgreSQL connection pool for the application.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Load environment variables from .env file
dotenv.config();

/**
 * PostgreSQL connection pool configuration
 * Uses environment variables for secure configuration
 * Enables connection pooling for better performance and resource management
 */
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Verify database connection on startup
pool.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
  }
});

// Schedule a cron job to clean up expired OTPs
cron.schedule('0 * * * *', async () => {
  try {
    const result = await pool.query('DELETE FROM otp_codes WHERE otp_expiry < NOW()');
    console.log(`Cleaned up ${result.rowCount} expired OTPs at ${new Date()}`);
  } catch (err) {
    console.error('Error cleaning up expired OTPs:', err);
  }
});

export default pool;
