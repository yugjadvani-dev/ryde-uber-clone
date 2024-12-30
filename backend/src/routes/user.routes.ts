import { Request, Response } from "express"; // Import necessary types from express
import pool from "../db/db";

// Get all Users
export const getAllUsers = async (req: Request, res:Response): Promise<void> => {
    try {
        const users = pool.query('SELECT * FROM users');

        res.status(200).json({
            success: true,
            message: 'User fetched successfully',
            users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!'
        })
    }
}