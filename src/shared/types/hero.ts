// Simple Hero data model for Phase 2
export interface Hero {
    id: string;
    name: string;
    class: 'Berserker' | 'Ranger' | 'Paladin' | 'Sorcerer';
    level: number;
    health: number;
    maxHealth: number;
    position: {
        x: number;
        y: number;
    };
    currentAction: string;
    mood: number; // 0-100
}

// Simple personality traits (we'll expand this later)
export interface Personality {
    courage: number;    // 0-100
    loyalty: number;    // 0-100  
    curiosity: number;  // 0-100
}

// Expanded Hero with personality (for later phases)
export interface HeroWithPersonality extends Hero {
    personality: Personality;
    backstory?: string;
    goals?: string[];
}

// Hero creation data
export interface CreateHeroData {
    name: string;
    class: Hero['class'];
}

// Hero display colors for each class
export const HERO_CLASS_COLORS = {
    'Berserker': 0xff6b6b,  // Red
    'Ranger': 0x4ecdc4,     // Teal  
    'Paladin': 0xffd93d,    // Gold
    'Sorcerer': 0x9b59b6    // Purple
} as const;