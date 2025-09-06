import express from 'express';
import { WorldService } from '../services/WorldService';

const router = express.Router();

// Create a new world
router.post('/create', async (req, res) => {
    try {
        const { playerId } = req.body;
        
        const world = await WorldService.createWorld(playerId);
        res.json({ world, message: 'World created successfully' });
    } catch (error) {
        console.error('Error creating world:', error);
        res.status(500).json({ error: 'Failed to create world' });
    }
});

// Get world state
router.get('/:worldId', async (req, res) => {
    try {
        const { worldId } = req.params;
        
        const world = await WorldService.getWorldState(worldId);
        res.json({ world });
    } catch (error) {
        console.error('Error getting world:', error);
        res.status(500).json({ error: 'Failed to get world' });
    }
});

// Update world time (simulate time passage)
router.post('/:worldId/time', async (req, res) => {
    try {
        const { worldId } = req.params;
        
        const newTime = await WorldService.updateWorldTime(worldId);
        res.json({ timeOfDay: newTime, message: 'Time updated successfully' });
    } catch (error) {
        console.error('Error updating world time:', error);
        res.status(500).json({ error: 'Failed to update time' });
    }
});

// Trigger random event
router.post('/:worldId/event', async (req, res) => {
    try {
        const { worldId } = req.params;
        
        const event = await WorldService.spawnRandomEvent(worldId);
        
        if (event) {
            res.json({ event, message: 'Event spawned successfully' });
        } else {
            res.json({ event: null, message: 'No event spawned' });
        }
    } catch (error) {
        console.error('Error spawning event:', error);
        res.status(500).json({ error: 'Failed to spawn event' });
    }
});

export { router as worldRoutes };