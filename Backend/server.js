import app from './src/app.js';

const port = process.env.PORT || 3000;

let server;

// LISTEN only when not testing
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}`);
    });
}

// Shared graceful shutdown helper
async function gracefulShutdown(signal) {
    console.log(`\n🛑 Received ${signal}. Graceful shutdown...`);
    try {
        // Close HTTP server first (stop accepting new connections)
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((err) => (err ? reject(err) : resolve()));
            });
            console.log('✅ HTTP server closed.');
        }

        // Then close mongo connection
        const mongoose = await import('mongoose');
        await mongoose.default.connection.close();
        console.log('✅ MongoDB connection closed.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Shutdown error:', err.message);
        process.exit(1);
    }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default app;
