import pool from '../db/db';

/**
 * Checks if a user exists in the database
 * @param email - User's email address
 * @param expectUserToExist - If true, throws error when user doesn't exist; if false, throws when user does exist
 * @returns Object containing existence status and optional user data
 * @throws Error when user existence doesn't match expectation
 */
export const checkUserExistsUtils = async (
  email: string,
  expectUserToExist: boolean = true,
): Promise<{ exists: boolean; userData?: any }> => {
  const userExists = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  const exists = userExists.rows.length > 0;

  if (expectUserToExist && !exists) {
    throw new Error('User does not exist');
  }

  if (!expectUserToExist && exists) {
    throw new Error('User already exists');
  }

  return {
    exists,
    userData: exists ? userExists.rows[0] : undefined,
  };
};