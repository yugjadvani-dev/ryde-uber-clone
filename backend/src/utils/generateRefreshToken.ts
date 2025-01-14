import jwt from 'jsonwebtoken';

export const generateRefreshToken = (userId: number) => {
  // Generate refresh token logic
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};
