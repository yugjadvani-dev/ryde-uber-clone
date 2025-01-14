import jwt from 'jsonwebtoken';
import { Role } from '../types/role.type';

// Generate access token
export const generateAuthToken = (userId: number, role: Role) => {
  // Generate JWT token logic
  return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
