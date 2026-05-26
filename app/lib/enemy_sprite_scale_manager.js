/**
 * Enemy Sprite Scale Manager
 *
 * Reads/writes per-species scale factors for enemy team sprites.
 *
 * Lookup order at runtime:
 *   1. localStorage user override (`enemyScale_<Species>`) — live in-session edits
 *   2. enemy_sprite_scales.js defaults file
 *   3. 1.0 (no scaling)
 *
 * In dev mode, calling commit() writes the current in-memory scales back to
 * enemy_sprite_scales.js so the saved value ships with the app.
 */

const fs = require('fs');
const path = require('path');

class EnemySpriteScaleManager {
    constructor() {
        this.filePath = path.join(__dirname, 'enemy_sprite_scales.js');
        this.scales = this._load();
        this.isDev = this._detectDev();
    }

    _load() {
        try {
            delete require.cache[require.resolve('./enemy_sprite_scales.js')];
            return Object.assign({}, require('./enemy_sprite_scales.js'));
        } catch (e) {
            return {};
        }
    }

    _detectDev() {
        try {
            let isPackaged = false;
            try {
                const { app } = require('@electron/remote') || require('electron');
                isPackaged = app?.isPackaged ?? false;
            } catch (e) {}
            const execPath = process.execPath || '';
            const runningFromNodeModules = execPath.includes('node_modules');
            const inAsar = __dirname.includes('.asar');
            return !isPackaged || runningFromNodeModules || !inAsar;
        } catch (e) {
            return false;
        }
    }

    _key(species) {
        if (species == null) return null;
        // species may be a reactive object whose toString returns the species name;
        // coerce explicitly so localStorage / JSON keys stay stable.
        const s = (typeof species === 'object' && 'value' in species)
            ? String(species.value ?? '')
            : String(species);
        return s || null;
    }

    /**
     * Normalize a stored value to { scale, yOffset }. The on-disk format used
     * to be a bare number (scale only); legacy entries are auto-promoted.
     */
    _normalize(raw) {
        const defaults = { scale: 1, xOffset: 0, yOffset: 0, flipped: false };
        if (raw == null) return defaults;
        if (typeof raw === 'number') return { ...defaults, scale: raw };
        if (typeof raw === 'object') {
            return {
                scale:   typeof raw.scale   === 'number' && !Number.isNaN(raw.scale)   ? raw.scale   : 1,
                xOffset: typeof raw.xOffset === 'number' && !Number.isNaN(raw.xOffset) ? raw.xOffset : 0,
                yOffset: typeof raw.yOffset === 'number' && !Number.isNaN(raw.yOffset) ? raw.yOffset : 0,
                flipped: !!raw.flipped
            };
        }
        return defaults;
    }

    /** Get { scale, xOffset, yOffset, flipped } for a species (override > file > defaults). */
    get(species) {
        const key = this._key(species);
        const defaults = { scale: 1, xOffset: 0, yOffset: 0, flipped: false };
        if (!key) return defaults;
        if (typeof localStorage !== 'undefined') {
            const raw = localStorage.getItem(`enemyScale_${key}`);
            if (raw !== null && raw !== '') {
                try {
                    const parsed = JSON.parse(raw);
                    return this._normalize(parsed);
                } catch (e) {
                    // Legacy override stored as a bare number string.
                    const n = parseFloat(raw);
                    if (!Number.isNaN(n)) return { ...defaults, scale: n };
                }
            }
        }
        return this._normalize(this.scales[key]);
    }

    getScale(species)   { return this.get(species).scale; }
    getXOffset(species) { return this.get(species).xOffset; }
    getYOffset(species) { return this.get(species).yOffset; }
    getFlipped(species) { return this.get(species).flipped; }

    /** Update the in-session entry (localStorage). Does not touch the file. */
    setLive(species, entry) {
        const key = this._key(species);
        if (!key) return;
        const merged = this._normalize({ ...this.get(species), ...entry });
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`enemyScale_${key}`, JSON.stringify(merged));
        }
    }

    /**
     * Commit the current entry for a species into the in-memory scales map and,
     * in dev mode, persist enemy_sprite_scales.js to disk. The localStorage
     * override is cleared so the file value becomes authoritative.
     */
    commit(species) {
        const key = this._key(species);
        if (!key) return;
        const entry = this.get(species);
        this.scales[key] = entry;
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(`enemyScale_${key}`);
        }
        if (this.isDev) {
            this._writeFile();
        } else if (typeof localStorage !== 'undefined') {
            // In prod (can't write the asar-bundled file), keep the value as an override.
            localStorage.setItem(`enemyScale_${key}`, JSON.stringify(entry));
        }
    }

    _writeFile() {
        const content = `/**
 * Enemy Sprite Scales
 *
 * Per-species scale factor applied to enemy team sprites in the overlay.
 * Auto-written from the in-app resize tool (Ctrl+Click an enemy sprite to
 * enter resize mode, drag the corner handle, press Enter to save).
 *
 * Key: Pokemon species name (e.g. "Lillipup")
 * Value: scale factor (1.0 = native sprite size)
 *
 * AUTO-GENERATED - last updated: ${new Date().toISOString()}
 */

const ENEMY_SPRITE_SCALES = ${JSON.stringify(this.scales, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENEMY_SPRITE_SCALES;
}
`;
        fs.writeFile(this.filePath, content, 'utf8', (err) => {
            if (err) {
                console.error('[EnemySpriteScaleManager] Failed to write file:', err.message);
            }
        });
    }
}

const enemySpriteScaleManager = new EnemySpriteScaleManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = enemySpriteScaleManager;
}
