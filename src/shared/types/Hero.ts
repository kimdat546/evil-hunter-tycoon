export interface PersonalityTraits {
    courage: number;      // 0-100: Willingness to fight strong enemies
    greed: number;        // 0-100: Desire for money/loot vs helping others
    loyalty: number;      // 0-100: How much they trust/obey the Master
    curiosity: number;    // 0-100: Exploration vs staying in safe areas
    ambition: number;     // 0-100: Personal goals vs team objectives
    patience: number;     // 0-100: Training thoroughly vs rushing into action
    empathy: number;      // 0-100: Helping wounded allies vs self-preservation
}

export interface HeroStats {
    level: number;
    experience: number;
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    combat: number;
    magic: number;
    crafting: number;
    exploration: number;
}

export interface HeroMasterRelation {
    trust: number;        // 0-100: Built through keeping promises
    respect: number;      // 0-100: Earned through successful leadership
    fear: number;         // 0-100: Can be effective but reduces creativity
}

export interface Hero {
    id: string;
    name: string;
    class: 'Berserker' | 'Ranger' | 'Paladin' | 'Sorcerer' | 'Rogue' | 'Cleric';
    personality: PersonalityTraits;
    stats: HeroStats;
    masterRelation: HeroMasterRelation;
    backstory: string;
    goals: string[];
    currentAction: string;
    location: { x: number; y: number };
    equipment: string[];
    relationships: Record<string, number>; // heroId -> relationship value (-100 to 100)
    mood: number;         // -100 to 100: Current emotional state
    lastActionTime: Date;
    isActive: boolean;
    guildId: string;
}

export interface HeroAction {
    heroId: string;
    action: 'train' | 'explore' | 'rest' | 'socialize' | 'craft' | 'quest';
    target?: string;
    duration: number;     // in minutes
    energyCost: number;
}

export interface HeroDecision {
    heroId: string;
    options: HeroAction[];
    chosenAction: HeroAction;
    reasoning: string;    // AI-generated explanation
    timestamp: Date;
}