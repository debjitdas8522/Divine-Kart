import { randomInt } from 'crypto';

// Returns a cryptographically secure 6-digit OTP (100000–999999)
const generatedOtp = () => randomInt(100000, 1000000);

export default generatedOtp;