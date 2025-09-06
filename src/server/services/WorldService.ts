import { World, WorldEvent } from '../../shared/types';
import { GeminiService } from '../ai/GeminiService';
import { pool } from '../database/connection';

export class WorldService {
    private static gemini: GeminiService;

    static initialize(geminiApiKey: string) {
        this.gemini = new GeminiService(geminiApiKey);
    }

    static async createWorld(playerId: string): Promise<World> {
        try {
            // Initialize Gemini service if not already done
            if (!this.gemini) {
                this.gemini = new GeminiService(process.env.GEMINI_API_KEY || '');
            }
            
            // Generate world using Gemini AI
            const worldData = await this.gemini.generateWorld(playerId);
            
            const world: Partial<World> = {
                id: `world_${Date.now()}_${playerId}`,
                name: worldData.name || 'Unnamed World',
                seed: worldData.seed || `seed_${Date.now()}`,
                createdAt: new Date(),
                locations: worldData.locations || [],
                events: worldData.events || [],
                discoveredLocations: [],
                totalResources: {
                    gold: 1000,
                    wood: 50,
                    stone: 30,
                    food: 100
                },
                timeOfDay: 'morning',
                weather: 'sunny'
            };

            // Save to database
            const query = `
                INSERT INTO worlds (id, name, seed, player_id, locations, events, discovered_locations, total_resources, time_of_day, weather, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `;

            const result = await pool.query(query, [
                world.id,
                world.name,
                world.seed,
                playerId,
                JSON.stringify(world.locations),
                JSON.stringify(world.events),
                JSON.stringify(world.discoveredLocations),
                JSON.stringify(world.totalResources),
                world.timeOfDay,
                world.weather,
                world.createdAt
            ]);

            return result.rows[0];
        } catch (error) {
            console.error('Error creating world:', error);
            throw error;
        }
    }

    static async getWorldState(worldId: string) {
        try {
            const result = await pool.query('SELECT * FROM worlds WHERE id = $1', [worldId]);
            
            if (result.rows.length === 0) {
                throw new Error('World not found');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error getting world state:', error);
            throw error;
        }
    }

    static async updateWorldTime(worldId: string) {
        const timeProgression = ['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'];
        
        try {
            const worldResult = await pool.query('SELECT time_of_day FROM worlds WHERE id = $1', [worldId]);
            const currentTime = worldResult.rows[0].time_of_day;
            const currentIndex = timeProgression.indexOf(currentTime);
            const nextTime = timeProgression[(currentIndex + 1) % timeProgression.length];

            await pool.query('UPDATE worlds SET time_of_day = $1 WHERE id = $2', [nextTime, worldId]);
            
            return nextTime;
        } catch (error) {
            console.error('Error updating world time:', error);
            throw error;
        }
    }

    static async spawnRandomEvent(worldId: string): Promise<WorldEvent | null> {
        // 10% chance to spawn an event
        if (Math.random() > 0.1) {
            return null;
        }

        try {
            const worldResult = await pool.query('SELECT * FROM worlds WHERE id = $1', [worldId]);
            const world = worldResult.rows[0];
            
            // Generate random event using AI (simplified for now)
            const eventTypes = ['monster_invasion', 'festival', 'natural_disaster', 'merchant_caravan'];
            const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            
            const event: WorldEvent = {
                id: `event_${Date.now()}`,
                type: randomType as any,
                name: `Random ${randomType.replace('_', ' ')}`,
                description: `A ${randomType.replace('_', ' ')} has occurred!`,
                location: world.locations[0], // Use first location for simplicity
                startTime: new Date(),
                duration: 24, // 24 hours
                effects: { resource_gain: 1.2 },
                isActive: true
            };

            // Add event to world
            const events = JSON.parse(world.events);
            events.push(event);
            
            await pool.query('UPDATE worlds SET events = $1 WHERE id = $2', [
                JSON.stringify(events),
                worldId
            ]);

            return event;
        } catch (error) {
            console.error('Error spawning random event:', error);
            return null;
        }
    }
}