/**
 * Database Configuration Module
 * Sets up and manages the PostgreSQL connection pool for the application.
 *
 * @requires DB_USER - Database username from environment variables
 * @requires DB_HOST - Database host from environment variables
 * @requires DB_NAME - Database name from environment variables
 * @requires DB_PASSWORD - Database password from environment variables
 * @requires DB_PORT - Database port from environment variables
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

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

export default pool;
