-- AI Hero Tycoon Database Schema
-- PostgreSQL 15+

-- Users/Players table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Worlds table
CREATE TABLE IF NOT EXISTS worlds (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    seed VARCHAR(50) NOT NULL,
    player_id UUID REFERENCES users(id) ON DELETE CASCADE,
    locations JSONB DEFAULT '[]',
    events JSONB DEFAULT '[]',
    discovered_locations JSONB DEFAULT '[]',
    total_resources JSONB DEFAULT '{}',
    time_of_day VARCHAR(20) DEFAULT 'morning',
    weather VARCHAR(20) DEFAULT 'sunny',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guilds table
CREATE TABLE IF NOT EXISTS guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    master_id UUID REFERENCES users(id) ON DELETE CASCADE,
    world_id VARCHAR(100) REFERENCES worlds(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    reputation INTEGER DEFAULT 0,
    resources JSONB DEFAULT '{}',
    facilities JSONB DEFAULT '[]',
    policies JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Heroes table
CREATE TABLE IF NOT EXISTS heroes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    class VARCHAR(20) NOT NULL CHECK (class IN ('Berserker', 'Ranger', 'Paladin', 'Sorcerer', 'Rogue', 'Cleric')),
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    personality JSONB NOT NULL, -- PersonalityTraits object
    stats JSONB NOT NULL,       -- HeroStats object
    master_relation JSONB NOT NULL, -- HeroMasterRelation object
    backstory TEXT,
    goals JSONB DEFAULT '[]',
    current_action VARCHAR(50) DEFAULT 'rest',
    location JSONB DEFAULT '{"x": 0, "y": 0}',
    equipment JSONB DEFAULT '[]',
    relationships JSONB DEFAULT '{}', -- heroId -> relationship value
    mood INTEGER DEFAULT 0 CHECK (mood >= -100 AND mood <= 100),
    last_action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hero Actions Log table
CREATE TABLE IF NOT EXISTS hero_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hero_id UUID REFERENCES heroes(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    target VARCHAR(100),
    duration INTEGER, -- in minutes
    energy_cost INTEGER,
    result JSONB,
    reasoning TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('combat', 'exploration', 'crafting', 'social')),
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
    rewards JSONB DEFAULT '{}',
    requirements JSONB DEFAULT '[]',
    assigned_hero_ids JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_progress', 'completed', 'failed')),
    time_limit INTEGER, -- in hours
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- World Events table
CREATE TABLE IF NOT EXISTS world_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    world_id VARCHAR(100) REFERENCES worlds(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location JSONB,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER, -- in hours
    effects JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE
);

-- Game Sessions table (for tracking offline progress)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    actions_performed INTEGER DEFAULT 0,
    resources_gained JSONB DEFAULT '{}'
);

-- AI Decisions Log (for debugging and learning)
CREATE TABLE IF NOT EXISTS ai_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hero_id UUID REFERENCES heroes(id) ON DELETE CASCADE,
    context JSONB,
    available_actions JSONB,
    chosen_action VARCHAR(50),
    reasoning TEXT,
    personality_factors JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_heroes_guild_id ON heroes(guild_id);
CREATE INDEX IF NOT EXISTS idx_heroes_is_active ON heroes(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_actions_hero_id ON hero_actions(hero_id);
CREATE INDEX IF NOT EXISTS idx_hero_actions_timestamp ON hero_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_quests_guild_id ON quests(guild_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
CREATE INDEX IF NOT EXISTS idx_world_events_world_id ON world_events(world_id);
CREATE INDEX IF NOT EXISTS idx_world_events_is_active ON world_events(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_hero_id ON ai_decisions(hero_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_timestamp ON ai_decisions(timestamp);

-- Sample data for testing (optional)
-- INSERT INTO users (id, username, email, password_hash) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440000', 'testuser', 'test@example.com', '$2b$10$hash');

-- Views for common queries
CREATE OR REPLACE VIEW active_heroes AS
SELECT h.*, g.name as guild_name, g.master_id
FROM heroes h
JOIN guilds g ON h.guild_id = g.id
WHERE h.is_active = TRUE;

CREATE OR REPLACE VIEW guild_summary AS
SELECT 
    g.id,
    g.name,
    g.level,
    g.reputation,
    COUNT(h.id) as hero_count,
    AVG((h.stats->>'level')::int) as avg_hero_level,
    g.resources
FROM guilds g
LEFT JOIN heroes h ON g.id = h.guild_id AND h.is_active = TRUE
GROUP BY g.id, g.name, g.level, g.reputation, g.resources;