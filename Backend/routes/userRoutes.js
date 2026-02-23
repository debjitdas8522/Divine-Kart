import express from 'express';
import { forgotPasswordController, refreshToken, resetpassword, sendLoginOtp, sendRegisterOtp, updateUserDetails, userDetails, verifyForgotPasswordOtp, verifyRegisterOtp } from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import { validateForgotPassword, validateLoginOtpVerification, validateOtpVerification, validateRegister, validateResetPassword, validateSendLoginOtp, validateUpdateUser } from '../middleware/validation.js';

const userRouter = express.Router();

userRouter.post('/send-register-otp', validateRegister, sendRegisterOtp);
userRouter.post('/verify-register-otp', validateLoginOtpVerification, verifyRegisterOtp);
userRouter.post('/send-login-otp', validateSendLoginOtp, sendLoginOtp);
userRouter.put('/update-user', auth, validateUpdateUser, updateUserDetails)
userRouter.post('/forgot-password', validateForgotPassword, forgotPasswordController)
userRouter.post('/verify-forgot-password-otp', validateOtpVerification, verifyForgotPasswordOtp)
userRouter.post('/reset-password', validateResetPassword, resetpassword)
userRouter.post('/refresh-token', refreshToken)
userRouter.get('/user-details', auth, userDetails)


export default userRouter