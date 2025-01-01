import { Request, Response } from "express";
import pool from "../db/db";

// Get all the users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await pool.query('SELECT * FROM users WHERE is_admin = false'); // Query to get all users
        res.json(users.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}