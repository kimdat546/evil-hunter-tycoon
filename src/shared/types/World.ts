export interface WorldLocation {
    id: string;
    name: string;
    type: 'dungeon' | 'town' | 'wilderness' | 'resource_node' | 'guild_hall';
    x: number;
    y: number;
    biome: 'forest' | 'mountain' | 'desert' | 'swamp';
    difficulty: number;   // 1-10
    resources: string[];
    monsters: string[];
    isDiscovered: boolean;
}

export interface WorldEvent {
    id: string;
    type: 'monster_invasion' | 'festival' | 'natural_disaster' | 'merchant_caravan';
    name: string;
    description: string;
    location: WorldLocation;
    startTime: Date;
    duration: number;     // in hours
    effects: Record<string, number>;
    isActive: boolean;
}

export interface Resource {
    id: string;
    name: string;
    type: 'material' | 'currency' | 'food' | 'potion';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    value: number;
    stackable: boolean;
}

export interface World {
    id: string;
    name: string;
    seed: string;
    createdAt: Date;
    locations: WorldLocation[];
    events: WorldEvent[];
    discoveredLocations: string[];
    totalResources: Record<string, number>;
    timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
    weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
}