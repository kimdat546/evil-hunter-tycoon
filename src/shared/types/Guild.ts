export interface GuildFacility {
    id: string;
    type: 'training_room' | 'workshop' | 'tavern' | 'library' | 'infirmary';
    level: number;
    effects: Record<string, number>;
    cost: number;
    isBuilt: boolean;
}

export interface Guild {
    id: string;
    name: string;
    masterId: string;
    worldId: string;
    level: number;
    experience: number;
    reputation: number;
    resources: Record<string, number>;
    facilities: GuildFacility[];
    heroIds: string[];
    policies: string[];
    createdAt: Date;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'combat' | 'exploration' | 'crafting' | 'social';
    difficulty: number;
    rewards: Record<string, number>;
    requirements: string[];
    assignedHeroIds: string[];
    status: 'available' | 'in_progress' | 'completed' | 'failed';
    timeLimit?: number;   // in hours
    createdAt: Date;
}