import { Server, Socket } from 'socket.io';
import { HeroService } from '../services/HeroService';
import { WorldService } from '../services/WorldService';

export function setupSocketHandlers(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // Join a guild room
        socket.on('join:guild', (guildId: string) => {
            socket.join(`guild:${guildId}`);
            console.log(`User ${socket.id} joined guild ${guildId}`);
        });

        // Hero updates
        socket.on('hero:action', async (data) => {
            try {
                const result = await HeroService.processHeroAction(data);
                io.to(`guild:${data.guildId}`).emit('hero:update', result);
            } catch (error) {
                socket.emit('error', { message: 'Failed to process hero action' });
            }
        });

        // World updates
        socket.on('world:query', async (data) => {
            try {
                const worldState = await WorldService.getWorldState(data.worldId);
                socket.emit('world:state', worldState);
            } catch (error) {
                socket.emit('error', { message: 'Failed to get world state' });
            }
        });

        // Master commands
        socket.on('master:command', async (data) => {
            try {
                const result = await HeroService.processMasterCommand(data);
                io.to(`guild:${data.guildId}`).emit('master:result', result);
            } catch (error) {
                socket.emit('error', { message: 'Failed to process master command' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });
}