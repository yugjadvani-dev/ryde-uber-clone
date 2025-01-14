import jwt from 'jsonwebtoken';
import { Role } from '../types/role.type';

/**
 * Generates a JSON Web Token (JWT) for the given user ID and admin status.
 *
 * The returned JWT is signed with the value of the `ACCESS_TOKEN_SECRET` environment variable
 * and is set to expire after 24 hours.
 *
 * @param userId The ID of the user for whom the token is being generated
 * @param role Whether or not the user has admin privileges
 * @returns A JSON Web Token (JWT) containing the user's ID and admin status
 */
export const generateAuthToken = (userId: number, role: Role) => {
  // Generate JWT token logic
  return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
