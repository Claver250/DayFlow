require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT;

const start = async () => {
    try {
        await sequelize.authenticate();

        const isProd = process.env.NODE_ENV === 'production';
        const reset = process.env.DB_RESET === 'true' && !isProd; // never in production

        if (reset) console.warn('⚠️  DB_RESET=true → dropping and recreating all tables');

        // reset: drop + recreate · dev: alter adds new columns · production: only creates missing tables
        await sequelize.sync(reset ? { force: true } : { alter: !isProd });
        console.log('Database connected and synced');

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error('Unable to start:', err);
        process.exit(1);
    }
};

start();