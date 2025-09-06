import { GoogleGenerativeAI } from '@google/generative-ai';
import { Hero, World, PersonalityTraits } from '../../shared/types';
import { HERO_CLASSES } from '../../shared/constants/gameConstants';

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async generateWorld(playerId: string): Promise<Partial<World>> {
        const prompt = `Generate a unique fantasy world for a hero management game. Create:

1. World name and seed
2. 4 different biomes (forest, mountain, desert, swamp) with unique characteristics
3. 8-12 interesting locations including dungeons, towns, resource nodes
4. 2-3 starting world events
5. Overall world lore and atmosphere

Format as JSON with this structure:
{
    "name": "World Name",
    "seed": "unique-seed-123",
    "locations": [
        {
            "name": "Location Name",
            "type": "dungeon|town|wilderness|resource_node",
            "biome": "forest|mountain|desert|swamp",
            "x": 0-1000,
            "y": 0-1000,
            "difficulty": 1-10,
            "resources": ["resource1", "resource2"],
            "monsters": ["monster1", "monster2"],
            "description": "Brief description"
        }
    ],
    "events": [
        {
            "type": "monster_invasion|festival|natural_disaster",
            "name": "Event Name",
            "description": "What's happening",
            "duration": 24,
            "effects": {"resource_gain": 0.5}
        }
    ],
    "lore": "Brief world backstory and atmosphere"
}

Make it creative and unique!`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Parse JSON response
            const cleanedText = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error('Error generating world:', error);
            throw new Error('Failed to generate world');
        }
    }

    async generateHero(worldContext?: string): Promise<Partial<Hero>> {
        const classes = Object.keys(HERO_CLASSES);
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        
        const prompt = `Generate a unique hero for a fantasy hero management game. 
        ${worldContext ? `World context: ${worldContext}` : ''}

Create a hero with these requirements:
- Class: ${randomClass}
- Unique personality with 7 traits (courage, greed, loyalty, curiosity, ambition, patience, empathy) as 0-100 values
- Compelling backstory (2-3 sentences)
- 3 personal goals (short-term, long-term, secret ambition)
- Starting mood and motivation

Format as JSON:
{
    "name": "Hero Name",
    "class": "${randomClass}",
    "personality": {
        "courage": 0-100,
        "greed": 0-100,
        "loyalty": 0-100,
        "curiosity": 0-100,
        "ambition": 0-100,
        "patience": 0-100,
        "empathy": 0-100
    },
    "backstory": "Compelling 2-3 sentence backstory",
    "goals": ["short-term goal", "long-term goal", "secret ambition"],
    "mood": -100 to 100,
    "startingEquipment": ["item1", "item2"]
}

Make them feel alive and unique!`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const cleanedText = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error('Error generating hero:', error);
            throw new Error('Failed to generate hero');
        }
    }

    async makeHeroDecision(hero: Hero, availableActions: string[], context: any): Promise<{
        chosenAction: string;
        reasoning: string;
    }> {
        const prompt = `You are ${hero.name}, a ${hero.class} with this personality:
- Courage: ${hero.personality.courage}/100
- Greed: ${hero.personality.greed}/100  
- Loyalty: ${hero.personality.loyalty}/100
- Curiosity: ${hero.personality.curiosity}/100
- Ambition: ${hero.personality.ambition}/100
- Patience: ${hero.personality.patience}/100
- Empathy: ${hero.personality.empathy}/100

Current status:
- Health: ${hero.stats.health}/${hero.stats.maxHealth}
- Energy: ${hero.stats.energy}/${hero.stats.maxEnergy}
- Mood: ${hero.mood}/100
- Goals: ${hero.goals.join(', ')}
- Master relationship: Trust ${hero.masterRelation.trust}, Respect ${hero.masterRelation.respect}, Fear ${hero.masterRelation.fear}

Available actions: ${availableActions.join(', ')}

Context: ${JSON.stringify(context)}

Choose ONE action and explain your reasoning in character. Format as JSON:
{
    "chosenAction": "action_name",
    "reasoning": "Your thought process as this character"
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const cleanedText = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error('Error making hero decision:', error);
            return {
                chosenAction: availableActions[Math.floor(Math.random() * availableActions.length)],
                reasoning: "I'll go with my instincts on this one."
            };
        }
    }

    async generateQuestIdea(difficulty: number, worldContext?: string): Promise<{
        title: string;
        description: string;
        type: string;
        requirements: string[];
        rewards: Record<string, number>;
    }> {
        const prompt = `Generate a quest for difficulty level ${difficulty} (1-10 scale).
        ${worldContext ? `World context: ${worldContext}` : ''}

Create an engaging quest with:
- Compelling title and description
- Type: combat, exploration, crafting, or social
- Specific requirements
- Balanced rewards

Format as JSON:
{
    "title": "Quest Title",
    "description": "Detailed quest description",
    "type": "combat|exploration|crafting|social",
    "requirements": ["requirement1", "requirement2"],
    "rewards": {
        "experience": 100,
        "gold": 50,
        "reputation": 10
    }
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const cleanedText = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error('Error generating quest:', error);
            throw new Error('Failed to generate quest');
        }
    }
}