import express from 'express';
import cors from 'cors';
import path from 'path';

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

// Serve static files (for production build)
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
    } else {
        res.sendFile(path.join(clientPath, 'index.html'));
    }
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
    console.log('---');
});

export default app;