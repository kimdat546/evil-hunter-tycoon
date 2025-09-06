export * from './Hero';
export * from './World';
export * from './Guild';

// Socket event types
export interface SocketEvents {
    // Client to server
    'join:guild': (guildId: string) => void;
    'hero:action': (data: { heroId: string; action: string; guildId: string }) => void;
    'world:query': (data: { worldId: string }) => void;
    'master:command': (data: { command: string; guildId: string; target?: string }) => void;

    // Server to client
    'hero:update': (data: any) => void;
    'world:state': (data: any) => void;
    'master:result': (data: any) => void;
    'error': (data: { message: string }) => void;
}