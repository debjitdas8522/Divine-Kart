import 'dotenv/config';
import { connectDB } from './config/db.js';
import { sendLoginOtp } from './controllers/userController.js';

async function test() {
    await connectDB();
    const req = {
        body: { phone: "1234567890" }
    };
    const res = {
        json: (data) => console.log('RES:', JSON.stringify(data)),
        status: (code) => ({ json: (data) => console.log(`RES (${code}):`, JSON.stringify(data)) })
    };
    try {
        await sendLoginOtp(req, res);
    } catch (e) {
        console.error('TEST ERROR:', e);
    }
    process.exit(0);
}

test();
