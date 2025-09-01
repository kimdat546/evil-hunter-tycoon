# AI Integration Guide

## Overview
This document details how AI services are integrated into the AI Hero Tycoon game to create unique, living heroes and dynamic world content. The integration focuses on two key points: **World Generation** and **Hero Creation**.

## AI Usage Strategy

### Cost-Effective Approach
- **AI calls only on specific triggers**: World creation and hero summoning
- **Local algorithms handle runtime**: Day-to-day hero decisions use deterministic logic
- **Caching and reuse**: Store AI-generated content to minimize repeated calls
- **Quality over quantity**: Fewer, high-quality AI generations for maximum impact

### AI Call Points
1. **Account Creation**: Generate unique world (1 call per player)
2. **Hero Summoning**: Create new hero (1-3 calls per hero)
3. **Special Events**: Rare story moments (optional, infrequent)

## World Generation System

### World Creation Prompt Template
```typescript
const WORLD_GENERATION_PROMPT = `
Create a unique fantasy world for a hero management game with the following requirements:

WORLD STRUCTURE:
- Generate exactly 4 different biomes from: Forest, Mountains, Desert, Swamp, Tundra, Volcanic, Coastal
- Each biome should be 50-100 tiles in size
- Include 3-5 points of interest per biome (ruins, dungeons, special locations)
- Distribute 10-15 resource nodes across all biomes (mines, herb patches, magical springs)

LORE AND ATMOSPHERE:
- Create a 2-3 sentence backstory for this world
- Name the world and its major landmarks
- Describe the current state/conflict that creates opportunities for heroes

RESOURCE DISTRIBUTION:
- Common resources: Wood, Stone, Iron, Food
- Uncommon resources: Gold, Gems, Mystical Herbs, Rare Metals  
- Legendary resources: Dragon Scales, Ancient Artifacts, Celestial Crystals

MONSTER ECOLOGY:
- 3-4 monster types per biome with appropriate difficulty
- Include at least 2 boss-level creatures
- Describe monster behaviors and territorial patterns

OUTPUT FORMAT:
Respond with valid JSON matching this structure:
{
  "name": "World Name",
  "backstory": "World history and current state",
  "biomes": [
    {
      "type": "forest",
      "name": "Whispering Woods",
      "description": "Dense forest with ancient magic",
      "size": {"width": 80, "height": 60},
      "resources": ["wood", "mystical_herbs"],
      "monsters": ["wolf", "treant"],
      "difficulty": 2,
      "landmarks": [
        {
          "name": "Ancient Oak",
          "type": "mystical_tree",
          "description": "Grants wisdom to those who meditate beneath it",
          "effects": {"wisdom_bonus": 10}
        }
      ]
    }
  ],
  "global_events": [
    {
      "name": "Harvest Festival",
      "frequency": "seasonal",
      "effects": {"happiness_boost": 20, "gold_bonus": 1.5}
    }
  ]
}

Make this world feel unique and alive with interesting lore and interconnected elements.
`;
```

### Implementation
```typescript
// src/server/ai/world-generator.ts
export class WorldGenerator {
    private openai: OpenAI;
    
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    
    async generateWorld(playerId: string, preferences?: WorldPreferences): Promise<WorldData> {
        try {
            const prompt = this.buildWorldPrompt(preferences);
            
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a master world builder for fantasy games." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.8, // Higher creativity for world generation
                max_tokens: 2000
            });
            
            const worldData = this.parseWorldResponse(response.choices[0].message.content);
            
            // Save generated world to database
            await this.saveWorldToDatabase(playerId, worldData, prompt);
            
            return worldData;
            
        } catch (error) {
            console.error('World generation failed:', error);
            throw new Error('Failed to generate world');
        }
    }
    
    private parseWorldResponse(content: string): WorldData {
        try {
            return JSON.parse(content);
        } catch (error) {
            // Fallback parsing or error handling
            throw new Error('Invalid AI response format');
        }
    }
}
```

## Hero Creation System

### Hero Generation Prompt Template
```typescript
const HERO_GENERATION_PROMPT = `
Create a unique hero for this fantasy world context:

WORLD CONTEXT:
{worldBackstory}

HERO REQUIREMENTS:
- Choose one class: Berserker, Ranger, Paladin, Sorcerer
- Generate a fantasy-appropriate name
- Create 2-3 sentence backstory explaining their past and motivation
- Assign personality traits (0-100 scale):
  * Courage: Willingness to face danger
  * Greed: Desire for wealth vs altruism  
  * Loyalty: Trust and obedience to master
  * Curiosity: Drive to explore vs prefer safety
  * Ambition: Personal goals vs team focus
  * Patience: Methodical vs impulsive
  * Empathy: Care for others vs self-interest

PERSONALITY GUIDELINES:
- Make traits distinctive and memorable
- Create internal contradictions for depth
- Ensure personality affects gameplay decisions
- No trait should be below 10 or above 90 (avoid extremes)

GOALS SYSTEM:
- Short-term goal: Achievable in 1-2 weeks
- Long-term goal: Major life ambition  
- Secret ambition: Hidden desire that may conflict with loyalty

OUTPUT FORMAT:
Respond with valid JSON:
{
  "name": "Hero Name",
  "class": "Berserker",
  "backstory": "Compelling 2-3 sentence history",
  "motivation": "Primary driving force",
  "personality": {
    "courage": 75,
    "greed": 25,
    "loyalty": 60,
    "curiosity": 80,
    "ambition": 45,
    "patience": 30,
    "empathy": 70
  },
  "goals": {
    "short_term": "Master the art of dual-wielding",
    "long_term": "Become the greatest warrior in the realm", 
    "secret_ambition": "Find the family that abandoned them"
  },
  "preferred_activities": ["training", "exploration", "combat"],
  "personality_summary": "Brave and curious but impatient, driven by need to prove themselves"
}

Make this hero feel like a real person with depth, flaws, and interesting contradictions.
`;
```

### Implementation
```typescript
// src/server/ai/hero-generator.ts
export class HeroGenerator {
    private openai: OpenAI;
    private heroCache: Map<string, HeroTemplate[]> = new Map();
    
    async generateHero(worldId: string, worldContext: WorldData): Promise<HeroData> {
        try {
            const prompt = this.buildHeroPrompt(worldContext);
            
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are an expert character creator for RPG games." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.9, // High creativity for unique personalities
                max_tokens: 1000
            });
            
            const heroData = this.parseHeroResponse(response.choices[0].message.content);
            
            // Validate personality traits are within bounds
            this.validateHeroData(heroData);
            
            // Save to database with generation metadata
            await this.saveHeroToDatabase(worldId, heroData, prompt);
            
            return heroData;
            
        } catch (error) {
            console.error('Hero generation failed:', error);
            // Fallback to pre-generated hero templates
            return this.getFallbackHero();
        }
    }
    
    private validateHeroData(hero: HeroData): void {
        const personality = hero.personality;
        
        // Ensure all traits are within valid range
        Object.keys(personality).forEach(trait => {
            const value = personality[trait];
            if (value < 0 || value > 100) {
                throw new Error(`Invalid personality trait: ${trait} = ${value}`);
            }
        });
        
        // Ensure required fields exist
        if (!hero.name || !hero.class || !hero.backstory) {
            throw new Error('Missing required hero fields');
        }
    }
}
```

## Local Decision Engine

### Hero Decision Logic
While AI generates the personality, local algorithms handle moment-to-moment decisions:

```typescript
// src/server/systems/decision-engine.ts
export class HeroDecisionEngine {
    
    makeDecision(hero: Hero, availableActions: Action[], context: GameContext): Action {
        const scoredActions = availableActions.map(action => ({
            action,
            score: this.scoreAction(hero, action, context)
        }));
        
        // Sort by score and add some randomness
        scoredActions.sort((a, b) => b.score - a.score);
        
        // Top 3 actions get weighted random selection
        const topActions = scoredActions.slice(0, 3);
        return this.weightedRandomChoice(topActions);
    }
    
    private scoreAction(hero: Hero, action: Action, context: GameContext): number {
        let score = action.baseScore;
        
        // Personality modifiers
        switch (action.type) {
            case 'explore':
                score += (hero.personality.curiosity - 50) * 0.5;
                score += (hero.personality.courage - 50) * 0.3;
                break;
                
            case 'train':
                score += (hero.personality.patience - 50) * 0.4;
                score += (hero.personality.ambition - 50) * 0.3;
                break;
                
            case 'socialize':
                score += (hero.personality.empathy - 50) * 0.5;
                break;
                
            case 'rest':
                score += (100 - hero.energy) * 0.6;
                score -= (hero.personality.ambition - 50) * 0.2;
                break;
        }
        
        // Context modifiers
        if (hero.mood < 30 && action.type === 'rest') score += 20;
        if (hero.energy < 20 && action.type !== 'rest') score -= 30;
        
        // Relationship influences
        if (action.requiresPartner) {
            const partner = this.findBestPartner(hero, action);
            if (partner) {
                const relationship = this.getRelationshipStrength(hero, partner);
                score += relationship * 0.3;
            }
        }
        
        return Math.max(0, score);
    }
}
```

## AI Response Caching

### Cache Strategy
```typescript
// src/server/ai/ai-cache.ts
export class AIResponseCache {
    private cache = new Map<string, CachedResponse>();
    
    async getCachedResponse(prompt: string, type: 'world' | 'hero'): Promise<any> {
        const key = this.generateCacheKey(prompt, type);
        const cached = this.cache.get(key);
        
        if (cached && !this.isExpired(cached)) {
            return cached.data;
        }
        
        return null;
    }
    
    async cacheResponse(prompt: string, response: any, type: 'world' | 'hero'): Promise<void> {
        const key = this.generateCacheKey(prompt, type);
        
        this.cache.set(key, {
            data: response,
            timestamp: Date.now(),
            type,
            // World cache expires after 1 day, heroes after 1 hour
            ttl: type === 'world' ? 86400000 : 3600000
        });
    }
    
    private generateCacheKey(prompt: string, type: string): string {
        // Create hash of prompt for consistent caching
        const hash = crypto.createHash('md5').update(prompt).digest('hex');
        return `${type}:${hash}`;
    }
}
```

## Error Handling & Fallbacks

### Graceful Degradation
```typescript
export class AIService {
    
    async generateWithFallback<T>(
        generator: () => Promise<T>,
        fallback: () => T,
        retries: number = 2
    ): Promise<T> {
        
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await generator();
            } catch (error) {
                console.warn(`AI generation attempt ${attempt + 1} failed:`, error);
                
                if (attempt === retries - 1) {
                    console.info('Using fallback generation method');
                    return fallback();
                }
                
                // Wait before retry with exponential backoff
                await this.delay(Math.pow(2, attempt) * 1000);
            }
        }
        
        return fallback();
    }
    
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

## Cost Monitoring

### Usage Tracking
```typescript
// src/server/ai/usage-tracker.ts
export class AIUsageTracker {
    
    async trackUsage(userId: string, type: 'world' | 'hero', tokens: number, cost: number): Promise<void> {
        await this.db.aiUsage.create({
            data: {
                userId,
                type,
                tokens,
                cost,
                timestamp: new Date()
            }
        });
        
        // Alert if user exceeds monthly budget
        const monthlyUsage = await this.getMonthlyUsage(userId);
        if (monthlyUsage.cost > MONTHLY_BUDGET_LIMIT) {
            await this.sendBudgetAlert(userId, monthlyUsage);
        }
    }
    
    async getMonthlyUsage(userId: string): Promise<UsageSummary> {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        return await this.db.aiUsage.aggregate({
            where: {
                userId,
                timestamp: { gte: startOfMonth }
            },
            _sum: {
                tokens: true,
                cost: true
            },
            _count: true
        });
    }
}
```

## Quality Assurance

### AI Response Validation
```typescript
export class AIResponseValidator {
    
    validateWorldData(data: any): WorldValidationResult {
        const errors: string[] = [];
        
        if (!data.name || typeof data.name !== 'string') {
            errors.push('World must have a valid name');
        }
        
        if (!Array.isArray(data.biomes) || data.biomes.length < 2) {
            errors.push('World must have at least 2 biomes');
        }
        
        data.biomes?.forEach((biome, index) => {
            if (!biome.type || !biome.name) {
                errors.push(`Biome ${index} missing required fields`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    validateHeroData(data: any): HeroValidationResult {
        const errors: string[] = [];
        const requiredTraits = ['courage', 'greed', 'loyalty', 'curiosity', 'ambition', 'patience', 'empathy'];
        
        if (!data.personality || typeof data.personality !== 'object') {
            errors.push('Hero must have personality object');
            return { isValid: false, errors };
        }
        
        requiredTraits.forEach(trait => {
            const value = data.personality[trait];
            if (typeof value !== 'number' || value < 0 || value > 100) {
                errors.push(`Invalid personality trait: ${trait}`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
```

This AI integration strategy ensures high-quality, unique content generation while maintaining cost efficiency and system reliability through smart caching, fallbacks, and validation.