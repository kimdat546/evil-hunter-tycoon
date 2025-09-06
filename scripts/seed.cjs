const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...');
        
        // Create test user
        const userId = '550e8400-e29b-41d4-a716-446655440000';
        await pool.query(`
            INSERT INTO users (id, username, email, password_hash) 
            VALUES ($1, 'testuser', 'test@example.com', '$2b$10$hash')
            ON CONFLICT (id) DO NOTHING
        `, [userId]);
        
        // Create test world
        const worldId = 'world_test_001';
        await pool.query(`
            INSERT INTO worlds (id, name, seed, player_id, locations, total_resources) 
            VALUES ($1, 'Test Realm', 'test_seed_123', $2, $3, $4)
            ON CONFLICT (id) DO NOTHING
        `, [
            worldId, 
            userId,
            JSON.stringify([
                {
                    id: 'loc_001',
                    name: 'Starting Village',
                    type: 'town',
                    biome: 'forest',
                    x: 500,
                    y: 500,
                    difficulty: 1,
                    resources: ['food', 'wood'],
                    monsters: [],
                    isDiscovered: true
                }
            ]),
            JSON.stringify({
                gold: 1000,
                wood: 50,
                stone: 30,
                food: 100
            })
        ]);
        
        // Create test guild
        const guildId = '660e8400-e29b-41d4-a716-446655440001';
        await pool.query(`
            INSERT INTO guilds (id, name, master_id, world_id, resources) 
            VALUES ($1, 'Test Guild', $2, $3, $4)
            ON CONFLICT (id) DO NOTHING
        `, [
            guildId,
            userId,
            worldId,
            JSON.stringify({
                gold: 500,
                wood: 25,
                stone: 15,
                food: 50
            })
        ]);
        
        console.log('✅ Database seeded successfully');
        console.log('📋 Test data created:');
        console.log(`   User ID: ${userId}`);
        console.log(`   World ID: ${worldId}`);
        console.log(`   Guild ID: ${guildId}`);
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seedDatabase();