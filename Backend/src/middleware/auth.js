import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.SECRET_KEY_REFRESH_TOKEN;

export default async function authMiddleware(req, res, next) {
    const token = 
        req.cookies?.token ||
        (req.headers?.authorization?.startsWith('Bearer ')
            ? req.headers?.authorization?.split(' ')[1]
            : null);

    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: 'Authentication token missing' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');

        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: 'User not found' });
        }
        req.user = user;
        req.userId = user._id;
        next();
    } 

    catch (error) {
        console.error('Error in auth middleware:', error);
        
        // If token is expired, try to refresh it
        if (error.name === 'TokenExpiredError') {
            try {
                const refreshToken = 
                    req.cookies?.refreshToken ||
                    (req.headers?.['x-refresh-token'] 
                        ? req.headers['x-refresh-token']
                        : null);

                if (!refreshToken) {
                    return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
                }

                // Verify refresh token
                const refreshPayload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
                
                // Check if user still exists
                const user = await User.findById(refreshPayload.id).select('-password');
                if (!user) {
                    return res.status(401).json({ success: false, message: 'User not found' });
                }

                // Verify refresh token matches stored token
                if (user.refresh_token !== refreshToken) {
                    return res.status(401).json({ success: false, message: 'Refresh token invalid' });
                }

                // Generate new access token
                const newAccessToken = await generatedAccessToken(refreshPayload.id);

                // Set new token in response cookie
                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Lax',
                    maxAge: 5 * 60 * 60 * 1000 // 5 hours
                };

                res.cookie('token', newAccessToken, cookieOptions);

                // Attach user to request and continue
                req.user = user;
                req.userId = user._id;
                req.newToken = newAccessToken; // For frontend to update their token
                next();
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                return res.status(401).json({ 
                    success: false, 
                    message: 'Token expired. Please login again.',
                    needsLogin: true 
                });
            }
        } else {
            res.status(401).json({ success: false, message: 'Invalid token' });
        }
    }
}