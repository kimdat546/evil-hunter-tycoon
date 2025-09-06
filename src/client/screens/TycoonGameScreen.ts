import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '../navigation';
import { app, socket } from '../main';
import { Hero, Guild, World } from '../../shared/types';

export class TycoonGameScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['game-screen'];

    private heroes: Hero[] = [];
    private guild: Guild | null = null;
    private world: World | null = null;
    private ui: Container;
    private heroContainer: Container;
    private backgroundGraphics: Graphics;

    constructor() {
        super();
        
        // Create background
        this.backgroundGraphics = new Graphics();
        this.addChild(this.backgroundGraphics);

        // Create containers
        this.heroContainer = new Container();
        this.addChild(this.heroContainer);

        this.ui = new Container();
        this.addChild(this.ui);

        this.createUI();
        this.setupSocketListeners();
    }

    private createUI() {
        // Title
        const title = new Text({
            text: 'AI Hero Tycoon',
            style: {
                fontFamily: 'Arial',
                fontSize: 32,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        title.anchor.set(0.5);
        title.x = app.screen.width / 2;
        title.y = 50;
        this.ui.addChild(title);

        // Guild info panel
        const guildPanel = new Graphics();
        guildPanel.rect(20, 100, 300, 150);
        guildPanel.fill(0x34495e);
        guildPanel.stroke({ width: 2, color: 0x3498db });
        this.ui.addChild(guildPanel);

        const guildTitle = new Text({
            text: 'Guild Status',
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        guildTitle.x = 30;
        guildTitle.y = 110;
        this.ui.addChild(guildTitle);

        // Hero panel
        const heroPanel = new Graphics();
        heroPanel.rect(20, 270, 300, 300);
        heroPanel.fill(0x34495e);
        heroPanel.stroke({ width: 2, color: 0x3498db });
        this.ui.addChild(heroPanel);

        const heroTitle = new Text({
            text: 'Heroes',
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        heroTitle.x = 30;
        heroTitle.y = 280;
        this.ui.addChild(heroTitle);

        // Action buttons
        this.createActionButtons();
    }

    private createActionButtons() {
        const buttonY = app.screen.height - 100;
        const buttonWidth = 120;
        const buttonHeight = 40;
        const spacing = 20;

        const buttons = [
            { text: 'Summon Hero', action: () => this.summonHero() },
            { text: 'Generate World', action: () => this.generateWorld() },
            { text: 'Train Heroes', action: () => this.trainHeroes() },
            { text: 'Explore', action: () => this.exploreWorld() }
        ];

        buttons.forEach((buttonData, index) => {
            const button = new Graphics();
            button.rect(0, 0, buttonWidth, buttonHeight);
            button.fill(0x27ae60);
            button.stroke({ width: 2, color: 0x2ecc71 });
            
            button.x = 50 + index * (buttonWidth + spacing);
            button.y = buttonY;
            button.eventMode = 'static';
            button.cursor = 'pointer';

            button.on('pointerdown', buttonData.action);
            
            const buttonText = new Text({
                text: buttonData.text,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 12,
                    fill: 0xffffff,
                    fontWeight: 'bold'
                }
            });
            buttonText.anchor.set(0.5);
            buttonText.x = buttonWidth / 2;
            buttonText.y = buttonHeight / 2;
            button.addChild(buttonText);

            this.ui.addChild(button);
        });
    }

    private setupSocketListeners() {
        socket.on('hero:update', (data) => {
            console.log('Hero updated:', data);
            this.updateHeroDisplay();
        });

        socket.on('world:state', (data) => {
            console.log('World state:', data);
            this.world = data;
            this.updateUI();
        });

        socket.on('master:result', (data) => {
            console.log('Master command result:', data);
        });
    }

    private async summonHero() {
        try {
            const response = await fetch('http://localhost:3001/api/heroes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    guildId: 'test-guild-id',
                    worldContext: this.world?.name || 'Fantasy Realm'
                }),
            });

            const data = await response.json();
            console.log('Hero summoned:', data.hero);
            
            // Add hero to display
            this.addHeroToDisplay(data.hero);
        } catch (error) {
            console.error('Failed to summon hero:', error);
        }
    }

    private async generateWorld() {
        try {
            const response = await fetch('http://localhost:3001/api/world/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId: 'test-player-id'
                }),
            });

            const data = await response.json();
            this.world = data.world;
            console.log('World generated:', data.world);
            this.updateUI();
        } catch (error) {
            console.error('Failed to generate world:', error);
        }
    }

    private trainHeroes() {
        console.log('Training heroes...');
        this.heroes.forEach(hero => {
            socket.emit('hero:action', {
                heroId: hero.id,
                action: 'train',
                guildId: this.guild?.id || 'test-guild-id'
            });
        });
    }

    private exploreWorld() {
        console.log('Exploring world...');
        socket.emit('world:query', {
            worldId: this.world?.id || 'test-world-id'
        });
    }

    private addHeroToDisplay(heroData: any) {
        // Create a simple hero representation
        const heroSprite = new Graphics();
        heroSprite.circle(0, 0, 20);
        heroSprite.fill(0xe74c3c); // Red circle for hero
        
        const heroIndex = this.heroes.length;
        heroSprite.x = 400 + (heroIndex % 5) * 60;
        heroSprite.y = 200 + Math.floor(heroIndex / 5) * 60;
        
        // Add hero name
        const nameText = new Text({
            text: heroData.name || `Hero ${heroIndex + 1}`,
            style: {
                fontFamily: 'Arial',
                fontSize: 10,
                fill: 0xffffff
            }
        });
        nameText.anchor.set(0.5);
        nameText.x = 0;
        nameText.y = -35;
        heroSprite.addChild(nameText);

        this.heroContainer.addChild(heroSprite);
        
        // Store hero data
        if (heroData) {
            this.heroes.push(heroData);
        }
    }

    private updateHeroDisplay() {
        // Update hero positions, status, etc.
        // This would be more complex in a real implementation
        console.log('Updating hero display...');
    }

    private updateUI() {
        // Update guild info, resource counts, etc.
        console.log('Updating UI...');
    }

    public resize(width: number, height: number) {
        // Update background
        this.backgroundGraphics.clear();
        this.backgroundGraphics.rect(0, 0, width, height);
        this.backgroundGraphics.fill(0x2c3e50);

        // Reposition UI elements as needed
        // This would be more comprehensive in a real implementation
    }

    public update(_ticker: any) {
        // Game loop updates would go here
        // Update hero animations, world state, etc.
    }
}