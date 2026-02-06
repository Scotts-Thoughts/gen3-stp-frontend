/**
 * Default Style Settings
 * 
 * This file contains the default Pokemon art and background texture settings
 * for each game-species pairing. These settings ship with the app and provide
 * aesthetically pleasing defaults out of the box.
 * 
 * In DEVELOPMENT mode (npm run dev):
 *   - Style changes are saved to this file automatically
 *   - This allows developers to curate and refine default settings
 * 
 * In PRODUCTION mode (built app):
 *   - These defaults are loaded first
 *   - User overrides are stored in localStorage and take precedence
 *   - Users can reset to defaults by clearing their local overrides
 */

const DEFAULT_STYLE_SETTINGS = {
    // Format: "GameName_Species" or "GameName_FullyEvolved-line-Species"
    // Example entries:
    // "Emerald_Blaziken": {
    //     overlay_color: "#FF6B35",
    //     imageXOffset: 10,
    //     imageYOffset: -5,
    //     imageScale: 1.2,
    //     imageSat: 110,
    //     imageFlip: false,
    //     imageRotation: 0,
    //     backgroundTexture: "fire_texture",
    //     backgroundXOffset: 0,
    //     backgroundYOffset: 0,
    //     backgroundScale: 100,
    //     backgroundBrightness: 100,
    //     backgroundContrast: 100,
    //     backgroundSaturation: 100,
    //     backgroundBlur: 0,
    //     backgroundHue: 0,
    //     backgroundFlip: false
    // }
};

module.exports = { DEFAULT_STYLE_SETTINGS };

