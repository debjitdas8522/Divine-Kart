/**
 * promote-admin.js
 * Promotes a user to admin role directly via MongoDB native driver.
 * No Mongoose models needed — avoids module resolution issues.
 *
 * Usage:
 *   node promote-admin.js chiranjit809@gmail.com
 */

import 'dotenv/config';
import { MongoClient } from 'mongodb';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
    console.error('❌  Usage: node promote-admin.js <email>');
    process.exit(1);
}

const uri = process.env.MONGO_URI;
if (!uri) {
    console.error('❌  MONGO_URI not found in .env');
    process.exit(1);
}

const client = new MongoClient(uri);

try {
    await client.connect();
    console.log('✅  Connected to MongoDB');

    const db = client.db();
    const users = db.collection('users');

    const user = await users.findOne({ email });

    if (!user) {
        console.error(`❌  No user found with email: ${email}`);
        console.log('💡  Log in once via /api/users/send-login-otp to create the account, then re-run.');
        process.exit(1);
    }

    const oldRole = user.role || 'user';
    await users.updateOne({ email }, { $set: { role: 'admin' } });

    console.log('✅  Promoted successfully:');
    console.log(`    Name  : ${user.name}`);
    console.log(`    Email : ${user.email}`);
    console.log(`    Role  : ${oldRole} → admin`);
    console.log('\n🚀  Log in again via /api/users/send-login-otp — you will get role: "admin"');
} catch (err) {
    console.error('❌  Error:', err.message);
    process.exit(1);
} finally {
    await client.close();
}
