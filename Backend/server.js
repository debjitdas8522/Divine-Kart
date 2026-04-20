import app from './src/app.js';

const port = process.env.PORT || 3000

// LISTEN only when not testing
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}`)
        console.log(`DB Conncted`)
    })
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT. Graceful shutdown...');
    const mongoose = await import('mongoose');
    await mongoose.default.connection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
    const mongoose = await import('mongoose');
    await mongoose.default.connection.close();
    process.exit(0);
});

export default app;
