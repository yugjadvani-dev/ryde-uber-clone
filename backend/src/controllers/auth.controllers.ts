import { Request, Response } from "express"; // Import necessary types from express
import pool from "../db/db";
import bcrypt from 'bcrypt';
import {generateJwtToken} from "../utils/generate-jwt-token.utils";

// User signUp
export const signUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const {firstname, lastname, email, password, is_admin = false} = req.body; // Destructure email, password, and name from request body

        // Input Validation
        if (!firstname || !lastname || !email || !password) {
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
            'INSERT INTO users (firstname, lastname, email, password, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, firstname, lastname',
            [firstname, lastname, email, hashedPassword, is_admin]
        )

        // Generate JWT token
        const token = generateJwtToken(newUser.rows[0].id);

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
            message: 'Something went wrong during signUp process, please try again!'
        })
    }
}

// User signIn
export const signIn = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body; // Destructure email and password from request body

        // Input Validation
        if (!email || !password) {
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

        // Check if user is verified
        if (userExists.rows[0].is_verified === false) {
            res.status(400).json({
                success: false,
                message: 'User is not verified'
            })
            return;
        }

        // Check is password correct
        const isPasswordCorrect = await bcrypt.compare(password, userExists.rows[0].password);

        if(!isPasswordCorrect) {
            res.status(400).json({
                success: false,
                message: 'Incorrect password'
            })
            return;
        }

        // Generate JWT token
        const token = generateJwtToken(userExists.rows[0].id);

        // Create safe user
        const safeUser = {
            id: userExists.rows[0].id,
            email: userExists.rows[0].email,
            firstname: userExists.rows[0].firstname,
            lastname: userExists.rows[0].lastname,
            is_admin: userExists.rows[0].is_admin
        }

        // Send response
        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            token,
            user: safeUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong during login process, please try again!'
        })
    }
}

// TODO: User signOut, User forgotPassword, User resetPassword, User changePassword, User updateProfile, User deleteProfile, User verifyEmail, User resendVerificationEmail, User changeEmail