import { Request, Response } from "express"; // Import necessary types from express
import pool from "../db/db";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {handleError} from "../utils/error-handler";

// User Registration
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password, name} = req.body; // Destructure email, password, and name from request body

        // Input Validation
        if (!email || !password || !name) {
            res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
            return;
        }

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )

        if (userExists.rows.length > 0) {
            res.status(400).json({
                success: false,
                message: 'User already exists'
            })
            return;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user info database
        const newUser = await pool.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
            [email, hashedPassword, name]
        )

        // Generate JWT token
        const token = jwt.sign(
            {userId: newUser.rows[0].id},
            process.env.JWT_SECRET as string,
            {expiresIn: '24h'}
        )

        // Send response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token
        })
    } catch (error) {
        handleError(error, res);
        // console.error('Registration error:', error);
        // res.status(500).json({
        //     success: false,
        //     message: 'Internal server error'
        // })
    }
}
