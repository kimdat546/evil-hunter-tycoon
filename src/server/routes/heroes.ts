import express from 'express';
import { HeroService } from '../services/HeroService';
import { GeminiService } from '../ai/GeminiService';

const router = express.Router();

// Get all heroes for a guild
router.get('/guild/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        // Implementation would query database for heroes in guild
        res.json({ heroes: [], message: 'Heroes retrieved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get heroes' });
    }
});

// Create a new hero
router.post('/', async (req, res) => {
    try {
        const { guildId, worldContext } = req.body;
        
        const gemini = new GeminiService(process.env.GEMINI_API_KEY || '');
        const heroData = await gemini.generateHero(worldContext);
        
        // Here you would save the hero to database
        res.json({ hero: heroData, message: 'Hero created successfully' });
    } catch (error) {
        console.error('Error creating hero:', error);
        res.status(500).json({ error: 'Failed to create hero' });
    }
});

// Get specific hero
router.get('/:heroId', async (req, res) => {
    try {
        const { heroId } = req.params;
        // Implementation would query database for specific hero
        res.json({ hero: null, message: 'Hero retrieved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get hero' });
    }
});

// Update hero
router.put('/:heroId', async (req, res) => {
    try {
        const { heroId } = req.params;
        const updateData = req.body;
        
        // Implementation would update hero in database
        res.json({ message: 'Hero updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update hero' });
    }
});

// Make hero perform action
router.post('/:heroId/action', async (req, res) => {
    try {
        const { heroId } = req.params;
        const { action } = req.body;
        
        const result = await HeroService.processHeroAction({
            heroId,
            action,
            guildId: req.body.guildId
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error processing hero action:', error);
        res.status(500).json({ error: 'Failed to process action' });
    }
});

export { router as heroRoutes };