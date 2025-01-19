/**
 * Express Application Configuration
 * This module sets up the Express application with necessary middleware and routes.
 * It includes CORS configuration, body parsing, and static file serving.
 */

import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

/**
 * Middleware Configuration
 * - CORS: Enables Cross-Origin Resource Sharing with specified origin
 * - Body Parser: Handles JSON and URL-encoded bodies with 16kb limit
 * - Static Files: Serves static files from 'public' directory
 */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));

// Mount API routes under /api/v1 prefix
app.use('/api/v1', routes);

export default app;
