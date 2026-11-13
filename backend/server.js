const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const userRoutes = require('./routes/users');
const itemRoutes = require('./routes/items');
const saleRoutes = require('./routes/sales');
const saleDetailRoutes = require('./routes/saleDetails');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/sale-details', saleDetailRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('SRMS API is running...');
});

db.query('SELECT 1')
    .then(() => {
        console.log('Database connected successfully');
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env`);
            } else {
                console.error('Server error:', err.message);
            }
            process.exit(1);
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
        console.error('Check your .env file: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
        process.exit(1);
    });
