const express = require('express');
const cors = require('cors');
const path = require('path');

// Very simple Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple API routes
app.get('/api/hello', (_req, res) => {
    res.json({ 
        message: 'Hello from AI Hero Tycoon server!',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/game-status', (_req, res) => {
    res.json({
        game: 'AI Hero Tycoon',
        phase: 'Phase 1 - Hello World',
        features: [
            'PixiJS Frontend',
            'Express Backend',
            'Basic Structure'
        ],
        nextSteps: [
            'Add hero data models',
            'Create simple database',
            'Implement basic game logic'
        ]
    });
});

// Simple test API for frontend to call
app.get('/api/test', (_req, res) => {
    res.json({
        success: true,
        message: 'Server connection successful!',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 AI Hero Tycoon Server Started!');
    console.log(`📍 Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log('---');
    console.log('Available endpoints:');
    console.log('  GET /api/hello - Test endpoint');
    console.log('  GET /api/game-status - Game information');
    console.log('  GET /api/test - Simple test endpoint');
    console.log('---');
});

module.exports = app;