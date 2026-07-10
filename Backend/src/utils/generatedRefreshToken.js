import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Generate a refresh token and persist it against the user record.
const generatedRefreshToken = async (userId) => {
    const token = jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn: '7d' }
    );

    const updated = await User.findByIdAndUpdate(
        userId,
        { refreshToken: token },
        { new: true }
    );

    if (!updated) {
        throw new Error(`[generatedRefreshToken] User not found: ${userId}`);
    }

    return token;
};

export default generatedRefreshToken;