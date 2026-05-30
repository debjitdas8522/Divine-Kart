import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.SECRET_KEY_REFRESH_TOKEN;

export default async function authMiddleware(req, res, next) {
    // Determine token source.
    // Authorization Bearer header is EXPLICIT — always takes precedence.
    // Cookie is IMPLICIT — only used as fallback when no Bearer header is sent.
    const tokenFromBearer = req.headers?.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;
    const tokenFromCookie = req.cookies?.token ?? null;

    // Bearer header wins when both exist (e.g. vendor request on a browser
    // where a regular user is also logged in via cookie).
    const token = tokenFromBearer || tokenFromCookie;
    const isBearerSession = !!tokenFromBearer; // true whenever vendor/API sends a Bearer token

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication token missing' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        req.userId = user._id;
        next();

    } catch (error) {
        if (error.name !== 'TokenExpiredError') {
            console.error('Error in auth middleware:', error);
        }

        if (error.name === 'TokenExpiredError') {
            // ─── CRITICAL GUARD ───────────────────────────────────────────────
            // If the expired token came via Authorization Bearer header (vendor),
            // we must NEVER fall back to browser cookies for refresh.
            // The refresh cookie belongs to the regular logged-in user (role:'user'),
            // which would make req.user the wrong person → 403 on vendor routes.
            // Vendor clients must re-login through the vendor OTP flow.
            // ─────────────────────────────────────────────────────────────────
            if (isBearerSession) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor session expired. Please login again.',
                    vendorTokenExpired: true
                });
            }

            // Cookie-based session: try to silently refresh via refresh token cookie.
            try {
                const refreshToken = req.cookies?.refreshToken ?? null;

                if (!refreshToken) {
                    return res.status(401).json({
                        success: false,
                        message: 'Token expired. Please login again.'
                    });
                }

                const refreshPayload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
                const user = await User.findById(refreshPayload.id).select('-password');

                if (!user) {
                    return res.status(401).json({ success: false, message: 'User not found' });
                }

                if (user.refreshToken !== refreshToken) {
                    return res.status(401).json({ success: false, message: 'Refresh token invalid' });
                }

                const newAccessToken = await generatedAccessToken(refreshPayload.id);

                res.cookie('token', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Lax',
                    maxAge: 5 * 60 * 60 * 1000 // 5 hours
                });

                req.user = user;
                req.userId = user._id;
                req.newToken = newAccessToken;
                next();

            } catch (refreshError) {
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