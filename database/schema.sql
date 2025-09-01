-- AI Hero Tycoon Database Schema
-- PostgreSQL 15+ compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USER MANAGEMENT
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- WORLD SYSTEM
-- ============================================================================

CREATE TABLE worlds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    seed INTEGER NOT NULL, -- For procedural generation consistency
    world_data JSONB NOT NULL, -- AI-generated world structure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    world_time BIGINT DEFAULT 0, -- Game world time in seconds
    world_state JSONB DEFAULT '{}', -- Current world state
    generation_prompt TEXT, -- Store the AI prompt used
    CONSTRAINT unique_user_world_name UNIQUE (user_id, name)
);

CREATE INDEX idx_worlds_user_id ON worlds(user_id);
CREATE INDEX idx_worlds_last_active ON worlds(last_active_at);
CREATE INDEX idx_world_data_gin ON worlds USING GIN (world_data);

-- ============================================================================
-- GUILD SYSTEM
-- ============================================================================

CREATE TABLE guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Hero Guild',
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    gold INTEGER DEFAULT 1000,
    reputation INTEGER DEFAULT 0,
    policies JSONB DEFAULT '{}', -- Guild management policies
    facilities JSONB DEFAULT '{}', -- Buildings and upgrades
    resources JSONB DEFAULT '{}', -- Materials, items, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guilds_world_id ON guilds(world_id);

-- ============================================================================
-- HERO SYSTEM
-- ============================================================================

CREATE TABLE heroes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL, -- Berserker, Ranger, Paladin, Sorcerer
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    
    -- Core Stats
    health INTEGER DEFAULT 100,
    max_health INTEGER DEFAULT 100,
    mana INTEGER DEFAULT 50,
    max_mana INTEGER DEFAULT 50,
    attack INTEGER DEFAULT 10,
    defense INTEGER DEFAULT 5,
    speed INTEGER DEFAULT 10,
    
    -- AI Personality System (0-100 scale)
    personality JSONB NOT NULL DEFAULT '{
        "courage": 50,
        "greed": 50,
        "loyalty": 50,
        "curiosity": 50,
        "ambition": 50,
        "patience": 50,
        "empathy": 50
    }',
    
    -- AI Generated Content
    backstory TEXT,
    motivation VARCHAR(100),
    goals JSONB DEFAULT '[]', -- Array of goal objects
    generation_prompt TEXT, -- Store AI prompt for consistency
    
    -- Current State
    current_location VARCHAR(100) DEFAULT 'Guild Hall',
    current_action VARCHAR(100) DEFAULT 'Idle',
    action_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    energy INTEGER DEFAULT 100,
    mood INTEGER DEFAULT 50, -- -100 to +100
    
    -- Equipment & Inventory
    equipment JSONB DEFAULT '{}',
    inventory JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_decision_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_personality CHECK (
        (personality->>'courage')::INTEGER BETWEEN 0 AND 100 AND
        (personality->>'greed')::INTEGER BETWEEN 0 AND 100 AND
        (personality->>'loyalty')::INTEGER BETWEEN 0 AND 100 AND
        (personality->>'curiosity')::INTEGER BETWEEN 0 AND 100 AND
        (personality->>'ambition')::INTEGER BETWEEN 0 AND 100 AND
        (personality->>'patience')::INTEGER BETWEEN 0 AND 100 AND
        (personality->>'empathy')::INTEGER BETWEEN 0 AND 100
    )
);

CREATE INDEX idx_heroes_world_id ON heroes(world_id);
CREATE INDEX idx_heroes_guild_id ON guilds(id);
CREATE INDEX idx_heroes_class ON heroes(class);
CREATE INDEX idx_heroes_current_action ON heroes(current_action);
CREATE INDEX idx_heroes_last_decision ON heroes(last_decision_at);
CREATE INDEX idx_personality_gin ON heroes USING GIN (personality);

-- ============================================================================
-- HERO RELATIONSHIPS
-- ============================================================================

CREATE TABLE hero_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_id UUID NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
    target_hero_id UUID NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'friendship', 'rivalry', 'romantic', 'mentor'
    strength INTEGER DEFAULT 0, -- -100 to +100 (negative = dislike)
    formed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    events JSONB DEFAULT '[]', -- History of relationship events
    
    CONSTRAINT no_self_relationship CHECK (hero_id != target_hero_id),
    CONSTRAINT unique_relationship UNIQUE (hero_id, target_hero_id, relationship_type),
    CONSTRAINT valid_strength CHECK (strength BETWEEN -100 AND 100)
);

CREATE INDEX idx_relationships_hero_id ON hero_relationships(hero_id);
CREATE INDEX idx_relationships_target ON hero_relationships(target_hero_id);
CREATE INDEX idx_relationships_type ON hero_relationships(relationship_type);

-- ============================================================================
-- ACTIVITY & DECISION LOGGING
-- ============================================================================

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    hero_id UUID REFERENCES heroes(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    world_time BIGINT NOT NULL, -- When it happened in game time
    real_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    experience_gained INTEGER DEFAULT 0,
    resources_changed JSONB DEFAULT '{}',
    mood_change INTEGER DEFAULT 0
);

CREATE INDEX idx_activity_world_id ON activity_log(world_id);
CREATE INDEX idx_activity_hero_id ON activity_log(hero_id);
CREATE INDEX idx_activity_type ON activity_log(activity_type);
CREATE INDEX idx_activity_world_time ON activity_log(world_time);
CREATE INDEX idx_activity_real_time ON activity_log(real_time);

-- ============================================================================
-- HERO DECISIONS & AI SYSTEM
-- ============================================================================

CREATE TABLE hero_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_id UUID NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
    decision_context JSONB NOT NULL, -- What the hero was considering
    available_options JSONB NOT NULL, -- Array of possible actions
    chosen_action JSONB NOT NULL, -- What the hero decided to do
    reasoning TEXT, -- AI-generated explanation of why
    personality_factors JSONB DEFAULT '{}', -- Which traits influenced this
    outcome JSONB DEFAULT '{}', -- Results of the action
    satisfaction_rating INTEGER, -- How happy the hero was with result (0-100)
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_decisions_hero_id ON hero_decisions(hero_id);
CREATE INDEX idx_decisions_timestamp ON hero_decisions(timestamp);
CREATE INDEX idx_decision_context_gin ON hero_decisions USING GIN (decision_context);

-- ============================================================================
-- MASTER INFLUENCE SYSTEM
-- ============================================================================

CREATE TABLE master_influence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_id UUID NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
    trust_level INTEGER DEFAULT 50, -- 0-100
    respect_level INTEGER DEFAULT 50, -- 0-100  
    fear_level INTEGER DEFAULT 0, -- 0-100
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    influence_history JSONB DEFAULT '[]', -- Track changes over time
    
    CONSTRAINT valid_trust CHECK (trust_level BETWEEN 0 AND 100),
    CONSTRAINT valid_respect CHECK (respect_level BETWEEN 0 AND 100),
    CONSTRAINT valid_fear CHECK (fear_level BETWEEN 0 AND 100),
    CONSTRAINT unique_hero_influence UNIQUE (hero_id)
);

CREATE INDEX idx_influence_hero_id ON master_influence(hero_id);
CREATE INDEX idx_influence_trust ON master_influence(trust_level);
CREATE INDEX idx_influence_respect ON master_influence(respect_level);

-- ============================================================================
-- QUESTS & BOUNTIES
-- ============================================================================

CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    created_by_user BOOLEAN DEFAULT true, -- False if AI-generated
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    quest_type VARCHAR(50) NOT NULL, -- 'exploration', 'combat', 'crafting', 'social'
    difficulty INTEGER DEFAULT 1, -- 1-10 scale
    requirements JSONB DEFAULT '{}', -- Level, equipment, personality requirements
    rewards JSONB NOT NULL, -- Gold, experience, items, etc.
    time_limit INTEGER, -- Hours to complete (NULL = no limit)
    max_participants INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'in_progress', 'completed', 'failed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_quests_world_id ON quests(world_id);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quests_difficulty ON quests(difficulty);
CREATE INDEX idx_quests_type ON quests(quest_type);

-- ============================================================================
-- QUEST ASSIGNMENTS & PROGRESS
-- ============================================================================

CREATE TABLE quest_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    hero_id UUID NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'assigned', -- 'assigned', 'accepted', 'rejected', 'in_progress', 'completed', 'failed'
    progress JSONB DEFAULT '{}', -- Track completion progress
    hero_motivation TEXT, -- Why the hero accepted/rejected
    
    CONSTRAINT unique_hero_quest UNIQUE (quest_id, hero_id)
);

CREATE INDEX idx_assignments_quest_id ON quest_assignments(quest_id);
CREATE INDEX idx_assignments_hero_id ON quest_assignments(hero_id);
CREATE INDEX idx_assignments_status ON quest_assignments(status);

-- ============================================================================
-- WORLD EVENTS
-- ============================================================================

CREATE TABLE world_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'monster_invasion', 'festival', 'natural_disaster', 'merchant_visit'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_data JSONB DEFAULT '{}', -- Specific event parameters
    world_effects JSONB DEFAULT '{}', -- How it affects the world
    hero_effects JSONB DEFAULT '{}', -- How it affects heroes
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_by_ai BOOLEAN DEFAULT false
);

CREATE INDEX idx_events_world_id ON world_events(world_id);
CREATE INDEX idx_events_type ON world_events(event_type);
CREATE INDEX idx_events_active ON world_events(is_active);
CREATE INDEX idx_events_time ON world_events(start_time, end_time);

-- ============================================================================
-- USER SESSIONS & OFFLINE TRACKING
-- ============================================================================

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    world_time_start BIGINT NOT NULL,
    world_time_end BIGINT,
    actions_taken INTEGER DEFAULT 0,
    ai_calls_made INTEGER DEFAULT 0
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_world_id ON user_sessions(world_id);
CREATE INDEX idx_sessions_start ON user_sessions(session_start);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON guilds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate hero's overall happiness
CREATE OR REPLACE FUNCTION calculate_hero_happiness(hero_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    hero_record heroes%ROWTYPE;
    happiness INTEGER;
    trust INTEGER;
    respect INTEGER;
    fear INTEGER;
BEGIN
    -- Get hero data
    SELECT * INTO hero_record FROM heroes WHERE id = hero_uuid;
    
    -- Get master influence
    SELECT trust_level, respect_level, fear_level 
    INTO trust, respect, fear 
    FROM master_influence 
    WHERE hero_id = hero_uuid;
    
    -- Calculate happiness based on personality, mood, and master relationship
    happiness := hero_record.mood;
    
    -- Adjust based on master influence
    IF trust > 70 THEN happiness := happiness + 10; END IF;
    IF respect > 70 THEN happiness := happiness + 10; END IF;
    IF fear > 70 THEN happiness := happiness - 15; END IF;
    
    -- Ensure within bounds
    happiness := GREATEST(0, LEAST(100, happiness));
    
    RETURN happiness;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active heroes with current status
CREATE VIEW active_heroes AS
SELECT 
    h.*,
    mi.trust_level,
    mi.respect_level,
    mi.fear_level,
    calculate_hero_happiness(h.id) as happiness,
    g.name as guild_name
FROM heroes h
LEFT JOIN master_influence mi ON h.id = mi.hero_id
LEFT JOIN guilds g ON h.guild_id = g.id
WHERE h.health > 0;

-- Recent activity summary
CREATE VIEW recent_activity AS
SELECT 
    al.*,
    h.name as hero_name,
    w.name as world_name
FROM activity_log al
JOIN heroes h ON al.hero_id = h.id
JOIN worlds w ON al.world_id = w.id
WHERE al.real_time > NOW() - INTERVAL '24 hours'
ORDER BY al.real_time DESC;

-- Hero relationship summary
CREATE VIEW hero_social_network AS
SELECT 
    h1.name as hero_name,
    h2.name as target_name,
    hr.relationship_type,
    hr.strength,
    hr.last_interaction_at
FROM hero_relationships hr
JOIN heroes h1 ON hr.hero_id = h1.id
JOIN heroes h2 ON hr.target_hero_id = h2.id
ORDER BY hr.strength DESC;

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT (OPTIONAL)
-- ============================================================================

-- Insert sample data for development/testing
-- This section can be removed for production

-- Sample user
INSERT INTO users (email, username, password_hash) VALUES 
('dev@example.com', 'developer', crypt('password123', gen_salt('bf')));

-- Note: Additional sample data would be inserted here during development setup