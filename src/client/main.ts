import { Application, Container, Graphics, Text } from 'pixi.js';
import type { Hero } from '@shared/types';
import { HERO_CLASS_COLORS } from '@shared/types';

// Very simple PixiJS Hello World application
class SimpleGame {
    private app: Application;
    private heroes: Hero[] = [];
    private heroSprites: Map<string, Graphics> = new Map();

    constructor() {
        this.app = new Application();
    }

    async init(): Promise<void> {
        // Initialize PixiJS Application
        await this.app.init({
            width: 800,
            height: 600,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1,
        });

        // Add canvas to DOM
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.app.canvas);
        }

        // Create sample heroes
        this.createSampleHeroes();
        
        // Create simple content
        this.createSimpleContent();
        
        console.log('🎮 AI Hero Tycoon - Simple Demo Started!');
        console.log(`👥 Created ${this.heroes.length} heroes:`, this.heroes.map(h => `${h.name} (${h.class})`));
    }

    private createSampleHeroes(): void {
        // Create 3 sample heroes with different classes
        this.heroes = [
            {
                id: 'hero-1',
                name: 'Aria',
                class: 'Ranger',
                level: 1,
                health: 100,
                maxHealth: 100,
                position: { x: 350, y: 250 },
                currentAction: 'Idle',
                mood: 75
            },
            {
                id: 'hero-2', 
                name: 'Thane',
                class: 'Berserker',
                level: 1,
                health: 120,
                maxHealth: 120,
                position: { x: 450, y: 250 },
                currentAction: 'Training',
                mood: 60
            },
            {
                id: 'hero-3',
                name: 'Lyra',
                class: 'Sorcerer',
                level: 1,
                health: 80,
                maxHealth: 80,
                position: { x: 400, y: 300 },
                currentAction: 'Studying',
                mood: 85
            }
        ];
    }

    private createSimpleContent(): void {
        // Create a container for our game objects
        const gameContainer = new Container();
        this.app.stage.addChild(gameContainer);

        // Create title text
        const titleText = new Text({
            text: 'AI Hero Tycoon',
            style: {
                fontFamily: 'Arial',
                fontSize: 48,
                fill: 0xffffff,
                align: 'center'
            }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(this.app.screen.width / 2, 100);
        gameContainer.addChild(titleText);

        // Create subtitle
        const subtitleText = new Text({
            text: 'Phase 1 - Hello World Demo',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xcccccc,
                align: 'center'
            }
        });
        subtitleText.anchor.set(0.5);
        subtitleText.position.set(this.app.screen.width / 2, 160);
        gameContainer.addChild(subtitleText);

        // Create hero sprites from data
        this.createHeroSprites(gameContainer);

        // Create a simple building rectangle
        const buildingRect = new Graphics()
            .rect(0, 0, 100, 60)
            .fill(0x4ecdc4);
        
        buildingRect.position.set(200, 400);
        gameContainer.addChild(buildingRect);

        // Add building label
        const buildingText = new Text({
            text: 'Guild Hall',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xffffff,
                align: 'center'
            }
        });
        buildingText.anchor.set(0.5);
        buildingText.position.set(250, 480);
        gameContainer.addChild(buildingText);

        // Add simple animation to all heroes
        this.animateHeroes();

        // Add status text
        const statusText = new Text({
            text: 'Ready to build your AI hero world! 🚀',
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x95e1d3,
                align: 'center'
            }
        });
        statusText.anchor.set(0.5);
        statusText.position.set(this.app.screen.width / 2, 520);
        gameContainer.addChild(statusText);

        // Test API connection
        this.testAPIConnection(gameContainer);
    }

    private createHeroSprites(container: Container): void {
        this.heroes.forEach(hero => {
            // Create hero sprite with class-specific color
            const heroSprite = new Graphics()
                .rect(0, 0, 50, 70)
                .fill(HERO_CLASS_COLORS[hero.class]);
            
            heroSprite.position.set(hero.position.x, hero.position.y);
            
            // Make hero interactive (clickable)
            heroSprite.interactive = true;
            heroSprite.buttonMode = true;
            
            // Add click handler
            heroSprite.on('pointerdown', () => this.onHeroClick(hero));
            
            container.addChild(heroSprite);
            this.heroSprites.set(hero.id, heroSprite);
            
            // Add hero name label
            const nameText = new Text({
                text: hero.name,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 12,
                    fill: 0xffffff,
                    align: 'center'
                }
            });
            nameText.anchor.set(0.5);
            nameText.position.set(hero.position.x + 25, hero.position.y + 80);
            container.addChild(nameText);
            
            // Add class label
            const classText = new Text({
                text: hero.class,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 10,
                    fill: 0xcccccc,
                    align: 'center'
                }
            });
            classText.anchor.set(0.5);
            classText.position.set(hero.position.x + 25, hero.position.y + 95);
            container.addChild(classText);
        });
    }

    private onHeroClick(hero: Hero): void {
        console.log(`🎭 Clicked on ${hero.name} (${hero.class})`);
        console.log(`📊 Stats: HP: ${hero.health}/${hero.maxHealth}, Mood: ${hero.mood}%, Action: ${hero.currentAction}`);
        
        // Simple visual feedback
        const sprite = this.heroSprites.get(hero.id);
        if (sprite) {
            // Flash effect
            sprite.alpha = 0.5;
            setTimeout(() => {
                sprite.alpha = 1.0;
            }, 200);
        }
    }

    private animateHeroes(): void {
        this.heroSprites.forEach((sprite, heroId) => {
            this.animateHero(sprite);
        });
    }

    private animateHero(hero: Graphics): void {
        // Simple floating animation
        const startY = hero.y;
        let time = 0;

        const animate = () => {
            time += 0.02;
            hero.y = startY + Math.sin(time) * 5; // Float up and down
            requestAnimationFrame(animate);
        };

        animate();
    }

    private async testAPIConnection(container: Container): Promise<void> {
        try {
            // Test API connection
            const response = await fetch('/api/test');
            const data = await response.json();
            
            // Add connection status
            const connectionText = new Text({
                text: `✅ Server Connected: ${data.message}`,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 14,
                    fill: 0x4ecdc4,
                    align: 'center'
                }
            });
            connectionText.anchor.set(0.5);
            connectionText.position.set(this.app.screen.width / 2, 550);
            container.addChild(connectionText);

        } catch (error) {
            // Add error status
            const errorText = new Text({
                text: '❌ Server Connection Failed',
                style: {
                    fontFamily: 'Arial',
                    fontSize: 14,
                    fill: 0xff6b6b,
                    align: 'center'
                }
            });
            errorText.anchor.set(0.5);
            errorText.position.set(this.app.screen.width / 2, 550);
            container.addChild(errorText);
            
            console.error('API Connection failed:', error);
        }
    }
}

// Initialize the game
const game = new SimpleGame();
game.init().catch(console.error);