/**
 * Style Settings Manager
 * 
 * Handles layered storage for Pokemon style settings:
 * - Default settings (ship with the app, stored in default_style_settings.js)
 * - User settings (stored in localStorage, override defaults)
 * 
 * In DEV mode: Style changes are saved to the defaults file
 * In PROD mode: Style changes are saved to localStorage as user overrides
 */

const fs = require('fs');
const path = require('path');

const DEBUG_LOGGING = false;

class StyleSettingsManager {
    constructor() {
        // Detect if running in development mode
        // In Electron, we can check if we're running from source vs packaged app
        this.isDev = this._detectDevMode();
        
        // Path to the default settings file
        this.defaultSettingsPath = path.join(__dirname, 'default_style_settings.js');
        
        // Load default settings
        this.defaultSettings = this._loadDefaultSettings();
        
        // Cache for user overrides (loaded from localStorage)
        this.userOverrides = {};
        
        DEBUG_LOGGING && console.log(`[StyleSettingsManager] Initialized in ${this.isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
        DEBUG_LOGGING && console.log(`[StyleSettingsManager] Default settings path: ${this.defaultSettingsPath}`);
        DEBUG_LOGGING && console.log(`[StyleSettingsManager] Loaded ${Object.keys(this.defaultSettings).length} default settings`);
    }
    
    /**
     * Detect if running in development mode
     */
    _detectDevMode() {
        try {
            // Multiple ways to detect dev mode in Electron
            
            // Method 1: Check if app is packaged (most reliable for Electron)
            try {
                const { app } = require('electron');
                if (app && typeof app.isPackaged !== 'undefined') {
                    const isPackaged = app.isPackaged;
                    DEBUG_LOGGING && console.log(`[StyleSettingsManager] Electron app.isPackaged: ${isPackaged}`);
                    if (isPackaged) return false; // Definitely production
                }
            } catch (e) {
                // Not in main process, try remote
                try {
                    const { remote } = require('electron');
                    if (remote && remote.app && typeof remote.app.isPackaged !== 'undefined') {
                        const isPackaged = remote.app.isPackaged;
                        DEBUG_LOGGING && console.log(`[StyleSettingsManager] Electron remote.app.isPackaged: ${isPackaged}`);
                        if (isPackaged) return false;
                    }
                } catch (e2) {
                    // Try @electron/remote
                    try {
                        const remote = require('@electron/remote');
                        if (remote && remote.app && typeof remote.app.isPackaged !== 'undefined') {
                            const isPackaged = remote.app.isPackaged;
                            DEBUG_LOGGING && console.log(`[StyleSettingsManager] @electron/remote app.isPackaged: ${isPackaged}`);
                            if (isPackaged) return false;
                        }
                    } catch (e3) {
                        // Ignore
                    }
                }
            }
            
            // Method 2: Check NODE_ENV
            if (process.env.NODE_ENV === 'production') {
                DEBUG_LOGGING && console.log(`[StyleSettingsManager] NODE_ENV is production`);
                return false;
            }
            if (process.env.NODE_ENV === 'development') {
                DEBUG_LOGGING && console.log(`[StyleSettingsManager] NODE_ENV is development`);
                return true;
            }
            
            // Method 3: Check if running from asar archive (packaged app)
            if (process.mainModule && process.mainModule.filename.includes('app.asar')) {
                DEBUG_LOGGING && console.log(`[StyleSettingsManager] Running from app.asar (packaged)`);
                return false;
            }
            
            // Method 4: Check executable path
            const execPath = process.execPath || '';
            if (execPath.includes('electron') || execPath.includes('node_modules')) {
                DEBUG_LOGGING && console.log(`[StyleSettingsManager] Running from electron/node_modules path (dev)`);
                return true;
            }
            
            // Method 5: Check if we can write to the default settings file directory
            // In dev, we should be able to write; in production (asar), we can't
            try {
                const testPath = path.join(__dirname, '.dev_test');
                fs.writeFileSync(testPath, 'test');
                fs.unlinkSync(testPath);
                DEBUG_LOGGING && console.log(`[StyleSettingsManager] Can write to app directory (dev mode)`);
                return true;
            } catch (e) {
                DEBUG_LOGGING && console.log(`[StyleSettingsManager] Cannot write to app directory (prod mode)`);
                return false;
            }
        } catch (e) {
            DEBUG_LOGGING && console.warn('[StyleSettingsManager] Error detecting dev mode:', e.message);
            // Default to production mode for safety
            return false;
        }
    }
    
    /**
     * Load default settings from the JS file
     */
    _loadDefaultSettings() {
        try {
            // Clear the require cache to get fresh data
            delete require.cache[require.resolve('./default_style_settings.js')];
            const defaults = require('./default_style_settings.js');
            return defaults.DEFAULT_STYLE_SETTINGS || {};
        } catch (e) {
            DEBUG_LOGGING && console.warn('[StyleSettingsManager] Could not load default settings:', e.message);
            return {};
        }
    }
    
    /**
     * Check if a storage key is for style settings (Pokemon art/background)
     * Style settings keys follow patterns like:
     * - "Emerald_Blaziken" (species settings)
     * - "FireRed and LeafGreen_Starmie-line" (evolution family)
     * - "Emerald_Blaziken-line-Torchic" (evolution member)
     */
    isStyleSettingsKey(key) {
        if (!key || typeof key !== 'string') return false;
        
        // Pattern: Game_Species or Game_Species-line or Game_Species-line-Species
        const gamePatterns = [
            'Emerald',
            'Ruby',
            'Sapphire',
            'FireRed',
            'LeafGreen',
            'FireRed and LeafGreen'
        ];
        
        return gamePatterns.some(game => key.startsWith(`${game}_`));
    }
    
    /**
     * Get a value - checks user overrides first, then defaults
     */
    get(key) {
        // For style settings, use layered approach
        if (this.isStyleSettingsKey(key)) {
            // First check localStorage for user overrides
            const localValue = localStorage.getItem(key);
            if (localValue !== null) {
                try {
                    const parsed = JSON.parse(localValue);
                    // Merge with defaults - user values take precedence
                    const defaultValue = this.defaultSettings[key] || {};
                    return { ...defaultValue, ...parsed };
                } catch (e) {
                    return JSON.parse(localValue);
                }
            }
            
            // Fall back to defaults
            if (this.defaultSettings[key]) {
                return this.defaultSettings[key];
            }
        }
        
        // For non-style settings, just use localStorage
        const value = localStorage.getItem(key);
        if (value === null) return null;
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
    
    /**
     * Set a value - behavior depends on dev/prod mode
     */
    set(key, value) {
        if (value === undefined || value === null) {
            this.remove(key);
            return;
        }
        
        // For style settings in dev mode, save to defaults file
        if (this.isStyleSettingsKey(key) && this.isDev) {
            this._saveToDefaults(key, value);
        }
        
        // Always save to localStorage (for immediate use and as user overrides in prod)
        localStorage.setItem(key, JSON.stringify(value));
    }
    
    /**
     * Remove a value
     */
    remove(key) {
        localStorage.removeItem(key);
        
        // In dev mode, also remove from defaults
        if (this.isStyleSettingsKey(key) && this.isDev) {
            delete this.defaultSettings[key];
            this._writeDefaultsFile();
        }
    }
    
    /**
     * Save a style setting to the defaults file (dev mode only)
     */
    _saveToDefaults(key, value) {
        if (!this.isDev) return;
        
        // Update in-memory cache
        this.defaultSettings[key] = value;
        
        // Write to file
        this._writeDefaultsFile();
    }
    
    /**
     * Write the defaults file
     */
    _writeDefaultsFile() {
        if (!this.isDev) return;
        
        try {
            const content = `/**
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

const DEFAULT_STYLE_SETTINGS = ${JSON.stringify(this.defaultSettings, null, 4)};

module.exports = { DEFAULT_STYLE_SETTINGS };
`;
            
            fs.writeFileSync(this.defaultSettingsPath, content, 'utf8');
            // console.log(`[StyleSettingsManager] Saved defaults to ${this.defaultSettingsPath}`);
        } catch (e) {
            // console.error('[StyleSettingsManager] Failed to write defaults file:', e.message);
        }
    }
    
    /**
     * Reset a specific key to defaults (remove user override)
     */
    resetToDefaults(key) {
        localStorage.removeItem(key);
        DEBUG_LOGGING && console.log(`[StyleSettingsManager] Reset ${key} to defaults`);
    }
    
    /**
     * Reset all style settings to defaults
     */
    resetAllToDefaults() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (this.isStyleSettingsKey(key)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        DEBUG_LOGGING && console.log(`[StyleSettingsManager] Reset ${keysToRemove.length} style settings to defaults`);
    }
    
    /**
     * Export current localStorage style settings to defaults file (dev mode)
     * This is useful for migrating existing settings to become new defaults
     */
    exportCurrentAsDefaults() {
        if (!this.isDev) {
            DEBUG_LOGGING && console.warn('[StyleSettingsManager] Can only export defaults in development mode');
            return false;
        }
        
        const exported = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (this.isStyleSettingsKey(key)) {
                try {
                    exported[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    // Skip invalid entries
                }
            }
        }
        
        this.defaultSettings = { ...this.defaultSettings, ...exported };
        this._writeDefaultsFile();
        DEBUG_LOGGING && console.log(`[StyleSettingsManager] Exported ${Object.keys(exported).length} settings as defaults`);
        return true;
    }
    
    /**
     * Get all default settings keys
     */
    getDefaultSettingsKeys() {
        return Object.keys(this.defaultSettings);
    }
    
    /**
     * Check if we're in dev mode
     */
    isDevMode() {
        return this.isDev;
    }
}

// Create singleton instance
const styleSettingsManager = new StyleSettingsManager();

module.exports = styleSettingsManager;

