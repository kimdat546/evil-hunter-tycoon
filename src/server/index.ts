import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { heroRoutes } from './routes/heroes';
import { worldRoutes } from './routes/world';
import { aiRoutes } from './routes/ai';
import { setupSocketHandlers } from './sockets/socketHandlers';
import { initDatabase } from './database/connection';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/heroes', heroRoutes);
app.use('/api/world', worldRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO setup
setupSocketHandlers(io);

// Start server
async function startServer() {
    try {
        // Try to initialize database connection (non-blocking)
        try {
            await initDatabase();
        } catch (dbError) {
            console.warn('⚠️  Database connection failed - continuing without database');
            console.warn('   Database features will be disabled');
        }
        
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
            console.log(`🎮 Game available at: http://localhost:3000`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export { io };