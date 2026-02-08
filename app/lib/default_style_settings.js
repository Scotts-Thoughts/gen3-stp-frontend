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
 * 
 * AUTO-GENERATED - Do not edit manually unless you know what you're doing
 */

const DEFAULT_STYLE_SETTINGS = {
    "Emerald_Charizard": {
        "pkmn_ability": "Blaze",
        "pkmnNature": "Hardy",
        "backgroundTexture": "Fire",
        "overlay_color": "#f08030",
        "attempt_number": 3,
        "splits_display": "First"
    },
    "Emerald_Treecko": {
        "backgroundUrl": false,
        "pkmn_ability": "Overgrow",
        "pkmnNature": "Quiet",
        "backgroundTexture": "Dark Grass",
        "overlay_color": "#cae184",
        "imageFlip": true,
        "imageScale": "0.53",
        "imageYOffset": "-37",
        "imageXOffset": "48",
        "backgroundContrast": "150",
        "backgroundScale": "127",
        "backgroundYOffset": "-1",
        "backgroundXOffset": "59",
        "backgroundBrightness": "58",
        "backgroundSaturation": "120",
        "backgroundBlur": "2",
        "backgroundHue": "16",
        "finished_run_count": 0,
        "attempt_number": 1
    },
    "Emerald_Feraligatr": {
        "pkmn_ability": "Torrent",
        "pkmnNature": "Rash",
        "backgroundTexture": "Dark Water",
        "overlay_color": "#6dcce9",
        "imageFlip": true,
        "imageYOffset": "48",
        "imageXOffset": "6",
        "ui_saturation": "1.6",
        "backgroundContrast": "129",
        "backgroundScale": "124",
        "backgroundYOffset": "65",
        "backgroundBrightness": "83",
        "hidden_power_type": "Electric",
        "attempt_number": 2,
        "finished_run_count": 2
    },
    "Emerald_Typhlosion": {
        "imageFlip": true,
        "imageYOffset": "62",
        "imageXOffset": "34",
        "overlay_color": "#f7982f",
        "ui_saturation": "1.1",
        "backgroundScale": "173",
        "backgroundYOffset": "-72",
        "backgroundBrightness": "78",
        "backgroundContrast": "117",
        "pkmn_ability": "Blaze",
        "pkmnNature": "Quiet",
        "backgroundTexture": "Fire",
        "hidden_power_type": "Electric",
        "attempt_number": 2,
        "finished_run_count": 1,
        "imageScale": "0.96"
    },
    "Emerald_Meganium": {
        "imageFlip": true,
        "imageYOffset": "69",
        "imageScale": "1",
        "imageXOffset": "20",
        "overlay_color": "#b7d58c",
        "ui_saturation": "1.6",
        "backgroundTexture": "Dark Grass",
        "backgroundBrightness": "69",
        "backgroundContrast": "142",
        "backgroundSaturation": "149",
        "pkmn_ability": "Overgrow",
        "pkmnNature": "Rash",
        "hidden_power_type": "Water",
        "hidden_power_index": "3",
        "attempt_number": 2,
        "finished_run_count": 1
    }
};

module.exports = { DEFAULT_STYLE_SETTINGS };
