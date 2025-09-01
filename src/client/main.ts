import { Application, Container, Graphics, Text } from 'pixi.js';

// Very simple PixiJS Hello World application
class SimpleGame {
    private app: Application;

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

        // Create simple content
        this.createSimpleContent();
        
        console.log('🎮 AI Hero Tycoon - Simple Demo Started!');
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

        // Create a simple colored rectangle (representing a hero)
        const heroRect = new Graphics()
            .rect(0, 0, 60, 80)
            .fill(0xff6b6b);
        
        heroRect.position.set(370, 250);
        gameContainer.addChild(heroRect);

        // Add hero label
        const heroText = new Text({
            text: 'Hero',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xffffff,
                align: 'center'
            }
        });
        heroText.anchor.set(0.5);
        heroText.position.set(400, 340);
        gameContainer.addChild(heroText);

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

        // Add simple animation to hero
        this.animateHero(heroRect);

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