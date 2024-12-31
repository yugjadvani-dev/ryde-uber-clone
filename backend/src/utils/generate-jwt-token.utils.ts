import jwt from "jsonwebtoken";

export const generateJwtToken = (userId: number) => {
    // Generate JWT token logic
    return jwt.sign(
        {userId: userId},
        process.env.JWT_SECRET as string,
        {expiresIn: '24h'}
    );
};