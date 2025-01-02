import { Request, Response } from "express"; // Import necessary types from express
import pool from "../db/db";
import bcrypt from 'bcrypt';
import {generateAuthToken} from "../utils/generate-auth-token.utils";

/**
 * Handles user sign-up by creating a new user in the database.
 *
 * This function expects `firstname`, `lastname`, `email`, `password`, and optionally `is_admin`
 * to be present in the request body. It performs input validation, checks if the user already exists,
 * hashes the password, inserts the new user into the database, generates a JWT token, and returns
 * a success response with the user's details and token.
 *
 * @param req - The HTTP request object, expected to contain user data in its body.
 * @param res - The HTTP response object, used to send back the appropriate response.
 * @returns A Promise that resolves to void.
 */
export const signUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const {firstname, lastname, email, password, is_admin} = req.body; // Destructure email, password, and name from request body
        const isAdmin = is_admin ?? false; // Provide a default value of false when is_admin is not present

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
            [firstname, lastname, email, hashedPassword, isAdmin]
        )

        // Generate JWT token
        const token = generateAuthToken(newUser.rows[0].id, isAdmin);

        // Send response
        res.status(201).json({
            success: true,
            message: 'User signed up successfully',
            token,
            data: newUser.rows[0]
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong during signUp process, please try again!'
        })
    }
}

/**
 * Handles user sign-in by checking if the user exists, verifying the password, and generating a JWT token.
 *
 * This function expects `email` and `password` to be present in the request body. It performs input validation,
 * checks if the user already exists, verifies the password, and generates a JWT token. If the user is not verified,
 * it returns an error response. If the password is incorrect, it also returns an error response.
 *
 * @param req - The HTTP request object, expected to contain user data in its body.
 * @param res - The HTTP response object, used to send back the appropriate response.
 * @returns A Promise that resolves to void.
 */
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

        if (!userExists.rows.length) {
            res.status(400).json({
                success: false,
                message: 'User does not exist'
            })
            return;
        }

        // Check if user is verified
        if (!userExists.rows[0].is_verified) {
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
        const token = generateAuthToken(userExists.rows[0].id, userExists.rows[0].is_admin);

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
            data: safeUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong during login process, please try again!'
        })
    }
}

export const signOut = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            data: null,
            message: 'User signed out successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong during logout process, please try again!'
        })
    }
}

// TODO: User forgotPassword, User resetPassword, User changePassword, User updateProfile, User deleteProfile, User verifyEmail, User resendVerificationEmail, User changeEmail