import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import sendEmail from '../config/sendmail.js';
import User from "../models/userModel.js";
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import generatedOtp from '../utils/generatedOtp.js';
import loginOtpTemplate from '../utils/loginOtpTemplate.js';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRE = '48h';

const generateToken = (userId) =>
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRE })


// In-memory store for pending registrations (name, otp, expiry keyed by email)
const pendingRegistrations = new Map();

// Step 1: Send OTP for new registration
export async function sendRegisterOtp(req, res) {
    const { name } = req.body;
    const sanitizedEmail = req.body.email?.trim().toLowerCase() || '';
    const sanitizedName = validator.escape((name ?? '').trim());

    const nameRegex = /^[\p{L}\p{N} .'-]{1,100}$/u;
    if (!sanitizedName || !sanitizedEmail) {
        return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    if (!nameRegex.test(sanitizedName)) {
        return res.status(400).json({ success: false, message: 'Name contains invalid characters' });
    }
    if (!validator.isEmail(sanitizedEmail)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    try {
        const existing = await User.findOne({ email: sanitizedEmail });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const otp = String(Math.floor(Math.random() * 9000) + 1000); // 4-digit
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        pendingRegistrations.set(sanitizedEmail, { name: sanitizedName, otp, expiry });

        await sendEmail({
            sendTo: sanitizedEmail,
            subject: 'Your DivineKart Registration OTP',
            html: loginOtpTemplate({ name: sanitizedName, otp }),
        });

        return res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
}

// Step 2: Verify OTP and create account
export async function verifyRegisterOtp(req, res) {
    const sanitizedEmail = req.body.email?.trim().toLowerCase() || '';
    const { otp } = req.body;

    const pending = pendingRegistrations.get(sanitizedEmail);
    if (!pending) {
        return res.status(400).json({ success: false, message: 'No pending registration for this email. Please request a new OTP.' });
    }

    if (new Date() > pending.expiry) {
        pendingRegistrations.delete(sanitizedEmail);
        return res.status(400).json({ success: false, message: 'OTP has expired. Please start again.' });
    }

    if (otp !== pending.otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    try {
        const existing = await User.findOne({ email: sanitizedEmail });
        if (existing) {
            pendingRegistrations.delete(sanitizedEmail);
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const user = await User.create({ name: pending.name, email: sanitizedEmail, password: 'OTP_AUTH_' + Date.now() });
        pendingRegistrations.delete(sanitizedEmail);

        const token = generateToken(user._id);
        return res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
}

// Send login OTP to user email
export async function sendLoginOtp(req, res) {
    const sanitizedEmail = req.body.email?.trim().toLowerCase() || '';

    try {
        const user = await User.findOne({ email: sanitizedEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        // 4-digit OTP
        const otp = String(Math.floor(Math.random() * 9000) + 1000);
        const expireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await User.findByIdAndUpdate(user._id, {
            loginOtp: otp,
            loginOtpExpiry: expireTime,
        });

        await sendEmail({
            sendTo: sanitizedEmail,
            subject: "Your DivineKart Login OTP",
            html: loginOtpTemplate({ name: user.name, otp }),
        });

        return res.json({
            success: true,
            message: "OTP sent to your email",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

// Verify login OTP and issue JWT
export async function verifyLoginOtp(req, res) {
    const sanitizedEmail = req.body.email?.trim().toLowerCase() || '';
    const { otp } = req.body;

    try {
        const user = await User.findOne({ email: sanitizedEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this email" });
        }

        if (!user.loginOtp || !user.loginOtpExpiry) {
            return res.status(400).json({ success: false, message: "OTP not requested. Please request a new OTP." });
        }

        if (new Date() > new Date(user.loginOtpExpiry)) {
            await User.findByIdAndUpdate(user._id, { loginOtp: null, loginOtpExpiry: null });
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        if (otp !== user.loginOtp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Clear OTP after successful verification
        await User.findByIdAndUpdate(user._id, { loginOtp: null, loginOtpExpiry: null });

        const token = generateToken(user._id);
        return res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}


//update user details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId //auth middleware
        const { name, email, mobile, password } = request.body

        let hashPassword = ""

        if (password) {
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password, salt)
        }

        const updateUser = await User.updateOne({ _id: userId }, {
            ...(name && { name: name }),
            ...(email && { email: email }),
            ...(mobile && { mobile: mobile }),
            ...(password && { password: hashPassword })
        })

        return response.json({
            message: "Updated successfully",
            error: false,
            success: true,
            data: updateUser
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//forgot password not login
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body

        const user = await User.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        const otp = generatedOtp()
        const expireTime = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

        await User.findByIdAndUpdate(user._id, {
            forgotPasswordOtp: otp,
            forgotPasswordExpiry: expireTime.toISOString()
        })

        await sendEmail({
            sendTo: email,
            subject: "Forgot password from DivineKart",
            html: forgotPasswordTemplate({
                name: user.name,
                otp: otp
            })
        })

        return response.json({
            message: "check your email",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body

        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide required field email, otp.",
                error: true,
                success: false
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        const currentTime = new Date().toISOString()

        if (user.forgotPasswordExpiry < currentTime) {
            return response.status(400).json({
                message: "Otp is expired",
                error: true,
                success: false
            })
        }

        if (otp !== user.forgotPasswordOtp) {
            return response.status(400).json({
                message: "Invalid otp",
                error: true,
                success: false
            })
        }

        //if otp is not expired
        //otp === user.forgotPasswordOtp

        await User.findByIdAndUpdate(user?._id, {
            forgotPasswordOtp: "",
            forgotPasswordExpiry: ""
        })

        return response.json({
            message: "Verify otp successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//reset the password
export async function resetpassword(request, response) {
    try {
        const { email, newPassword, confirmPassword } = request.body

        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                message: "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "Email is not available",
                error: true,
                success: false
            })
        }

        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same.",
                error: true,
                success: false,
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword, salt)

        await User.findByIdAndUpdate(user._id, {
            password: hashPassword
        })

        return response.json({
            message: "Password updated successfully.",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//refresh token controler
export async function refreshToken(request, response) {
    try {
        const refreshTokenValue = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if (!refreshTokenValue) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }

        const verifyToken = await jwt.verify(refreshTokenValue, process.env.SECRET_KEY_REFRESH_TOKEN)

        if (!verifyToken) {
            return response.status(401).json({
                message: "token is expired",
                error: true,
                success: false
            })
        }

        const userId = verifyToken?.id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accessToken', newAccessToken, cookiesOption)

        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.userId

        console.log(userId)

        const user = await User.findById(userId).select('-password -refreshToken')

        return response.json({
            message: 'user details',
            data: user,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}