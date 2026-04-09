import api from './api';

// Register new user (DEPRECATED: Registration now integrated into login)
export const register = async (userData) => {
    console.warn("register() is deprecated, use sendLoginOtp/verifyLoginOtp");
    return { success: false, message: "Use login for auto-registration" };
};

// Step 1: Request a login OTP (supports email or phone)
// `identifier` can be:
// - string: treated as email (backwards compatible)
// - object: { email } or { phone } or both
export const sendLoginOtp = async (identifier) => {
    let payload;

    if (typeof identifier === 'string') {
        payload = { email: identifier };
    } else if (identifier && typeof identifier === 'object') {
        const { email, phone } = identifier;
        payload = {
            ...(email ? { email } : {}),
            ...(phone ? { phone } : {}),
        };
    } else {
        payload = {};
    }

    const { data } = await api.post('/api/users/send-login-otp', payload);
    return data;
};

// Step 2: Verify the OTP and get JWT (Unified Sign-In or Sign-Up)
export const verifyLoginOtp = async (identifier, otp) => {
    let payload;

    if (typeof identifier === 'string') {
        payload = { email: identifier, otp };
    } else if (identifier && typeof identifier === 'object') {
        const { email, phone } = identifier;
        payload = {
            ...(email ? { email } : {}),
            ...(phone ? { phone } : {}),
            otp,
        };
    } else {
        payload = { otp };
    }

    const { data } = await api.post('/api/users/verify-login-otp', payload);

    // Store token
    if (data.token) {
        localStorage.setItem('token', data.token);
    }
    if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
    }

    return data;
};

// Logout user
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};


// Refresh token
export const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const { data } = await api.post('/api/users/refresh-token', { refreshToken });

    if (data.token) {
        localStorage.setItem('token', data.token);
    }

    return data;
};

// Forgot password – sends OTP to email
export const forgotPassword = async (email) => {
    const { data } = await api.post('/api/users/forgot-password', { email });
    return data;
};

// Verify forgot password OTP
export const verifyForgotPasswordOtp = async (email, otp) => {
    const { data } = await api.post('/api/users/verify-forgot-password-otp', { email, otp });
    return data;
};

// Reset password with new credentials
export const resetPassword = async (email, newPassword, confirmPassword) => {
    const { data } = await api.post('/api/users/reset-password', {
        email,
        newPassword,
        confirmPassword,
    });
    return data;
};

// Verify email with OTP
export const verifyEmail = async (email, otp) => {
    const { data } = await api.post('/api/users/verify-email', { email, otp });
    return data;
};

// Get user profile
export const getProfile = async () => {
    const { data } = await api.get('/api/users/user-details');
    return data;
};

// Update user profile
export const updateProfile = async (profileData) => {
    const { data } = await api.put('/api/users/update-user', profileData);
    return data;
};
