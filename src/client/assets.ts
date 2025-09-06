import { Assets } from 'pixi.js';

// Simple manifest for tycoon game (no external assets needed initially)
const manifest = {
    bundles: [
        {
            name: 'default',
            assets: []
        },
        {
            name: 'preload', 
            assets: []
        },
        {
            name: 'game-screen',
            assets: []
        }
    ]
};

/** Initialise and start background loading of all assets */
export async function initAssets() {
    // Simple initialization for now - no external assets
    await Assets.init({ 
        manifest, 
        basePath: '' 
    });
    
    console.log('✅ Assets initialized (no external assets loaded)');
}

/**
 * Check to see if a bundle has loaded
 * @param bundle - The unique id of the bundle
 * @returns Whether or not the bundle has been loaded
 */
export function isBundleLoaded(bundle: string) {
    // For now, all bundles are considered loaded since we have no assets
    return true;
}

export function areBundlesLoaded(bundles: string[]) {
    // For now, all bundles are considered loaded since we have no assets
    return true;
}
