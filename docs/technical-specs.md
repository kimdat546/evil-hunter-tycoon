# Technical Specifications - AI Hero Tycoon

## Technology Stack

### Frontend
- **PixiJS 8.x**: 2D WebGL rendering engine with WebGPU support
- **TypeScript 5.x**: Type-safe JavaScript development
- **Vite**: Fast build tool and dev server
- **PixiJS UI**: Professional UI components library
- **Socket.io Client**: Real-time server communication

### Backend
- **Node.js 20.x**: JavaScript runtime
- **Express.js**: Web framework
- **Socket.io**: Real-time bidirectional communication
- **TypeScript**: Shared type definitions
- **node-cron**: Scheduled world simulation tasks

### Database & Storage
- **PostgreSQL**: Primary database (via Supabase)
- **Redis**: Caching and session storage (optional)
- **JSON Files**: Configuration and templates

### AI Services
- **OpenAI GPT-4**: World and hero generation
- **Claude 3**: Alternative AI provider for content
- **Local Algorithms**: Performance-critical game logic

### Hosting & Deployment
- **Vercel**: Frontend static hosting (free tier)
- **Railway**: Backend Node.js hosting (free tier) 
- **Supabase**: Database and authentication (free tier)

## Architecture Overview

### Client-Server Communication
```typescript
// Real-time events via Socket.io
interface GameEvents {
  'hero-action': HeroActionEvent;
  'world-update': WorldUpdateEvent;
  'offline-progress': OfflineProgressEvent;
  'ai-generation': AIGenerationEvent;
}

// REST API for state management
interface APIEndpoints {
  GET    '/api/world/:worldId': WorldState;
  POST   '/api/hero/summon': CreateHeroRequest;
  PUT    '/api/guild/policy': UpdatePolicyRequest;
  GET    '/api/offline-progress/:playerId': OfflineProgressResponse;
}
```

### Data Flow Architecture
```
[PixiJS Client] ↔ [Socket.io] ↔ [Node.js Server] ↔ [PostgreSQL]
      ↑                              ↓
[Local Game State]           [AI Services (OpenAI/Claude)]
      ↑                              ↓
[Visual Rendering]           [Background World Simulator]
```

## Performance Requirements

### Client Performance
- **Target FPS**: 60 FPS steady with 100+ heroes on screen
- **Memory Usage**: < 512MB for mobile devices
- **Load Time**: < 3 seconds initial load
- **Bundle Size**: < 2MB compressed

### Server Performance
- **Concurrent Users**: 1000+ simultaneous connections
- **Response Time**: < 100ms for game actions
- **World Simulation**: Updates every 5 minutes maximum
- **AI API Calls**: < 10 calls per player session

### Scalability Targets
- **Heroes per World**: 500+ with smooth performance
- **Concurrent Worlds**: 10,000+ active worlds
- **Database Growth**: Support years of gameplay data

## Security Considerations

### Client Security
- All critical game logic on server
- Client validates input but server authorizes
- No sensitive data stored in localStorage
- WebSocket authentication tokens

### Server Security
- API rate limiting (100 requests/minute per IP)
- Input validation and sanitization
- SQL injection protection via parameterized queries
- Environment variables for API keys

### AI Integration Security
- API keys stored in environment variables
- Request filtering to prevent prompt injection
- Response validation and sanitization
- Cost monitoring and limits

## Development Environment Setup

### Prerequisites
```bash
# Required software
Node.js 20.x or higher
npm 10.x or higher
PostgreSQL 15.x (or Supabase account)
Git 2.x
```

### Environment Variables
```bash
# .env.development
DATABASE_URL=postgresql://localhost:5432/hero_tycoon
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=claude-...
JWT_SECRET=your-jwt-secret
SOCKET_PORT=3001
CLIENT_URL=http://localhost:3000
```

### Package Manager
- **Primary**: npm (for consistency)
- **Lockfile**: package-lock.json committed to repo
- **Node Version**: Managed via .nvmrc file

## Code Standards

### TypeScript Configuration
- **Strict Mode**: Enabled for type safety
- **Target**: ES2022 for modern JavaScript features
- **Module**: ESNext with bundler module resolution
- **Shared Types**: Common interfaces in src/shared/types

### Code Style
- **ESLint**: Airbnb configuration with TypeScript
- **Prettier**: Automated code formatting
- **File Naming**: kebab-case for files, PascalCase for classes
- **Import Style**: Absolute imports with path mapping

### Git Workflow
- **Branching**: feature/feature-name, bugfix/bug-name
- **Commits**: Conventional Commits standard
- **Pull Requests**: Required for main branch
- **CI/CD**: Automated testing and deployment

## Testing Strategy

### Unit Testing
- **Framework**: Jest + Testing Library
- **Coverage**: 80%+ for critical business logic
- **Mocking**: AI API calls and database operations
- **Scope**: Individual functions and components

### Integration Testing
- **Database**: Test with real PostgreSQL instance
- **API**: End-to-end API endpoint testing
- **WebSocket**: Real-time communication testing
- **AI Integration**: Mocked but realistic responses

### Performance Testing
- **Load Testing**: Artillery.js for server load
- **Memory Profiling**: Browser dev tools for client
- **Database Performance**: Query optimization analysis
- **AI Response Time**: Monitor and optimize API calls

## Deployment Pipeline

### Development
```bash
npm run dev        # Start both client and server
npm run test       # Run test suite
npm run lint       # Code quality check
npm run build      # Production build
```

### Staging
- **Automatic**: Deploy on push to `develop` branch
- **Environment**: Staging database and API keys
- **Testing**: Automated integration tests
- **Review**: Manual QA before production

### Production
- **Triggers**: Manual deployment from `main` branch
- **Zero-downtime**: Blue/green deployment strategy
- **Monitoring**: Error tracking and performance metrics
- **Rollback**: Automatic rollback on failure detection

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Sentry for client and server errors
- **Performance**: Web Vitals for client performance
- **Uptime**: Health checks every 30 seconds
- **Logs**: Structured logging with log levels

### Game Analytics
- **Player Behavior**: Custom events via analytics
- **AI Performance**: Track AI response quality
- **Gameplay Metrics**: Session length, retention rates
- **Business Metrics**: User acquisition and engagement

### Cost Monitoring
- **AI API Usage**: Track tokens and costs
- **Database Usage**: Monitor storage and queries
- **Hosting Costs**: Alert on usage spikes
- **Performance Budget**: Stay within free tier limits

## Future Architecture Considerations

### Scalability Improvements
- **Microservices**: Split into world-sim, ai-service, game-api
- **Horizontal Scaling**: Multiple server instances
- **CDN**: Static asset distribution
- **Database Sharding**: Split by world regions

### Advanced Features
- **WebRTC**: Direct peer-to-peer for multiplayer
- **Service Workers**: Offline gameplay capability
- **WebAssembly**: Performance-critical algorithms
- **Machine Learning**: Local AI model inference