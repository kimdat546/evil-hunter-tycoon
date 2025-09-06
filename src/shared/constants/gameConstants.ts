export const GAME_CONFIG = {
    // Hero system
    MAX_HEROES_PER_GUILD: 20,
    HERO_ACTION_INTERVAL: 5, // minutes
    ENERGY_REGEN_RATE: 1,    // per minute
    HEALTH_REGEN_RATE: 0.5,  // per minute

    // World system
    WORLD_UPDATE_INTERVAL: 10, // minutes
    MAX_ACTIVE_EVENTS: 3,
    EVENT_SPAWN_CHANCE: 0.1,   // 10% per update

    // Master system
    MAX_TRUST: 100,
    MAX_RESPECT: 100,
    MAX_FEAR: 100,
    INFLUENCE_DECAY_RATE: 0.1, // per hour

    // Guild system
    STARTING_RESOURCES: {
        gold: 1000,
        wood: 50,
        stone: 30,
        food: 100
    },
    FACILITY_BUILD_TIME: 60,   // minutes

    // Game balance
    BASE_EXPERIENCE_GAIN: 10,
    LEVEL_UP_MULTIPLIER: 1.5,
    QUEST_TIMEOUT_HOURS: 24
};

export const HERO_CLASSES = {
    BERSERKER: {
        name: 'Berserker',
        baseStats: { combat: 80, magic: 20, crafting: 30, exploration: 50 },
        preferredActions: ['train', 'quest'],
        personalityTendencies: { courage: 80, patience: 20 }
    },
    RANGER: {
        name: 'Ranger',
        baseStats: { combat: 60, magic: 40, crafting: 50, exploration: 80 },
        preferredActions: ['explore', 'quest'],
        personalityTendencies: { curiosity: 80, patience: 70 }
    },
    PALADIN: {
        name: 'Paladin',
        baseStats: { combat: 70, magic: 60, crafting: 40, exploration: 40 },
        preferredActions: ['train', 'socialize'],
        personalityTendencies: { loyalty: 90, empathy: 80 }
    },
    SORCERER: {
        name: 'Sorcerer',
        baseStats: { combat: 30, magic: 90, crafting: 60, exploration: 30 },
        preferredActions: ['train', 'craft'],
        personalityTendencies: { curiosity: 70, patience: 90 }
    },
    ROGUE: {
        name: 'Rogue',
        baseStats: { combat: 50, magic: 30, crafting: 70, exploration: 70 },
        preferredActions: ['explore', 'craft'],
        personalityTendencies: { greed: 70, curiosity: 60 }
    },
    CLERIC: {
        name: 'Cleric',
        baseStats: { combat: 40, magic: 80, crafting: 50, exploration: 40 },
        preferredActions: ['socialize', 'rest'],
        personalityTendencies: { empathy: 90, loyalty: 70 }
    }
};

export const BIOMES = {
    FOREST: {
        name: 'Forest',
        resources: ['wood', 'herbs', 'berries'],
        monsters: ['wolf', 'bear', 'treant'],
        difficulty_modifier: 1.0
    },
    MOUNTAIN: {
        name: 'Mountain',
        resources: ['stone', 'iron', 'gems'],
        monsters: ['dragon', 'giant', 'harpy'],
        difficulty_modifier: 1.5
    },
    DESERT: {
        name: 'Desert',
        resources: ['sand', 'crystal', 'cactus'],
        monsters: ['scorpion', 'mummy', 'sphinx'],
        difficulty_modifier: 1.3
    },
    SWAMP: {
        name: 'Swamp',
        resources: ['moss', 'poison', 'bones'],
        monsters: ['troll', 'witch', 'basilisk'],
        difficulty_modifier: 1.4
    }
};