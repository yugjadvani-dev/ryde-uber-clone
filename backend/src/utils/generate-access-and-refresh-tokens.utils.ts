import { generateAuthTokenUtils } from './generate-auth-token.utils';
import { generateRefreshTokenUtils } from './generate-refresh-token.utils';
import ApiError from './api-error.utils';
import { Role } from '../types/role.type';

/**
 * Generate new access and refresh tokens for a user
 * @private
 * @param userId - User's ID to generate tokens for
 * @param role - Profile Role type
 * @returns {Promise<{generatedAccessToken: string, generatedRefreshToken: string}>} Object containing access and refresh tokens
 * @throws {ApiError} If token generation fails or user not found
 */
export const generateAccessAndRefreshTokens = async (userId: number, role: Role): Promise<{
  generatedAccessToken: string;
  generatedRefreshToken: string;
}> => {
  try {
    const generatedAccessToken = generateAuthTokenUtils(userId, role);
    const generatedRefreshToken = generateRefreshTokenUtils(userId);

    return { generatedAccessToken, generatedRefreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating refresh and access token');
  }
};
