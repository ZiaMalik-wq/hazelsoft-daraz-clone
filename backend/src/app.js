const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const rootRoutes = require('./routes/index');
app.use('/api', rootRoutes);

// Serve static frontend files
app.use(express.static(config.FRONTEND_PATH));

// Basic Route for API check
app.get('/api-status', (req, res) => {
    res.json({ 
        message: 'Daraz API is running...',
        env: config.NODE_ENV
    });
});

// Fallback route to serve index.html for frontend routing
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(config.FRONTEND_PATH, 'index.html'));
});


module.exports = app;
