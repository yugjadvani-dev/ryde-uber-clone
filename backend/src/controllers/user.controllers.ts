import { Request, Response } from "express";
import pool from "../db/db";

// Get all the users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await pool.query('SELECT * FROM users WHERE is_admin = false'); // Query to get all users
        res.status(200).json({
            success: true,
            data: users.rows,
            message: "Users fetched successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while getting all users' });
    }
}

// Get single user by id
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // Get the user ID from the request parameters
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]); // Query to get the user by ID

        res.status(200).json({
            success: true,
            data: user.rows[0],
            message: "User fetched successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while getting the user details' });
    }
}

// Update user by id
export const updateUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // Get the user ID from the request parameters

        const {firstname, lastname, email, phone_number} = req.body; // Destructure firstname, lastname, email, and phone_number from request body

        // Input Validation
        if (!firstname || !lastname || !email || !phone_number) {
            res.status(400).json({ message: 'Fields should not be empty' });
            return;
        }

        // Update user logic
        const user = await pool.query('UPDATE users SET firstname = $1, lastname = $2, email = $3, phone_number = $4 WHERE id = $5', [firstname, lastname, email, phone_number, id]); // Query to update the user by ID

        res.status(200).json({
            success: true,
            data: user.rows[0],
            message: "User updated successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while updating the user details' });
    }
}