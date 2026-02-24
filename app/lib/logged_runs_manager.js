/**
 * Logged Runs Manager
 * 
 * Handles storage for logged run identifiers:
 * - In DEV mode: Stores data in project folder (storage/logged_runs.json) - can be pushed to Github
 * - In PROD mode: Stores data in %appData% folder on user's machine
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class LoggedRunsManager {
    constructor() {
        // Detect if running in development mode
        this.isDev = this._detectDevMode();
        
        // Determine storage path based on mode
        if (this.isDev) {
            // Dev mode: store in project folder
            this.storagePath = path.join(__dirname, '..', 'storage');
            this.storageFile = path.join(this.storagePath, 'logged_runs.json');
        } else {
            // Prod mode: store in %appData% folder
            const appDataPath = this._getAppDataPath();
            this.storagePath = path.join(appDataPath, 'stp-generation3-overlay');
            this.storageFile = path.join(this.storagePath, 'logged_runs.json');
        }
        
        // Ensure storage directory exists
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath, { recursive: true });
        }
        
        // Load logged runs
        this.loggedRuns = this._loadLoggedRuns();
        
        console.log(`[LoggedRunsManager] Initialized in ${this.isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
        console.log(`[LoggedRunsManager] Storage path: ${this.storagePath}`);
        console.log(`[LoggedRunsManager] Loaded ${Object.keys(this.loggedRuns).length} logged runs`);
    }
    
    /**
     * Detect if running in development mode
     */
    _detectDevMode() {
        try {
            // Method 1: Check if app is packaged (most reliable for Electron)
            try {
                const { app } = require('electron');
                if (app && typeof app.isPackaged !== 'undefined') {
                    const isPackaged = app.isPackaged;
                    if (isPackaged) return false; // Definitely production
                }
            } catch (e) {
                // Not in main process, try remote
                try {
                    const { remote } = require('electron');
                    if (remote && remote.app && typeof remote.app.isPackaged !== 'undefined') {
                        const isPackaged = remote.app.isPackaged;
                        if (isPackaged) return false;
                    }
                } catch (e2) {
                    // Try @electron/remote
                    try {
                        const remote = require('@electron/remote');
                        if (remote && remote.app && typeof remote.app.isPackaged !== 'undefined') {
                            const isPackaged = remote.app.isPackaged;
                            if (isPackaged) return false;
                        }
                    } catch (e3) {
                        // Ignore
                    }
                }
            }
            
            // Method 2: Check NODE_ENV
            if (process.env.NODE_ENV === 'production') {
                return false;
            }
            if (process.env.NODE_ENV === 'development') {
                return true;
            }
            
            // Method 3: Check if running from asar archive (packaged app)
            if (process.mainModule && process.mainModule.filename) {
                if (process.mainModule.filename.includes('.asar')) {
                    return false;
                }
            }
            
            // Default to dev mode if we can't determine
            return true;
        } catch (error) {
            console.warn('[LoggedRunsManager] Error detecting dev mode, defaulting to dev:', error.message);
            return true;
        }
    }
    
    /**
     * Get the appData path for the current platform
     */
    _getAppDataPath() {
        const platform = process.platform;
        if (platform === 'win32') {
            return process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
        } else if (platform === 'darwin') {
            return path.join(os.homedir(), 'Library', 'Application Support');
        } else {
            // Linux and others
            return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
        }
    }
    
    /**
     * Load logged runs from file
     */
    _loadLoggedRuns() {
        try {
            if (fs.existsSync(this.storageFile)) {
                const data = fs.readFileSync(this.storageFile, 'utf8');
                const runs = JSON.parse(data);
                // Migrate old entries that don't have the finished flag
                let migrated = false;
                for (const runId in runs) {
                    if (runs[runId].finished === undefined) {
                        runs[runId].finished = false;
                        migrated = true;
                    }
                }
                if (migrated) {
                    // Save migrated data
                    const migratedData = JSON.stringify(runs, null, 4);
                    fs.writeFileSync(this.storageFile, migratedData, 'utf8');
                    console.log('[LoggedRunsManager] Migrated old entries to include finished flag');
                }
                return runs;
            }
        } catch (error) {
            console.warn('[LoggedRunsManager] Error loading logged runs:', error.message);
        }
        return {};
    }
    
    /**
     * Save logged runs to file
     */
    _saveLoggedRuns() {
        try {
            const data = JSON.stringify(this.loggedRuns, null, 4);
            fs.writeFileSync(this.storageFile, data, 'utf8');
        } catch (error) {
            console.error('[LoggedRunsManager] Error saving logged runs:', error.message);
        }
    }
    
    /**
     * Check if a run identifier has been logged and finished
     * @param {string} uniqueRunIdentifier - The unique run identifier to check
     * @returns {boolean} - True if the run has been logged and finished
     */
    isRunLogged(uniqueRunIdentifier) {
        if (!this.loggedRuns.hasOwnProperty(uniqueRunIdentifier)) {
            return false;
        }
        // Only consider it logged if finished is true
        // If finished is missing (old entries), treat as not finished (allow recording)
        return this.loggedRuns[uniqueRunIdentifier].finished === true;
    }
    
    /**
     * Add a run identifier to the logged runs
     * @param {string} uniqueRunIdentifier - The unique run identifier to add
     */
    addLoggedRun(uniqueRunIdentifier) {
        if (!this.loggedRuns.hasOwnProperty(uniqueRunIdentifier)) {
            this.loggedRuns[uniqueRunIdentifier] = {
                loggedAt: new Date().toISOString(),
                finished: false
            };
            this._saveLoggedRuns();
            console.log(`[LoggedRunsManager] Added new logged run: ${uniqueRunIdentifier}`);
        } else {
            // If run exists but doesn't have finished flag, ensure it's set to false
            if (this.loggedRuns[uniqueRunIdentifier].finished === undefined) {
                this.loggedRuns[uniqueRunIdentifier].finished = false;
                this._saveLoggedRuns();
            }
        }
    }
    
    /**
     * Mark a run as finished
     * @param {string} uniqueRunIdentifier - The unique run identifier to mark as finished
     */
    markRunAsFinished(uniqueRunIdentifier) {
        if (this.loggedRuns.hasOwnProperty(uniqueRunIdentifier)) {
            this.loggedRuns[uniqueRunIdentifier].finished = true;
            this._saveLoggedRuns();
            console.log(`[LoggedRunsManager] Marked run as finished: ${uniqueRunIdentifier}`);
        } else {
            console.warn(`[LoggedRunsManager] Attempted to mark non-existent run as finished: ${uniqueRunIdentifier}`);
        }
    }
    
    /**
     * Get all logged run identifiers
     * @returns {Array<string>} - Array of all logged run identifiers
     */
    getAllLoggedRuns() {
        return Object.keys(this.loggedRuns);
    }
    
    /**
     * Clear all logged runs (useful for testing)
     */
    clearLoggedRuns() {
        this.loggedRuns = {};
        this._saveLoggedRuns();
        console.log('[LoggedRunsManager] Cleared all logged runs');
    }
}

// Export singleton instance
module.exports = new LoggedRunsManager();

