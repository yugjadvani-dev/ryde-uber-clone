import { Request, Response } from "express"; // Import necessary types from express
import pool from "../db/db";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// User signUp
export const signUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const {firstName, lastName, email, password, isAdmin = false} = req.body; // Destructure email, password, and name from request body

        // Input Validation
        if (!firstName || !lastName || !email || !password) {
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
            'INSERT INTO users (firstName, lastName, email, password, isAdmin) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, firstName, lastName',
            [firstName, lastName, email, hashedPassword, isAdmin]
        )
        console.log("newUser",newUser)

        // Generate JWT token
        const token = jwt.sign(
            {userId: newUser.rows[0].id},
            process.env.JWT_SECRET as string,
            {expiresIn: '24h'}
        )

        // Send response
        res.status(201).json({
            success: true,
            message: 'User signed up successfully',
            token,
            user: newUser.rows[0]
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong during signUp process please try again'
        })
    }
}

// User signIn
export const signIn = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body; // Destructure email and password from request body
        console.log("login", email, password)

        // Input Validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
            return;
        }

        // Check if user exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if(!userExists.rows.length) {
            res.status(400).json({
                success: false,
                message: 'User not exist!'
            })
            return;
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong during login process please try again'
        })
    }
}