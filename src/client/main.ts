import { Application, Assets } from 'pixi.js';
import { io, Socket } from 'socket.io-client';

import { initAssets } from './assets';
import { audio, bgm } from './audio';
import { designConfig } from './game/designConfig';
import { navigation } from './navigation';
import { TycoonGameScreen } from './screens/TycoonGameScreen';
import { LoadScreen } from './screens/LoadScreen';
import { TitleScreen } from './screens/TitleScreen';
import { storage } from './storage';
import { getUrlParam } from './utils/utils';
import { SocketEvents } from '../shared/types';

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

/** Socket.IO connection to server */
export const socket: Socket<SocketEvents> = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001');

let hasInteracted = false;

/** Set up a resize function for the app */
function resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const minWidth = designConfig.content.width;
    const minHeight = designConfig.content.height;

    // Calculate renderer and canvas sizes based on current dimensions
    const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
    const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
    const scale = scaleX > scaleY ? scaleX : scaleY;
    const width = windowWidth * scale;
    const height = windowHeight * scale;

    // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
    app.renderer.canvas.style.width = `${windowWidth}px`;
    app.renderer.canvas.style.height = `${windowHeight}px`;
    window.scrollTo(0, 0);

    // Update renderer  and navigation screens dimensions
    app.renderer.resize(width, height);
    navigation.init();
    navigation.resize(width, height);
}

/** Setup app and initialise assets */
async function init() {
    // Initialize the app
    await app.init({
        resolution: Math.max(window.devicePixelRatio, 2),
        backgroundColor: 0x2c3e50, // Dark blue-gray background for tycoon theme
    });

    // Add pixi canvas element to the document's body
    document.body.appendChild(app.canvas);

    // Whenever the window resizes, call the 'resize' function
    window.addEventListener('resize', resize);

    // Trigger the first resize
    resize();

    // Setup assets bundles (see assets.ts) and start up loading everything in background
    await initAssets();

    // Set the default local storage data if needed
    storage.readyStorage();

    // Assign the universal loading screen
    navigation.setLoadScreen(LoadScreen);

    // Change the audio mute state to the stored state
    audio.muted(storage.getStorageItem('muted'));

    // Setup Socket.IO connection
    socket.on('connect', () => {
        console.log('🔌 Connected to server');
    });

    socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
    });

    socket.on('error', (error) => {
        console.error('❌ Server error:', error);
    });

    // Prepare for user interaction, and play the music on event
    document.addEventListener('pointerdown', () => {
        if (!hasInteracted) {
            // Only play audio if it hasn't already been played
            // bgm.play('audio/ai-hero-tycoon-bg-music.wav'); // TODO: Add tycoon music
        }

        hasInteracted = true;
    });

    // Check for visibility sate so we can mute the audio on "hidden"
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') {
            // Always mute on hidden
            audio.muted(true);
        } else {
            // Only unmute if it was previously unmuted
            audio.muted(storage.getStorageItem('muted'));
        }
    });

    // Show first screen - go straight to game if '?play' param is present in url
    // This is used for debugging
    if (getUrlParam('play') !== null) {
        await Assets.loadBundle(TycoonGameScreen.assetBundles);
        await navigation.goToScreen(TycoonGameScreen);
    } else if (getUrlParam('loading') !== null) {
        await navigation.goToScreen(LoadScreen);
    } else {
        await navigation.goToScreen(TycoonGameScreen); // Start directly with the game for now
    }
}

// Init everything
init();
