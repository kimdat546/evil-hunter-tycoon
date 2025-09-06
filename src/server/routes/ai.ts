import express from 'express';
import { GeminiService } from '../ai/GeminiService';

const router = express.Router();

// Generate world with AI
router.post('/world/generate', async (req, res) => {
    try {
        const { playerId } = req.body;
        
        const gemini = new GeminiService(process.env.GEMINI_API_KEY || '');
        const worldData = await gemini.generateWorld(playerId);
        
        res.json({ world: worldData, message: 'World generated successfully' });
    } catch (error) {
        console.error('Error generating world:', error);
        res.status(500).json({ error: 'Failed to generate world' });
    }
});

// Generate hero with AI
router.post('/hero/generate', async (req, res) => {
    try {
        const { worldContext } = req.body;
        
        const gemini = new GeminiService(process.env.GEMINI_API_KEY || '');
        const heroData = await gemini.generateHero(worldContext);
        
        res.json({ hero: heroData, message: 'Hero generated successfully' });
    } catch (error) {
        console.error('Error generating hero:', error);
        res.status(500).json({ error: 'Failed to generate hero' });
    }
});

// Generate quest with AI
router.post('/quest/generate', async (req, res) => {
    try {
        const { difficulty, worldContext } = req.body;
        
        const gemini = new GeminiService(process.env.GEMINI_API_KEY || '');
        const questData = await gemini.generateQuestIdea(difficulty, worldContext);
        
        res.json({ quest: questData, message: 'Quest generated successfully' });
    } catch (error) {
        console.error('Error generating quest:', error);
        res.status(500).json({ error: 'Failed to generate quest' });
    }
});

// Make AI decision for hero
router.post('/hero/decision', async (req, res) => {
    try {
        const { hero, availableActions, context } = req.body;
        
        const gemini = new GeminiService(process.env.GEMINI_API_KEY || '');
        const decision = await gemini.makeHeroDecision(hero, availableActions, context);
        
        res.json({ decision, message: 'Decision made successfully' });
    } catch (error) {
        console.error('Error making AI decision:', error);
        res.status(500).json({ error: 'Failed to make decision' });
    }
});

export { router as aiRoutes };