import { Hero, HeroAction, HeroDecision } from '../../shared/types';
import { GeminiService } from '../ai/GeminiService';
import { pool } from '../database/connection';

export class HeroService {
    private static gemini: GeminiService;

    static initialize(geminiApiKey: string) {
        this.gemini = new GeminiService(geminiApiKey);
    }

    static async processHeroAction(data: any) {
        const { heroId, action, guildId } = data;
        
        try {
            // Get hero from database
            const heroResult = await pool.query('SELECT * FROM heroes WHERE id = $1', [heroId]);
            if (heroResult.rows.length === 0) {
                throw new Error('Hero not found');
            }

            const hero: Hero = heroResult.rows[0];
            
            // Process the action based on type
            let result;
            switch (action) {
                case 'train':
                    result = await this.processTraining(hero);
                    break;
                case 'explore':
                    result = await this.processExploration(hero);
                    break;
                case 'rest':
                    result = await this.processRest(hero);
                    break;
                case 'socialize':
                    result = await this.processSocializing(hero, guildId);
                    break;
                default:
                    throw new Error('Unknown action type');
            }

            // Update hero in database
            await this.updateHero(hero);
            
            return result;
        } catch (error) {
            console.error('Error processing hero action:', error);
            throw error;
        }
    }

    static async processMasterCommand(data: any) {
        const { command, guildId, target } = data;
        
        // Process master commands like assigning quests, building facilities, etc.
        return { success: true, message: `Master command ${command} processed` };
    }

    static async makeHeroDecision(hero: Hero, context: any): Promise<HeroDecision> {
        const availableActions = ['train', 'explore', 'rest', 'socialize', 'craft', 'quest'];
        
        const decision = await this.gemini.makeHeroDecision(hero, availableActions, context);
        
        return {
            heroId: hero.id,
            options: [], // Would be populated with available actions
            chosenAction: {
                heroId: hero.id,
                action: decision.chosenAction as any,
                duration: 60,
                energyCost: 20
            },
            reasoning: decision.reasoning,
            timestamp: new Date()
        };
    }

    private static async processTraining(hero: Hero) {
        // Simulate training - increase stats, consume energy
        hero.stats.energy -= 20;
        hero.stats.combat += 1;
        hero.stats.experience += 10;
        
        return {
            action: 'training',
            result: 'Hero completed training session',
            statChanges: { combat: +1, experience: +10, energy: -20 }
        };
    }

    private static async processExploration(hero: Hero) {
        // Simulate exploration - chance of finding resources, increase exploration stat
        hero.stats.energy -= 30;
        hero.stats.exploration += 1;
        hero.stats.experience += 15;
        
        return {
            action: 'exploration',
            result: 'Hero explored new areas',
            statChanges: { exploration: +1, experience: +15, energy: -30 }
        };
    }

    private static async processRest(hero: Hero) {
        // Restore energy and health
        hero.stats.energy = Math.min(hero.stats.maxEnergy, hero.stats.energy + 40);
        hero.stats.health = Math.min(hero.stats.maxHealth, hero.stats.health + 20);
        
        return {
            action: 'rest',
            result: 'Hero restored energy and health',
            statChanges: { energy: +40, health: +20 }
        };
    }

    private static async processSocializing(hero: Hero, guildId: string) {
        // Improve mood and relationships with other heroes
        hero.mood = Math.min(100, hero.mood + 10);
        hero.stats.energy -= 10;
        
        return {
            action: 'socializing',
            result: 'Hero socialized with guild members',
            statChanges: { mood: +10, energy: -10 }
        };
    }

    private static async updateHero(hero: Hero) {
        const query = `
            UPDATE heroes SET 
                stats = $1, 
                mood = $2, 
                last_action_time = $3,
                master_relation = $4
            WHERE id = $5
        `;
        
        await pool.query(query, [
            JSON.stringify(hero.stats),
            hero.mood,
            new Date(),
            JSON.stringify(hero.masterRelation),
            hero.id
        ]);
    }
}