// Setup the Storage Object
function createWatchedObject(watcher) {
    const root = {};
    const handler = {
        get(target, property, receiver) {
            const value = Reflect.get(target, property, receiver);
            if (typeof value === 'object' && value !== null) {
                return new Proxy(value, handler);
            }
            return value;
        },
        set(target, property, value, receiver) {
            const result = Reflect.set(target, property, value, receiver);
            watcher(root, {target, property, value});
            return result;
        },
        deleteProperty(target, property) {
            if (property in target) {
                delete target[property];
                watcher(root, {target, property, value: undefined});  
            }
        },
        //* Using the deleteProperty function:
            // Storage.test = 10
            // delete Storage.test
            //
            // OR
            //
            // Storage["test"] = 20
            // delete Storage["test"]
    };
    return new Proxy(root, handler);
}

/**
 * @param {string} path                                  path to the file
 * @param {string} file_name                             name of the file to save the data
 * @param {object?} options
 * @param {number?} options.saveTimeout                  time in milliseconds to wait before saving the file
 * @param {((data:string) => void)?} options.onSave      called after the file is saved
 */
function createStoredObject(path, file_name, { saveTimeout, onSave } = {}) {
    saveTimeout = saveTimeout || 250;
    onSave = onSave || (() => {});

    const fs = require("fs");
    
    const loadFromFile = () => {
        try {
            const data = fs.readFileSync(`${path}/${file_name}`, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.warn('[StoredObject] loadFromFile:', err.message);
            return {};
        }
    };

    const saveToFile = (root) => {
        const data = JSON.stringify(root, null, 4);
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        fs.writeFile(`${path}/${file_name}`, data, (err) => {
            if (err) console.error('[StoredObject] saveToFile:', err.message);
            else onSave(data);
        });
    };

    // after the watcher receives the first change it will wait 
    // for "saveTimeout" milliseconds before saving the file.
    // then it will reset the timer and wait for the next change.
    // this is done to avoid saving the file too often when
    // multiple changes are made in a short period of time.
    let timeoutId = null;
    const watcher = (root) => {
        if (timeoutId == null) {
            timeoutId = setTimeout(() => {
                saveToFile(root);
                timeoutId = null;
            }, saveTimeout);
        }
    };

    const obj = createWatchedObject(watcher);
    Object.assign(obj, loadFromFile());
    return obj;
}


const Storage = createStoredObject('./storage', 'Storage.json', {
    saveTimeout: 250,
    onSave: (data) => {
        // console.log('[Storage] saved:', data);
        // do something after the file is saved
        // like creating a backup somewhere else
    }
});


// Style Settings Manager for layered defaults + user overrides
const styleSettingsManager = require('./lib/style_settings_manager.js');

// Setup the MyStorage Object
const MyStorage = new Proxy({}, {
    set: (_, prop, value) => {
        // Use the style settings manager for style-related keys
        if (styleSettingsManager.isStyleSettingsKey(prop)) {
            styleSettingsManager.set(prop, value);
        } else {
            if (value === undefined || value === null)
                localStorage.removeItem(prop);
            else
                localStorage.setItem(prop, JSON.stringify(value));
        }
        return true;
    },
    get: (_, prop) => {
        if (prop === "clear")
            return () => localStorage.clear();
        if (prop === "entries")
            return () => Object.entries(localStorage);
        if (prop === "keys")
            return () => Object.keys(localStorage);
        if (prop === "has")
            return (key) => localStorage.getItem(key) === null;
        
        // Use the style settings manager for style-related keys
        if (styleSettingsManager.isStyleSettingsKey(prop)) {
            return styleSettingsManager.get(prop);
        }
        
        const value = localStorage.getItem(prop);
        if (value === null) return null;
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
});

// Utility functions for style settings management
const StyleSettingsUtils = {
    /**
     * Export current localStorage style settings to defaults file (dev mode only)
     */
    exportCurrentAsDefaults: () => {
        return styleSettingsManager.exportCurrentAsDefaults();
    },
    
    /**
     * Reset a specific Pokemon's style settings to defaults
     */
    resetToDefaults: (key) => {
        styleSettingsManager.resetToDefaults(key);
    },
    
    /**
     * Reset all style settings to defaults
     */
    resetAllToDefaults: () => {
        styleSettingsManager.resetAllToDefaults();
    },
    
    /**
     * Check if running in development mode
     */
    isDevMode: () => {
        return styleSettingsManager.isDevMode();
    },
    
    /**
     * Get all default settings keys
     */
    getDefaultSettingsKeys: () => {
        return styleSettingsManager.getDefaultSettingsKeys();
    }
};

async function loadCsvFile() {
    const file = await window.showOpenFilePicker({
        id: "SplitsFolder",
        types: [{
            description: "Split files",
            accept: { "text/csv": [".csv"] }
        }]
    });
    const contents = await file[0].getFile();
    const text = await contents.text();
    return text;
}

// // Open the folder ./splits/ in the file explorer with node.js
// function openFolder(folderName) {
//     require('child_process').exec(`start .\\${folderName}\\`);
// }

class RetroArchHook {
    client = undefined
    connected = false
    resolve = () => {}
    
    constructor() {
        if (!require) {
            console.error('RetroArchHook: require is not defined')
            return
        }

        this.client = require('dgram').createSocket('udp4');

        this.client.on('message', (msg, info) => {
            const s = String.fromCharCode(...msg).split(" ")
            if (s[0] === 'GET_STATUS') {
                this.resolve(s[1])
            }
        });
        
        this.client.connect(55355, '127.0.0.1', (err) => {
            // console.log(err)
            if (!err) {
                this.connected = true
            }
        });
    }

    async get_status() {
        // returns 'CONTENTLESS' | 'PLAYING' | 'PAUSED'
        return new Promise((resolve, reject) => {
            this.resolve = resolve
            this.client.send('GET_STATUS');
        })
    }
    
    async pause() {
        const status = await this.get_status()
        if (status === 'PLAYING') {
            this.client.send('PAUSE_TOGGLE');
        }
    }

    async resume() {
        const status = await this.get_status()
        if (status === 'PAUSED') {
            this.client.send('PAUSE_TOGGLE');
        }
    }

    async fastForward() {
        this.client.send('FAST_FORWARD');
    }

    cleanup() {
        if (this.client) {
            try {
                this.client.close();
            } catch (err) {
                console.warn('[RetroArchHook] Error closing socket:', err);
            }
            this.client = undefined;
            this.connected = false;
        }
    }
}

const retro = new RetroArchHook()

const Keys = {
    "ESCAPE":         0x1B,
    "BACKSPACE":      0x08,
    "TAB":            0x09,
    
    "LEFT":           0x25,
    "UP":             0x26,
    "RIGHT":          0x27,
    "DOWN":           0x28,
    
    "CAPS_LOCK":      0x14,
    "NUM_LOCK":       0x90,
    "SCROLL_LOCK":    0x91,
    
    "SHIFT":          0x10,
    "L_SHIFT":        0xA0,
    "R_SHIFT":        0xA1,

    "CTRL":           0x11,
    "L_CTRL":         0xA2,
    "R_CTRL":         0xA3,
    
    "ALT":            0x12,
    "L_ALT":          0xA4,
    "R_ALT":          0xA5,
    
    "L_WIN":          0x5B,
    "R_WIN":          0x5C,

    "0":              0x30,
    "1":              0x31,
    "2":              0x32,
    "3":              0x33,
    "4":              0x34,
    "5":              0x35,
    "6":              0x36,
    "7":              0x37,
    "8":              0x38,
    "9":              0x39,

    "A":              0x41,
    "B":              0x42,
    "C":              0x43,
    "D":              0x44,
    "E":              0x45,
    "F":              0x46,
    "G":              0x47,
    "H":              0x48,
    "I":              0x49,
    "J":              0x4A,
    "K":              0x4B,
    "L":              0x4C,
    "M":              0x4D,
    "N":              0x4E,
    "O":              0x4F,
    "P":              0x50,
    "Q":              0x51,
    "R":              0x52,
    "S":              0x53,
    "T":              0x54,
    "U":              0x55,
    "V":              0x56,
    "W":              0x57,
    "X":              0x58,
    "Y":              0x59,
    "Z":              0x5A,

    "NUMPAD0":        0x60,
    "NUMPAD1":        0x61,
    "NUMPAD2":        0x62,
    "NUMPAD3":        0x63,
    "NUMPAD4":        0x64,
    "NUMPAD5":        0x65,
    "NUMPAD6":        0x66,
    "NUMPAD7":        0x67,
    "NUMPAD8":        0x68,
    "NUMPAD9":        0x69,
    "SEPARATOR":      0x6C,
    "DECIMAL":        0x6E,

    "MULTIPLY":       0x6A,
    "ADD":            0x6B,
    "SUBTRACT":       0x6D,
    "DIVIDE":         0x6F,
    
    "F1":             0x70,
    "F2":             0x71,
    "F3":             0x72,
    "F4":             0x73,
    "F5":             0x74,
    "F6":             0x75,
    "F7":             0x76,
    "F8":             0x77,
    "F9":             0x78,
    "F10":            0x79,
    "F11":            0x7A,
    "F12":            0x7B,
    "F13":            0x7C,
    "F14":            0x7D,
    "F15":            0x7E,
    "F16":            0x7F,
    "F17":            0x80,
    "F18":            0x81,
    "F19":            0x82,
    "F20":            0x83,
    "F21":            0x84,
    "F22":            0x85,
    "F23":            0x86,
    "F24":            0x87,


    "APPS":           0x5D,
    "CLEAR":          0x0C,
    "RETURN":         0x0D,
    "PAUSE":          0x13,

    "CONVERT":        0x1C,
    "NONCONVERT":     0x1D,
    "ACCEPT":         0x1E,
    "MODECHANGE":     0x1F,

    "SPACE":          0x20,
    "PRIOR":          0x21,
    "NEXT":           0x22,
    "END":            0x23,
    "HOME":           0x24,
    "SELECT":         0x29,
    "PRINT":          0x2A,
    "EXECUTE":        0x2B,
    "SNAPSHOT":       0x2C,
    "INSERT":         0x2D,
    "DELETE":         0x2E,
    "HELP":           0x2F,
    "SLEEP":          0x5F,
}

Object.entries(Keys).forEach(([k, v]) => Keys[v] = k);

class KeyHook {
    constructor() {
        // start the keyboard hook
        this.process = require("child_process").spawn("keyhook.exe");

        // general logging
        // this.process.on("spawn", () => console.log("Keyboard hook started!"));
        this.process.stderr.on("data", (data) => console.error(`${data}`));
        
        // handle output of the keyboard hook
        this.process.stdout.on("data", (data) => {
            for (const line of data.toString().split(/[\n\r]+/)) {
                const parts = line.split(",").map(x => parseInt(x, 10));
                const [down, key, time] = parts;
                
                if (parts.length !== 3 || parts.some(isNaN)) continue;
                this._processKey(down === 1, key, time);
            }
        });  
    
        // general initialization
        for (let i=0; i<256; i++)
            this._keyState[i] = false;
    }
        
    _listeners = {};
    _keyState = [];
    _processKey(down, keyCode, time) {
        const oldState = this._keyState[keyCode] == true;
        this._keyState[keyCode] = down;
        const key = Keys[keyCode];
        let type = "unknown";

        if (oldState && down)
            type = "repeat";
        else if (down)
            type = "down";
        else
            type = "up";

        if (!this._listeners[type]) return;
        for (const listener of this._listeners[type]) {
            listener({
                type, 
                keyCode, 
                key, 
                alt: this.isAltDown,
                ctrl: this.isCtrlDown,
                shift: this.isShiftDown,
                time,
            });
        }
    }
  
    get isShiftDown() { return this._keyState[Keys.L_SHIFT] || this._keyState[Keys.R_SHIFT] || this._keyState[Keys.SHIFT]; }
    get isCtrlDown()  { return this._keyState[Keys.L_CTRL]  || this._keyState[Keys.R_CTRL]  || this._keyState[Keys.CTRL]; }
    get isAltDown()   { return this._keyState[Keys.L_ALT]   || this._keyState[Keys.R_ALT]   || this._keyState[Keys.ALT]; }

    isKeyDown(key) { 
        if (typeof key === 'string') key = Keys[key.toUpperCase()];
        return this._keyState[key];
    }
    
    on(event, callback) {
        if (this._listeners[event] === undefined)
            this._listeners[event] = [];
        this._listeners[event].push(callback);
    }

    registerShortCut(shortCut, callback) {
        // transform the shortcut into an array of key codes
        if (typeof shortCut === 'number')
            shortCut = [shortCut];
        if (typeof shortCut === 'string')
            shortCut = shortCut.toUpperCase().split("+").map(x => Keys[x.trim()]);
            shortCut = shortCut.map(x => {
            if (typeof x === 'string') x = Keys[x.toUpperCase()];
            if (x === Keys.L_SHIFT || x === Keys.R_SHIFT) x = Keys.SHIFT;
            if (x === Keys.L_CTRL || x === Keys.R_CTRL) x = Keys.CTRL;
            if (x === Keys.L_ALT || x === Keys.R_ALT) x = Keys.ALT;
            return x;
        });

        const checkAlt = shortCut.includes(Keys.ALT);
        const checkCtrl = shortCut.includes(Keys.CTRL);
        const checkShift = shortCut.includes(Keys.SHIFT);
        const checkKeys = shortCut.filter(x => x !== Keys.ALT && x !== Keys.CTRL && x !== Keys.SHIFT);

        if (checkKeys.some(x => typeof x !== 'number')) 
            throw new Error("Invalid key code");

        this.on("down", (data) => {
            if (
                checkAlt === data.alt &&
                checkCtrl === data.ctrl &&
                checkShift === data.shift &&
                checkKeys.every(x => this.isKeyDown(x))
            ) {
                callback();
            }
        });
    }

    stop() {
        return this.process.kill();
    }
}
const keyhook = new KeyHook();

const fs = require("fs");
const { existsSync } = require('original-fs');
const path = require("path");
const { finished } = require('stream');
const Timer = require("./logic/Timer.js");

for (folder of folders = ['storage', 'splits', 'splits/Emerald', 'splits/FireRed']) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
}

function logData(gameName, gameName_path, str, file_name, starter, log_type, testStatus, toggle, evolution, evolution_label) {
        return new Promise((resolve, reject) => {
        const testStatusText = testStatus ? "test_run_" : "";
        // The starter parameter already contains the correct split file name (calculated by getSplitFileName())
        const dirPath = `./splits/${app.game.gameName}/${starter}/attempts/`;
        let filePath = path.join(dirPath, `${gameName}-${testStatusText}${starter}-${file_name}-simple.csv`);
        let header = "player_name," +
                    "pokemon," +
                    "trainer_name," +
                    "real_time_hmmss," +
                    "resets," +
                    "blackouts," +
                    "level," +
                    "game_time," +
                    "battle_duration," +
                    "move1," +
                    "move2," +
                    "move3," +
                    "move4,\n"
        if (log_type == "Deprecated" && toggle == true) {
            filePath = path.join(dirPath, `${gameName}-${testStatusText}${starter}-${file_name}.csv`);
            header = "ROM," +
                "Species," +
                "Trainer," +
                "Start Time," +
                "Real Time," +
                "Game Time," +
                "Level," +
                "Resets," +
                "RTHours," +
                "RTMinutes," +
                "RTSeconds," +
                "RTMilliseconds," +
                "Move 1," +
                "Move 2," +
                "Move 3," +
                "Move 4," +
                "Attack," +
                "Defense," +
                "Sp. Attack," +
                "Sp. Defense," +
                "Speed," +
                "Attack Stage," +
                "Defense Stage," +
                "Sp. Attack Stage," +
                "Sp. Defense Stage," +
                "Speed Stage," +
                "Accuracy Stage," +
                "Evasion Stage," +
                "Battle Attack," +
                "Battle Defense," +
                "Battle Sp. Attack," +
                "Battle Sp. Defense," +
                "Battle Speed," +
                "Frame Count," +
                "Overworld Frame Count," +
                "Battle Frame Count," +
                "Menu Frame Count," +
                "Intro Frame Count," +
                "Save Count," +
                "Reload Count," +
                "Clock Reset Count," +
                "Steps Count," +
                "Steps Count Walk," +
                "Steps Count Bike," +
                "Steps Count Surf," +
                "Bonks," +
                "Battles," +
                "Trainer Battles," +
                "Wild Battles," +
                "Battles Fled," +
                "Failed Runs," +
                "Total Damage Dealt," +
                "Actual Damage Dealt," +
                "Total Damage Taken," +
                "Actual Damage Taken," +
                "Own Moves Hit," +
                "Own Moves Missed," +
                "Enemy Moves Hit," +
                "Enemy Moves Missed," +
                "Own Moves Super Effective," +
                "Own Moves Not Very Effective," +
                "Enemy Moves Super Effective," +
                "Enemy Moves Not Very Effective," +
                "Criticals Dealt," +
                "OHKOs Dealt," +
                "Criticals Taken," +
                "OHKOs Taken," +
                "Was Confused," +
                "Enemy Became Confused," +
                "Was Paralyzed," +
                "Enemy Was Paralyzed," +
                "Was Burned," +
                "Enemy Was Burned," +
                "Was Frozen," +
                "Enemy Was Frozen," +
                "Was Poisoned," +
                "Enemy Was Poisoned," +
                "Was Badly Poisoned," +
                "Enemy Was Badly Poisoned," +
                "Fell Asleep," +
                "Enemy Fell Asleep," +
                "Player Turns Confused," +
                "Player Turns Confused Hit Self," +
                "Player Turns Paralyzed," +
                "Player Turns Paralyzed Fully," +
                "Enemy Turns Confused," +
                "Enemy Turns Confused Hit Self," +
                "Enemy Turns Paralyzed," +
                "Enemy Turns Paralyzed Fully," +
                "Player HP Healed," +
                "Enemy HP Healed," +
                "Player Pokemon Fainted," +
                "Enemy Pokemon Fainted," +
                "Experience Gained," +
                "Switchouts," +
                "Money Made," +
                "Money Spent," +
                "Money Lost," +
                "Items Picked Up," +
                "Items Bought," +
                "Items Sold," +
                "Balls Thrown," +
                "Pokemon Caught In Balls," +
                "Moves Learnt," +
                //new properties" +
                "Blackouts," +
                "Attempt Number," +
                "Failures," +
                "Rival's Tea,m\n"
        }
        if (log_type == "Full" && toggle == true) {
            filePath = path.join(dirPath, `${gameName}-${testStatusText}${starter}-${file_name}-full.csv`);
        }
        fs.mkdir(dirPath, { recursive: true }, (err) => {
            if (!fs.existsSync(filePath)) {
                fs.writeFile(filePath, header, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        fs.appendFile(filePath, str, (err) => {
                            if (err) {
                                console.error(err);
                            }
                            resolve();
                        });
                    }
                });
            } else {
                fs.appendFile(filePath, str, (err) => {
                    if (err) {
                        console.error(err);
                    }
                    resolve();

                });   
            }
        });
    });
}

function logCopy(gameName, gameName_path, file_name, starter, finished_run_count, evolution, evolution_label) {
    if (evolution == true) {
        starter = evolution_label;
    }
    var dirPathAttempts = `./splits/${gameName_path}/${starter}/attempts/`;
    var dirPathFinishes = `./splits/${gameName_path}/${starter}/finishes/`;
    fs.mkdir(dirPathFinishes, { recursive: true }, (err) => {
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starter}-${file_name}-simple.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starter}-${finished_run_count}-simple.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starter}-${file_name}-full.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starter}-${finished_run_count}-full.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starter}-${file_name}.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starter}-${finished_run_count}.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
}

function transition(fn, ms) {
    return new Promise((resolve) => {
        const T = performance.now()
        function step() {
            const t = performance.now() - T
            fn(Math.min(t / ms, 1))
            if (t < ms) requestAnimationFrame(step)
            else resolve()
        }
        requestAnimationFrame(step)
    })
}

// import gameVariables from '../lib/gameVariables.js';

const app = Vue.createApp({
    components: {
        "Timer": require("./components/Timer.js"),
    },
    data() {
        return {
            ready        : false,
            isInDevMode  : StyleSettingsUtils.isDevMode(), // Track if running in development mode
            mapper       : null,
            scott_mode   : true,
            gameVariables: null,
            debugging    : false,

            emulatorStatsInterval: null,
            emulatorStats        : null,
            shuckie_timer        : MyStorage['shuckie_timer']    ?? false,
            shuckie_counters     : MyStorage['shuckie_counters'] ?? false,
            
            set_rom_starter_automatically : true,
            legacy_state          : MyStorage['legacy_state'] ?? false,
            show_advanced_settings: MyStorage['show_advanced_settings'] ?? false,
            battle_testing_ui     : MyStorage['battle_testing_ui'] ?? false,
            // game: null,
            // POKEMON CONFIG (components) ---------------------------------------------------------------------//
            starterString         : "Beedrill",
            pkmnNature            : "Adamant",
            pkmn_ability          : MyStorage['pkmn_ability'] ?? "Pressure", // false = ability 1, true = ability 2
            hidden_power_type     : "Electric",
            hidden_power_index    : 0,
            pkmn_gender           : "Female",
            gameSelection         : MyStorage['gameSelection'] ?? "FireRed and LeafGreen",
            evolution             : MyStorage['evolution'] ?? false,
            evolution_splits_label: MyStorage['evolution_splits_label'] ?? "",
            selected_evolution_species   : null,  // Currently selected species in evolution family for styling
            evolution_family_list        : [],    // List of species in the current evolution family
            last_known_species           : null,  // Track last known species for evolution detection
            last_known_personality_value : null,  // Track last known personality value for evolution detection
            evolution_transitioning      : false, // Flag to track if evolution transition is in progress
            evolution_old_species        : null,  // Species before evolution (for transition)
            evolution_new_species        : null,  // Species after evolution (for transition)
            evolution_transition_progress: 0,     // Progress of evolution transition (0-1)
            show_evolved_base_stats      : false, // Flag to show base stats of evolved species until next battle
            evolved_species_for_stats    : null,  // Species to show base stats for
            is_loading_evolution_style   : false, // Flag to prevent watchers from saving during style loading
            frame                        : false,
            catch_rate            : MyStorage['catch_rate'] ?? false,
            deoxys_form           : MyStorage['deoxys_form'] ?? "Speed",
            speed_comparison_toggle: true,
            unobtainable_moves_toggle: MyStorage['unobtainable_moves_toggle'] ?? "Always Cross Out",
            banned_hidden_power      : MyStorage['banned_hidden_power']       ?? true,
            post_kanto_evolutions    : MyStorage['post_kanto_evolutions']     ?? false,
            splits_display           : MyStorage['splits_display']            ?? "First",
            show_post_battle_splits  : MyStorage['show_post_battle_splits']   ?? true,
 
            // Editors 
            move1_replacement: "",
            move2_replacement: "",
            move3_replacement: "",
            move4_replacement: "",
            item1_replacement: "Rare Candy",
            item2_replacement: "PP UP",
            item3_replacement: "Full Restore",
            item4_replacement: "Max Elixir",

            stats                : MyStorage['stats']                ?? "Automatic",
            stat_exp_display     : MyStorage['stat_exp_display']     ?? true,
            dv_display           : MyStorage['dv_display']           ?? true,
            inventory_display    : MyStorage['inventory_display']    ?? true,
            battleGraphic        : MyStorage['battleGraphic']        ?? true,
            base_stats_display   : MyStorage['base_stats_display']   ?? true,
            stats_display        : MyStorage['stats_display']        ?? true,
            automatic_ivs        : MyStorage['automatic_ivs']        ?? true,
            automatic_evs        : MyStorage['automatic_evs']        ?? true,
            buffer_pokedex_owned : MyStorage['buffer_pokedex_owned'] ?? [],
            buffer_pokedex_seen  : MyStorage['buffer_pokedex_seen']  ?? [],
            disable_right_hotkeys: true,

            // USER CONFIG (components) ------------------------------------------------------------------------// 
            graphicOverlay               : MyStorage['graphicOverlay']               ?? true,  //places a single image as the overlay  //MVP
            gameArea                     : MyStorage['gameArea']                     ?? false, //shows green box to place game in
            pokeballFloor                : MyStorage['pokeballFloor']                ?? false, //shows floor for Pokemon to stand on
            dynamicOverlay               : MyStorage['dynamicOverlay']               ?? false, //dynamically picks overlay graphics based on team slot 1
            gametime                     : MyStorage['gametime']                     ?? false, //shows gametime
            pick                         : MyStorage['pick']                         ?? true,
            typeCalcs                    : MyStorage['typeCalcs']                    ?? true,  //turns on type effectiveness calculations
            moveset                      : MyStorage['moveset']                      ?? true,  //includes the moveset area and dynamic PP  //MVP
            dynamicPower                 : MyStorage['dynamicPower']                 ?? false, //dynamically calculates power based on type effectiveness
            resets                       : MyStorage['resets']                       ?? false, //includes the resets graphics
            movepool                     : MyStorage['movepool']                     ?? false, //includes the movepool graphic
            inventory                    : MyStorage['inventory']                    ?? false, //includes the inventory graphic when in marts
            battleStats                  : MyStorage['battleStats']                  ?? false, //calculates stats with stage modifiers  //MVP
            battleInfo                   : MyStorage['battleInfo']                   ?? false, //includes rightBar battle graphic
            conditions                   : MyStorage['conditions']                   ?? false, //shows status conditions as pop ups
            expBar                       : MyStorage['expBar']                       ?? false, //includes a dynamic exp bar
            splits                       : MyStorage['splits']                       ?? false, //shows splits when a major battle is complete
            tooltips                     : MyStorage['tooltips']                     ?? false, //displays move tooltips when a new move is learned
            btcInfo                      : MyStorage['btcInfo']                      ?? false, //shows behind the scenes info in the game area
            returnPower                  : MyStorage['returnPower']                  ?? true,  //dynamically calculates the power of Return
            gamestate                    : MyStorage['gamestate']                    ?? true,  //shows the current gamestate in the place of the timer
            labels                       : MyStorage['labels']                       ?? true,  //shows the current gamestate in the place of the timer
            tutor_moves                  : MyStorage['tutor_moves']                  ?? false,
            testStatus                   : MyStorage['testStatus']                   ?? false,
            repel_counter                : MyStorage['repel_counter']                ?? true,
            vs_seeker                    : MyStorage['vs_seeker']                    ?? false,
            collect_split_data           : MyStorage["collect_split_data"]           ?? true,
            autosplitter_toggle          : MyStorage["autosplitter_toggle"]          ?? true,
            showSpecialTrainerGraphics   : MyStorage['showSpecialTrainerGraphics']   ?? true,
            league_rematches             : MyStorage['league_rematches']             ?? false,
            display_badge_boosts         : MyStorage['display_badge_boosts']         ?? true,
            show_nature_changes          : MyStorage['show_nature_changes']          ?? true,
            automatic_post_battle_splits : MyStorage["automatic_post_battle_splits"] ?? false,
            no_counters                  : MyStorage["no_counters"]                  ?? false,


            badges: ["badge1", "badge2", "badge3", "badge4", "badge5", "badge6", "badge7", "badge8"],
            badge_indexes: [0, 1, 2, 3, 4, 5, 6, 7],
            badgeBoosts: ["badge1", "badge3", "badge5", "badge7"],
            pkmnMoves: ["move1", "move2", "move3", "move4"],
            stat_object:     [
                {abrv: "HP",  name: "Hp",              name_ev: "Hp",             label: "HP",   path: "maxHp",          base_stat_path: "base_hp",      object_identifier: "hp",      hp_spe_label_row: 1, hp_spd_label_row: 1, label_column: 1, hp_spe_value_row: 1, hp_spd_value_row: 1, value_column: 2,}, 
                {abrv: "Atk", name: "Attack",          name_ev: "Attack",         label: "Atk.", path: "attack",         base_stat_path: "base_atk",     object_identifier: "atk",     hp_spe_label_row: 2, hp_spd_label_row: 2, label_column: 1, hp_spe_value_row: 2, hp_spd_value_row: 2, value_column: 2,}, 
                {abrv: "Def", name: "Defense",         name_ev: "Defense",        label: "Def.", path: "defense",        base_stat_path: "base_def",     object_identifier: "def",     hp_spe_label_row: 3, hp_spd_label_row: 3, label_column: 1, hp_spe_value_row: 3, hp_spd_value_row: 3, value_column: 2,}, 
                {abrv: "SpA", name: "Special Attack",  name_ev: "SpecialAttack",  label: "SpA.", path: "specialAttack",  base_stat_path: "base_spc_atk", object_identifier: "spc_atk", hp_spe_label_row: 1, hp_spd_label_row: 2, label_column: 3, hp_spe_value_row: 1, hp_spd_value_row: 2, value_column: 4,}, 
                {abrv: "SpD", name: "Special Defense", name_ev: "SpecialDefense", label: "SpD.", path: "specialDefense", base_stat_path: "base_spc_def", object_identifier: "spc_def", hp_spe_label_row: 2, hp_spd_label_row: 3, label_column: 3, hp_spe_value_row: 2, hp_spd_value_row: 3, value_column: 4,}, 
                {abrv: "Spe", name: "Speed",           name_ev: "Speed",          label: "Spe.", path: "speed",          base_stat_path: "base_spd",     object_identifier: "spd",     hp_spe_label_row: 3, hp_spd_label_row: 1, label_column: 3, hp_spe_value_row: 3, hp_spd_value_row: 1, value_column: 4,}, 
            ],

            //CSS styling values
            statLabelOpacityValue: 0.1, //used when a stage modifier is applied

            //DATA ---------------------------------------------------------------------------------------------//
            gen3data                  : gen3data,
            gen3moves                 : gen3moves,
            gen3abilities             : gen3abilities,
            stageModifiersData        : stageModifiersData,
            natures                   : natures,
            typeData                  : typeData,
            typeBoostingItems         : typeBoostingItems,
            dexDataRubySapphireEmerald: dexDataRubySapphireEmerald,
            dexDataFireRedLeafGreen   : dexDataFireRedLeafGreen,
            emeraldTrainers           : emeraldTrainers,
            g3MoveData                : g3MoveData,
            g3tmhmMapping             : g3tmhmMapping,
            g3hiddenPowerTypeSelector : g3hiddenPowerTypeSelector,
            textures                  : textures,
            default_colors            : default_colors,
            autosplitter              : autosplitter,
            generation_3_moves        : generation_3_moves,
            remakeTrainers            : remakeTrainers,
            emeraldTrainers           : emeraldTrainers,
            trainer_name_lookup       : trainer_name_lookup,
            pokedex_emerald           : pokedex_emerald,
            pokedex_frlg              : pokedex_frlg,
            split_trainers            : split_trainers,
            hiddenpower_type_selector : hiddenpower_type_selector,
            pokedex_indexes           : pokedex_indexes,
            split_trainers_simple     : split_trainers_simple,
            cross_generation_moves    : cross_generation_moves,
            hiddenpowers              : hiddenpowers,
            unobtainable_moves_object : unobtainable_moves,
            evolution_data_pokedex    : evolution_data_pokedex,

            trainerLists: {
                "emeraldTrainers" : emeraldTrainers,
                "remakeTrainers"  : remakeTrainers,  
            },
            genders: {
                "false": "Male",
                "true":  "Female",
            },
            set_starter_stats_object: {
                ivs: {
                    hp: 31,
                    atk: 31,
                    def: 31,
                    spe: 31,
                    spa: 31,
                    spd: 31,
                },
                gender: 10,
                nature: 'Hardy',
                ability: 0,
            },
            simple_natures: {
                "0": "Hardy",
                "1": "Lonely",
                "2": "Brave",
                "3": "Adamant",
                "4": "Naughty",
                "5": "Bold",
                "6": "Docile",
                "7": "Relaxed",
                "8": "Impish",
                "9": "Lax",
                "10": "Timid",
                "11": "Hasty",
                "12": "Serious",
                "13": "Jolly",
                "14": "Naive",
                "15": "Modest",
                "16": "Mild",
                "17": "Quiet",
                "18": "Bashful",
                "19": "Rash",
                "20": "Calm",
                "21": "Gentle",
                "22": "Sassy",
                "23": "Careful",
                "24": "Quirky",
            },
            hiddenPowerTypes : {
                15 : "Dark",
                8 : "Fire",
                6 : "Ghost",
                11 : "Electric",
                10 : "Grass",
                9 : "Water",
                4 : "Rock",
                1 : "Flying",
                0 : "Fighting",
                3 : "Ground",
                13 : "Ice",
                12 : "Psychic",
                5 : "Bug",
                7 : "Steel",
                14 : "Dragon",
                2 : "Poison",
            },
            pokemon_list: [],

            //LOOPS
            pkmnSlots: [0, 1, 2, 3, 4, 5],
            search_term: "",
            previous_label:        MyStorage['this.previous_label']        ?? "Previous",
            current_label:         MyStorage['this.current_label']         ?? "Current",

            //STATE MANAGEMENT ---------------------------------------------------------------------------------//
            gamestateLogging:     false,
            gameStarted:          true, //tracks if the player has a save game or not
            currentGameStateNew:  "",
            playerID:             999,
            g3stateVariable:      "Base Stats",
            prevSpecies:          undefined,
            prevExpPoints:        0,
            expDebounceTimeoutId: -1,
            expBarAnimation:      true,
            slotTimingFix:        false,
            showAllTrainers:      true,
            enemyModColour:       ["0", "background: #d84444;"],
            enemyState:           "Pokemon",
            field_array:          ["Reflect", 0],
            last_initiated_field_effect: "Reflect",

            //Pokemon settings for local storage
            overlay_color: MyStorage["overlay_color"] ?? "#000000",
            imageXOffset:  MyStorage["imageXOffset"]  ?? 0,
            imageYOffset:  MyStorage["imageYOffset"]  ?? 0,
            imageScale:    MyStorage["imageScale"]    ?? 1,
            imageFlip:     MyStorage["imageFlip"]     ?? false,
            imageSat:      MyStorage["imageSat"]      ?? 100,
            imageRotation: MyStorage["imageRotation"] ?? 0,

            //background texture settings
            backgroundBlur:        MyStorage["backgroundBlur"]        ?? 0,
            backgroundScale:       MyStorage["backgroundScale"]       ?? 100,
            backgroundUrl:         MyStorage["backgroundUrl"]         ?? "",
            backgroundFlip:        MyStorage["backgroundFlip"]        ?? false,
            backgroundXFlip:       MyStorage["backgroundXFlip"]       ?? false,
            use_custom_background: MyStorage["use_custom_background"] ?? false,
            backgroundXOffset:     MyStorage["backgroundXOffset"]     ?? 0,
            backgroundYOffset:     MyStorage["backgroundYOffset"]     ?? 0,
            backgroundTexture:     MyStorage["backgroundTexture"]     ?? 'Bug 1',
            backgroundBrightness:  MyStorage["backgroundBrightness"]  ?? 100,
            backgroundContrast:    MyStorage["backgroundContrast"]    ?? 100,
            backgroundSaturation:  MyStorage["backgroundSaturation"]  ?? 100,
            backgroundHue:         MyStorage["backgroundHue"]         ?? 0,

            //backed up pokemon specific settings
            pokemon_settings: [
                "overlay_color",
                "imageXOffset",
                "imageYOffset",
                "imageScale",
                "imageFlip",
                "imageSat",
                "imageRotation",
                "backgroundBlur",
                "backgroundScale",
                "backgroundUrl",
                "use_custom_background",
                "attempt_number",
                "pb_time",
                "backgroundXOffset",
                "backgroundYOffset",
                "backgroundTexture",
                "backgroundBrightness",
                "backgroundContrast",
                "backgroundSaturation",
                "backgroundFlip",
                "backgroundXFlip",
                "pkmnNature",
                "pkmn_ability",
                "hidden_power_type",
                "hidden_power_index",
                "pkmn_gender",
                "finished_run_count",
                "backgroundHue",
                "evolution",
                "evolution_splits_label",
                "previous_label",
                "current_label",
                "splits_display",
            ],
            //timer variables
            timer_startTimeOffset: MyStorage["timer_startTimeOffset"] ?? "00:00:00.00",
            time_split_start:      MyStorage['time_split_start']     ?? "00:00:00:00",
            battle_start:          MyStorage['battle_start']         ?? 0,
            timer:                 new Timer(MyStorage),

            //resets
            playerId:            MyStorage["playerId"]         ?? 0,
            playerName:          "",
            resetCatcher:        "NINTEN",
            playerResets:        MyStorage["playerResets"]     ?? 0,
            blackout_counter:    MyStorage["blackout_counter"] ?? 0,
            resetCounter:        true,
            game_over:           false,
            hallOfFameReset:     false,
            finished_logs:       false,
            pb_time:             "None",
            split_logStr:        "",
            attempt_number:      0,
            finished_run_count:  0,
            split_data:          MyStorage["split_data"]          ?? [],
            simple_data_str:     MyStorage["simple_data_str"]     ?? "",
            full_data_str:       MyStorage["full_data_str"]       ?? "",
            deprecated_data_str: MyStorage["deprecated_data_str"] ?? "",
            simple_data:         MyStorage["simple_data"]         ?? "",
            testRun:             MyStorage['testRun']             ?? false,
            show_wild_battles:   MyStorage['show_wild_battles']   ?? true,

            previous_splits: MyStorage['previous_splits'] ?? [],
            current_splits:  MyStorage['current_splits']  ?? [],

            //movepool starting parameters. set to -1 if not initialized
            movepoolDefaultFontSize:        -1,
            movepoolDefaultLineHeight:      -1,
            movepoolDefaultContainerHeight: -1,

            //encounters
            route_101:        MyStorage['route_101']        ?? true,
            route_102:        MyStorage['route_102']        ?? true,
            route_103:        MyStorage['route_103']        ?? true,

            route_1:          MyStorage['route_1']          ?? true,
            route_2:          MyStorage['route_2']          ?? true,
            route_22:         MyStorage['route_22']         ?? true,
            viridian_forest:  MyStorage['viridian_forest']  ?? true,
            route_6:          MyStorage['route_6']          ?? true,

            encounter_settings: [
                "route_101",
                "route_102",
                "route_103",
                "route_1",
                "route_2",
                "route_22",
                "viridian_forest",
                "route_6",
            ],

            //HM flags
            hm_102_zigzagoon:   MyStorage['hm_102_zigzagoon']   ?? true,
            hm_104_marill:      MyStorage['hm_104_marill']      ?? true,
            hm_104_taillow:     MyStorage['hm_104_taillow']     ?? true,
            hm_116_abra:        MyStorage['hm_116_abra']        ?? true,
            hm_woods_shroomish: MyStorage['hm_woods_shroomish'] ?? false,
            hm_cave_abra:       MyStorage['hm_cave_abra']       ?? false,
            hm_119_tropius:     MyStorage['hm_119_tropius']     ?? false,

            hm_1_pidgey:      MyStorage['hm_101_pidgey']    ?? true,
            hm_1_rattata:     MyStorage['hm_101_rattata']   ?? true,

            // UI
            ui_saturation:                MyStorage['ui_saturation']                ?? .6,
            ui_type_colors:               MyStorage['ui_type_colors']               ?? "Current",
            ui_type_color_modifier:       MyStorage['ui_type_color_modifier']       ?? "current_",
            ui_type_icons:                MyStorage['ui_type_icons']                ?? "2024",
            ui_type_icons_modifier:       MyStorage['ui_type_icons_modifier']       ?? "2024/",
            ui_stat_arrangement:          MyStorage['ui_stat_arrangement']          ?? "HP, Atk, Def, Spe, SpA, SpD",
            ui_stat_arrangement_modifier: MyStorage['ui_stat_arrangement_modifier'] ?? "hp_spe_",
            ui_stats_styling_modifier:    MyStorage['ui_stats_styling_modifier']    ?? "2024",

            auto_save: [
                "graphicOverlay",
                "frame",
                "gameArea",
                "pokeballFloor",
                "dynamicOverlay",
                "gametime",
                "pick",
                "typeCalcs",
                "moveset",
                "dynamicPower",
                "resets",
                "stats_display",
                "movepool",
                "inventory",
                "battleStats",
                "battleInfo",
                "conditions",
                "expBar",
                "splits",
                "tooltips",
                "btcInfo",
                "returnPower",
                "gamestate",
                "labels",
                "tutor_moves",
                "showSpecialTrainerGraphics",
                "testRun",
                "simple_data_str",
                "full_data_str",
                "deprecated_data_str",
                "simple_data",
                "time_split_start",
                "battle_start",
                "testStatus",
                "autosplitter_toggle",
                "gameSelection",
                "starterString",
                "timer_startTimeOffset",
                "hm_1_pidgey",
                "hm_1_rattata",
                "ui_saturation",
                "ui_type_colors",
                "ui_type_color_modifier",
                "ui_stat_arrangement",
                "ui_stat_arrangement_modifier",
                "repel_counter",
                "vs_seeker",
                "league_rematches",
                "right_panel",
                "ui_type_icons",
                "ui_type_icons_modifier",
                "copy_overlay_pokemon_from",
                "copy_overlay_pokemon_to",
                "stats",
                "automatic_ivs",
                "automatic_evs",
                "display_badge_boosts",
                "show_nature_changes",
                "previous_splits",
                "current_splits",
                "collect_split_data",
                "disable_right_hotkeys",
                "automatic_post_battle_splits",
                "show_wild_battles",
                "no_counters",
                "legacy_state",
                "show_advanced_settings",
                "set_rom_starter_automatically",
                "catch_rate",
                "deoxys_form",
                "post_kanto_evolutions",
                "show_post_battle_splits",
                "shuckie_timer",
                "shuckie_counters",
                "banned_hidden_power",
            ],

            stats_toggle_settings: [
                "stat_exp_display",
                "dv_display",
                "base_stats_display",
                "stats_display",
            ],
            right_panel_toggle: [
                "battleGraphic",
                "inventory_display",
            ],

            right_panel:               MyStorage['right_panel']               ?? 'Battle Graphic',
            copy_overlay_pokemon_from: MyStorage['copy_overlay_pokemon_from'] ?? "",
            copy_overlay_pokemon_to:   MyStorage['copy_overlay_pokemon_to']   ?? "",
        }
    },
    created() {
        import('../lib/gameVariables.js').then((gameVariables) => {
            this.gameVariables = gameVariables.default;
            // Bind the newGame function to the Vue component
            // this.gameVariables.newGame = this.gameVariables.newGame.bind(this);
        })
        if (MyStorage[this.starterString]) {
            let starter = this.starterString;
            if (this.evolution == true) {
                starter = this.evolution_splits_label;
            }
            this.overlay_color          = MyStorage[starter].overlay_color           ?? this.default_colors[dexDataRubySapphireEmerald[this.starterString].type_1];
            this.imageXOffset           = MyStorage[starter].imageXOffset            ?? 0;
            this.imageYOffset           = MyStorage[starter].imageYOffset            ?? 0;
            this.imageScale             = MyStorage[starter].imageScale              ?? 1;
            this.imageFlip              = MyStorage[starter].imageFlip               ?? false;
            this.imageSat               = MyStorage[starter].imageSat                ?? 100
            this.imageRotation          = MyStorage[starter].imageRotation           ?? 0
            this.backgroundBlur         = MyStorage[starter].backgroundBlur          ?? 0
            this.backgroundHue          = MyStorage[starter].backgroundHue           ?? 0
            this.backgroundScale        = MyStorage[starter].backgroundScale         ?? 100
            this.backgroundUrl          = MyStorage[starter].backgroundUrl           ?? ""
            this.use_custom_background  = MyStorage[starter].use_custom_background   ?? false
            this.backgroundXOffset      = MyStorage[starter].backgroundXOffset       ?? 0
            this.backgroundYOffset      = MyStorage[starter].backgroundYOffset       ?? 0
            this.backgroundTexture      = MyStorage[starter].backgroundTexture       ?? `${this.dexData[this.starterString].type_1}`
            this.pkmn_ability           = MyStorage[starter].pkmn_ability            ?? dexDataRubySapphireEmerald[this.starterString].abilities[0]
            this.attempt_number         = MyStorage[starter].attempt_number          ?? 0
            this.finished_run_count     = MyStorage[starter].finished_run_count      ?? 0
            this.evolution              = MyStorage[starter].evolution               ?? 0
            this.evolution_splits_label = MyStorage[starter].evolution_splits_label  ?? 0
        }

        for (let i = 0; i < this.pokemon_settings.length; i++) {
            let propName = this.pokemon_settings[i];
            this.$watch(
                () => this[propName],
                (newValue) => {
                    // Skip saving if we're currently loading evolution styles to prevent overwriting
                    if (this.is_loading_evolution_style) {
                        return;
                    }
                    
                    // Shared evolution family properties (ability, nature, gender, hidden power) 
                    // should be saved to the evolution family storage key when evolution is enabled
                    // These settings apply to all members of the evolution family
                    const sharedEvolutionFamilyProperties = ['pkmnNature', 'pkmn_ability', 'pkmn_gender', 'hidden_power_type', 'hidden_power_index'];
                    const isSharedFamilyProperty = sharedEvolutionFamilyProperties.includes(propName);
                    
                    let storageKey;
                    if (this.evolution && isSharedFamilyProperty) {
                        // Use evolution family storage key for shared properties (e.g., "FireRed_Unfezant-line")
                        const starter = this.starterString || this.starter;
                        storageKey = this.getEvolutionFamilyStorageKey(starter);
                    } else {
                        // Use the appropriate storage key based on evolution mode for other properties
                        // If evolution is enabled and selected_evolution_species is set, use evolution line storage
                        // Otherwise, use individual species storage
                        // This ensures styles are saved to the correct location (e.g., "FireRed_Unfezant-line-Pidove" vs "FireRed_Pidove")
                        storageKey = this.getCurrentStorageKey();
                    }
                    
                    // Ensure that MyStorage[storageKey] is an object
                    if (!MyStorage[storageKey]) {
                        MyStorage[storageKey] = {};
                    }

                    // Set the new value
                    MyStorage[storageKey] = {
                        ...MyStorage[storageKey],
                        [propName]: newValue
                    };
                }
            );
        }
        for (let i = 0; i < this.auto_save.length; i++) {
            let propName = this.auto_save[i];
            this.$watch(
                () => this[propName], // Using a function to return the property's value
                (newValue) => {
                    MyStorage[`${propName}`] = newValue;
                }
            );
        }
        // Special watcher for ui_saturation to save to per-species storage
        // This ensures ui_saturation is saved to the correct storage key based on evolution mode
        this.$watch(
            () => this.ui_saturation,
            (newValue) => {
                // Skip saving if we're currently loading evolution styles to prevent overwriting
                if (this.is_loading_evolution_style) {
                    return;
                }
                
                // Save to per-species storage (same logic as pokemon_settings)
                const storageKey = this.getCurrentStorageKey();
                if (!MyStorage[storageKey]) {
                    MyStorage[storageKey] = {};
                }
                MyStorage[storageKey] = {
                    ...MyStorage[storageKey],
                    ui_saturation: newValue
                };
            }
        );
        for (let i = 0; i < this.encounter_settings.length; i++) {
            let propName = this.encounter_settings[i];
            this.$watch(
                () => this[propName], // Using a function to return the property's value
                (newValue) => {
                    MyStorage[`${propName}`] = newValue;
                    this.freezeEncounters();
                }
            );
        }
        // for (let i = 0; i < this.stats_toggle_settings.length; i++) {
        //     let propName = this.stats_toggle_settings[i];
        //     this.$watch(
        //         () => this[propName], // Using a function to return the property's value
        //         (newValue) => {
        //             MyStorage[`${propName}`] = newValue;
        //         }
        //     );
        // }
        // for (let i = 0; i < this.right_panel_toggle.length; i++) {
        //     let propName = this.right_panel_toggle[i];
        //     this.$watch(
        //         () => this[propName], // Using a function to return the property's value
        //         (newValue) => {
        //             MyStorage[`${propName}`] = newValue;
        //             //!TODO: this needs to call a function to toggle the display on the right side of the screen
        //         }
        //     );
        // }

        // //!Setup the new Storage object
        //         // Initialize the Storage object
        // // This creates all of the objects that will then be filled
        // const debug_mode = false; // This enables the printing of storage related console logs
        // const clear_storage = false; // Use this to test functionality. It resets all the data blocks within the Storage.json file to their default values
        // if (debug_mode) { console.log(`Initializing the Storage Object...`) }
        // if (!Storage['global_variables'] || clear_storage == true) { //If the global variables don't exist, create them
        //     // Assigns the global variables to the Storage object
        //     Storage['global_variables'] = {
        //         starter: this.starterName,
        //         game: this.gameSelection,
        //     }
        // }
        // if (!Storage['application_settings'] || clear_storage == true) {
        //     //Assigns the application settings to the Storage object, these persist when the user changes the starter Pokemon
        //     Storage['application_settings'] = {}
        //     this.application_settings.forEach(setting => {
        //         Storage['application_settings'][setting[0]] = setting[1];
        //     });
        // }
        // if (!Storage['games'] || clear_storage == true) {
        //     // Assigns the game data to the Storage object, these properties will be switched between depending on the game and starter currently selected
        //     Storage['games'] = { //If the games object doesn't exist, create it; everything will be stored within here
        //         "Ruby and Sapphire":    {},
        //         "Emerald":              {},
        //         "FireRed and Sapphire": {},
        //     }
        // }
        // if (debug_mode) { 
        //     console.log(`Success!`) 
        //     console.log(`Initializing Starter Storage Object...`)
        // }
        // if (!Storage['games'][this.gameSelection][this.starterName] || clear_storage == true) {
        //     Storage['games'][this.gameSelection][this.starterName] = {
        //         style:    {},
        //         settings: {},
        //         splits:   {},
        //         data:     {},
        //     };
        //     this.pokemon_settings.forEach(setting => {
        //         Storage['games'][this.gameSelection][this.starterName].style[setting[0]] = setting[1];
        //     });
        // }
        // if (debug_mode) { console.log(`Success!`) }

        // // Initialize watchers for all of the style properties. 
        // // These are game and Pokemon specific saved within: Storage.games[game][starter]
        // // Define variables
        // if (debug_mode) { 
        //     console.log(`Stored Starter: ${this.starterName}`) 
        //     console.log(`Stored Game: ${this.gameSelection}`)
        // }
        // //Loop through application settings and create watchers
        // for (let i = 0; i < this.application_settings.length; i++) {
        //     let [prop_name, value] = this.application_settings[i];
        //     this.$watch(
        //         () => this[prop_name],
        //         (new_value) => {
        //             if (!Storage.application_settings) {
        //                 Storage.application_settings = {};
        //             }
        //             Storage.application_settings = {
        //                 ...Storage.application_settings,
        //                 [prop_name]: new_value
        //             };
        //         }
        //     );
        // }
        // //Loop through style settings that will be saved within a game and specific Pokemon
        // for (let i = 0; i < this.pokemon_settings.length; i++) {
        //     let [prop_name, value] = this.pokemon_settings[i];
        //     this.$watch(
        //         () => this[prop_name],
        //         (new_value) => {
        //             if (!Storage.games[this.gameSelection][this.starterName].style) {
        //                 Storage.games[this.gameSelection][this.starterName].style = {};
        //             }
        //             Storage.games[this.gameSelection][this.starterName].style = {
        //                 ...Storage.games[this.gameSelection][this.starterName].style,
        //                 [prop_name]: new_value
        //             };
        //         }
        //     );
        // }
        // if (debug_mode) { 
        //     console.log(`Storage finished initialization. Printing Storage object to console...`) 
        //     console.log(Storage) 
        //     console.log(`Loading settings from the Storage object into the application...`) 
        //     console.log(Storage['global_variables'].starter) 
        //     console.log(Storage['global_variables'].game) 
        // }
        // // Load Settings from the Storage object
        // // Load Starter and Game
        // this.starterName   = Storage['global_variables'].starter;
        // this.gameSelection = Storage['global_variables'].game;
        // // // Application Settings
        // for (let key in Storage.application_settings) {
        //     if (debug_mode) { 
        //         console.log(`Application Setting Key: ${key}`) 
        //     }
        //     let application_settings = Object.entries(Storage.application_settings); // Assign the Pokemon's style settings to an array
        //     for (let i = 0; i < application_settings.length; i++) { // Iterate through the array
        //         this[key] = Storage.application_settings[key]; // Assign the values for each setting to the data() properties
        //     }
        // }
        // // Pokemon Style Settings
        // for (let key in Storage.games[this.gameSelection][this.starterName].style) {
        //     if (debug_mode) { 
        //         console.log(`Pokemon Style Key: ${key}`) 
        //         console.log(Storage.games[this.gameSelection][this.starterName].style[key])
        //     }
        //     let style_settings = Object.entries(Storage.games[this.gameSelection][this.starterName].style); // Assign the Pokemon's style settings to an array
        //     for (let i = 0; i < style_settings.length; i++) { // Iterate through the array
        //         this[key] = Storage.games[this.gameSelection][this.starterName].style[key]; // Assign the values for each setting to the data() properties
        //     }
        // }
        // if (debug_mode) { 
        //     console.log(`Success!`) 
        //     console.log(`Loaded all settings from Storage.`) 
        // }
    },

    watch: {
        post_kanto_evolutions(newValue) {
            if (newValue == true) {
                this.mapper.properties.patch.stp_flags.stp_allow_evolution.set(true, false)
            }
            else {
                this.mapper.properties.patch.stp_flags.stp_allow_evolution.set(false, false)
            }
        },
        evolution(newValue) {
            // When evolution checkbox is toggled, immediately switch to parallel styling
            // Style watchers will automatically save to the correct storage based on getCurrentStorageKey()
            // console.log('Evolution watcher triggered:', newValue);
            
            // Handle legacy split label functionality
            if (this.ready !== false) {
                const starter = this.starterString || this.starter;
                const evolution_family = this.evolution_data_pokedex?.[starter]?.evolution_family;
                const family_length = evolution_family?.length;
                
                if (family_length) {
                    const split_label = `${evolution_family[evolution_family.length - 1]?.species}-line`;
                    if (newValue == true) {
                        this.evolution_splits_label = split_label;
                    }
                    if (newValue == false) {
                        this.evolution_splits_label = "";
                    }
                    for (let i = 0; i < family_length; i++) {
                        const species = evolution_family[i].species;
                        if (species) {
                            if (!MyStorage[species]) {
                                MyStorage[species] = {};
                            }
                            MyStorage[species] = {
                                ...MyStorage[species],
                                evolution             : newValue,
                                evolution_splits_label: this.evolution_splits_label,
                                attempt_number        : this.attempt_number,
                                finished_run_count    : this.finished_run_count,
                            };
                        }
                    }
                }
            }
            
            if (newValue) {
                // Update evolution family list first
                const starter = this.starterString || this.starter;
                // console.log('Updating evolution family list for:', starter);
                this.updateEvolutionFamilyList();
                // console.log('Evolution family list:', this.evolution_family_list);
                
                // Always set default selected evolution species to the starter when enabling
                // Set selected_evolution_species if not set or if current selection is invalid
                if (!this.selected_evolution_species || 
                    (this.evolution_family_list.length > 0 && !this.evolution_family_list.includes(this.selected_evolution_species))) {
                    this.selected_evolution_species = starter;
                    // console.log('Set selected_evolution_species to:', starter);
                    
                    // Save selected evolution species to storage
                    const game_name = this.mapper?.properties?.meta?.game_name?.value || this.gameSelection;
                    if (!MyStorage[`${game_name}_${starter}`]) {
                        MyStorage[`${game_name}_${starter}`] = {};
                    }
                    MyStorage[`${game_name}_${starter}`] = {
                        ...MyStorage[`${game_name}_${starter}`],
                        selected_evolution_species: starter
                    };
                }
                
                // Always load styles immediately when evolution is enabled
                if (this.selected_evolution_species) {
                    // console.log('Loading evolution style for:', this.selected_evolution_species);
                    this.loadEvolutionStyle(this.selected_evolution_species, true);
                } else {
                    // console.log('WARNING: selected_evolution_species is not set!');
                }
            } else {
                // When disabled, immediately switch back to normal non-evolution styling
                const starter = this.starterString || this.starter;
                // console.log('Loading normal style for:', starter);
                this.loadEvolutionStyle(starter, false);
            }
        },
        selected_evolution_species(newValue, oldValue) {
            // When a different evolution family species is selected in the dropdown:
            // 1. The Pokemon art will automatically update via displayedPokemonSpecies computed property
            // 2. Load its styles from evolution line storage (e.g., "Unfezant-line-Pidove")
            // 3. If there's a transition (oldValue exists), perform a fade transition
            // 4. Save the selection to storage
            if (newValue && this.evolution) {
                // Load evolution line styles first (before transition) to ensure styles are loaded
                // The flag in loadEvolutionStyle will prevent watchers from overwriting
                this.loadEvolutionStyle(newValue, true);
                
                // Recalculate movepool size for the new species
                this.$nextTick(() => {
                    this.movepoolResize();
                });
                
                // If we're changing from one species to another (not initial load), perform transition
                if (oldValue && oldValue !== newValue) {
                    this.performEvolutionTransition(oldValue, newValue);
                }
                
                // Save selected evolution species to storage
                const game_name = this.mapper?.properties?.meta?.game_name?.value || this.gameSelection;
                if (!MyStorage[`${game_name}_${this.starter}`]) {
                    MyStorage[`${game_name}_${this.starter}`] = {};
                }
                MyStorage[`${game_name}_${this.starter}`] = {
                    ...MyStorage[`${game_name}_${this.starter}`],
                    selected_evolution_species: newValue
                };
            }
        },
        starterString(newValue, oldValue) {
            // const state = this.mapper?.properties.meta.state.value
            const starter = newValue
            const game = this.gameSelection
            const state = this.g3stateVariable
            //background texture settings
            this.overlay_color =          MyStorage[`${newValue}`]?.overlay_color          ?? this.default_colors[dexDataRubySapphireEmerald[newValue].type_1]
            this.evolution =              MyStorage[`${newValue}`]?.evolution              ?? false
            this.evolution_splits_label = MyStorage[`${newValue}`]?.evolution_splits_label ?? ""
 
            // Update evolution family list when starter changes
            this.updateEvolutionFamilyList();
            
            // If evolution is enabled, load selected_evolution_species from storage or default to starter
            if (this.evolution && this.evolution_family_list.length > 0) {
                // Load selected evolution species from storage
                const stored_evolution_species = MyStorage[`${game}_${starter}`]?.selected_evolution_species;
                if (stored_evolution_species && this.evolution_family_list.includes(stored_evolution_species)) {
                    this.selected_evolution_species = stored_evolution_species;
                } else {
                    // Default to starter if not set or invalid
                    this.selected_evolution_species = starter;
                    // Save it
                    if (!MyStorage[`${game}_${starter}`]) {
                        MyStorage[`${game}_${starter}`] = {};
                    }
                    MyStorage[`${game}_${starter}`] = {
                        ...MyStorage[`${game}_${starter}`],
                        selected_evolution_species: starter
                    };
                }
                
                // Load evolution line styles for the selected species
                this.loadEvolutionStyle(this.selected_evolution_species, true);
            } else {
                // Load individual species styles
                if (!MyStorage[`${game}_${starter}`]) {
                    MyStorage[`${game}_${starter}`] = {};
                }
                this.loadEvolutionStyle(starter, false);
            }

            // this.frame =                  MyStorage[`${newValue}`]?.frame                  ?? true
            // this.backgroundTexture =      MyStorage[`${newValue}`]?.backgroundTexture      ?? `${this.dexData[newValue].type_1}`
            // this.backgroundBlur =         MyStorage[`${newValue}`]?.backgroundBlur         ?? 0
            // this.backgroundHue =          MyStorage[`${newValue}`]?.backgroundHue          ?? 0
            // this.backgroundScale =        MyStorage[`${newValue}`]?.backgroundScale        ?? 100
            // this.backgroundUrl =          MyStorage[`${newValue}`]?.backgroundUrl          ?? ""
            // this.backgroundFlip =         MyStorage[`${newValue}`]?.backgroundFlip         ?? false
            // this.backgroundXFlip =        MyStorage[`${newValue}`]?.backgroundXFlip        ?? false
            // this.use_custom_background =  MyStorage[`${newValue}`]?.use_custom_background  ?? false
            // this.backgroundXOffset =      MyStorage[`${newValue}`]?.backgroundXOffset      ?? 0
            // this.backgroundYOffset =      MyStorage[`${newValue}`]?.backgroundYOffset      ?? 0
            // this.backgroundBrightness =   MyStorage[`${newValue}`]?.backgroundBrightness   ?? 100
            // this.backgroundContrast =     MyStorage[`${newValue}`]?.backgroundContrast     ?? 100
            // this.backgroundSaturation =   MyStorage[`${newValue}`]?.backgroundSaturation   ?? 100
            // //Attempts and finishes
            // if(this.evolution) {
            //     this.attempt_number =         MyStorage[`${this.evolution_splits_label}`]?.attempt_number     ?? 0
            //     this.finished_run_count =     MyStorage[`${this.evolution_splits_label}`]?.finished_run_count ?? 0
            // }
            // else {
            //     this.attempt_number =         MyStorage[`${newValue}`]?.attempt_number     ?? 0
            //     this.finished_run_count =     MyStorage[`${newValue}`]?.finished_run_count ?? 0
            // }

            // //main pokemon settings
            // MyStorage['starterString'] =  newValue
            // this.pkmnNature =             MyStorage[`${newValue}`]?.pkmnNature        ?? "Hardy"
            // this.pkmn_ability =           MyStorage[`${newValue}`]?.pkmn_ability      ?? this.dexDataRubySapphireEmerald[newValue].abilities[0]
            // this.hidden_power_type =      MyStorage[`${newValue}`]?.hidden_power_type ?? "Dark"
            // this.hidden_power_index =     MyStorage[`${newValue}`]?.hidden_power_index ?? 0
            // this.pkmn_gender =            MyStorage[`${newValue}`]?.pkmn_gender       ?? "Female"

            // Keep frame setting from individual storage for now
            this.frame = MyStorage[`${game}_${starter}`]?.frame ?? false

            // Load shared evolution family settings (ability, nature, gender, hidden power) if evolution is enabled
            // Otherwise, load from individual species storage
            if (this.evolution) {
                const evolutionFamilyStorageKey = this.getEvolutionFamilyStorageKey(starter);
                const familyStored = MyStorage[evolutionFamilyStorageKey] || {};
                
                // Load from evolution family storage, fallback to individual storage, then defaults
                this.pkmnNature = familyStored.pkmnNature ?? MyStorage[`${game}_${starter}`]?.pkmnNature ?? "Hardy";
                this.pkmn_ability = familyStored.pkmn_ability ?? MyStorage[`${game}_${starter}`]?.pkmn_ability ?? (this.game?.dexData?.[starter]?.abilities?.[0]) ?? null;
                this.pkmn_gender = familyStored.pkmn_gender ?? MyStorage[`${game}_${starter}`]?.pkmn_gender ?? "Female";
                this.hidden_power_type = familyStored.hidden_power_type ?? MyStorage[`${game}_${starter}`]?.hidden_power_type ?? "Dark";
                this.hidden_power_index = familyStored.hidden_power_index ?? MyStorage[`${game}_${starter}`]?.hidden_power_index ?? 0;
            } else {
                // Evolution is disabled, load from individual species storage
                this.pkmnNature = MyStorage[`${game}_${starter}`]?.pkmnNature ?? "Hardy";
                this.pkmn_ability = MyStorage[`${game}_${starter}`]?.pkmn_ability ?? null;
                this.pkmn_gender = MyStorage[`${game}_${starter}`]?.pkmn_gender ?? "Female";
                this.hidden_power_type = MyStorage[`${game}_${starter}`]?.hidden_power_type ?? "Dark";
                this.hidden_power_index = MyStorage[`${game}_${starter}`]?.hidden_power_index ?? 0;
            }
            
            //! FIX_LATER Fix this implementation later
            // this.ability           = MyStorage[`${game}_${starter}`]?.ability          ?? this.g4PokemonData[starter].abilities[0],
            this.encounters_route_1 = MyStorage[`${game}_${starter}`]?.encounters_route_1 ?? false
            this.encounters_route_2 = MyStorage[`${game}_${starter}`]?.encounters_route_2 ?? false
            
            // Evolution management
            if (this.evolution != true) {
                this.evolution              = MyStorage[`${game}_${starter}`]?.evolution              ?? false
                this.evolution_splits_label = MyStorage[`${game}_${starter}`]?.evolution_splits_label ?? ""

                this.attempt_number     = MyStorage[`${game}_${starter}`]?.attempt_number     ?? 0
                this.finished_run_count = MyStorage[`${game}_${starter}`]?.finished_run_count ?? 0
                this.playerResets       = MyStorage[`${game}_${starter}`]?.playerResets       ?? 0
                this.blackout_counter   = MyStorage[`${game}_${starter}`]?.blackout_counter   ?? 0
            }
            else {

            }
            this.movepoolResize();
        },
        current_splits: {
            handler: function (newVal, oldVal) {
                MyStorage['current_splits'] = newVal
            },
            deep: true,
        },
        previous_splits: {
            handler: function (newVal, oldVal) {
                MyStorage['previous_splits'] = newVal
            },
            deep: true,
        },
        ui_stat_arrangement(newValue) {
            if (newValue == 'Speed: bottom right') {
                this.ui_stat_arrangement_modifier = "hp_spe_"
            }
            if (newValue == 'Speed: top right') {
                this.ui_stat_arrangement_modifier = "hp_spd_"
            }
        },
        ui_type_icons(newValue) {
            if (newValue == '2024') {
                this.ui_type_icons_modifier = "2024/"
            }
            if (newValue == '2023') {
                this.ui_type_icons_modifier = ""
            }
        },
        ui_type_colors(newValue) {
            if (newValue == 'Current') {
                this.ui_type_color_modifier = "current_"
            }
            if (newValue == 'Legacy') {
                this.ui_type_color_modifier = "legacy_"
            }
            if (newValue == 'Legacy Stats & Current Type') {
                this.ui_type_color_modifier = "blended_"
            }
        },
        //*Autosplitter
        //log the start of a battle
        g3stateVariable(newProp) {
            // console.log("G3StateVariable newProp: " + newProp)
            try {
                var logStr = `Autosplitter - Battle Started: ${this.batt.trainer[this.game.opponent].value} started at ${this.timer.formatted_time[0]}${this.timer.formatted_time[1]} (Gametime: ${this.gametimeSplit})`
            }
            catch {
                
            }
            var log_start = (x) => console.log(logStr)
            // console.log("checking - newprop: "+ newProp)
            // console.log("this.mapper.properties.battle.type.trainer: "+this.mapper.properties.battle.type.trainer)
            if (newProp == "Battle" && this.mapper.properties.battle.type.trainer.value == true) {
                this.split_logStr = logStr
                this.battle_start = Date.now()
                const time = this.timer.getTime();
                this.time_split_start = this.padTime(time.hours) + ":" + this.padTime(time.minutes) + ":" + this.padTime(time.seconds) + "." + this.padTime(time.ms)
                log_start()
            }

            if (newProp == "To Battle" && this.mapper.properties.battle.type.trainer.value == false && this.show_wild_battles == true) {
                this.right_panel = "Wild"
            }

            if (newProp == "To Battle" && this.mapper.properties.battle.type.trainer.value == true) {
                this.right_panel = "Battle Graphic"
            }
        },
        hm_102_zigzagoon(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.encounters?.zigzagoon?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.encounters?.zigzagoon?.set(true, false)
            }
            MyStorage['hm_102_zigzagoon'] = newValue
        },
        hm_104_marill(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.encounters?.marill?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.encounters?.marill?.set(true, false)
            }
            MyStorage['hm_104_marill'] = newValue
        },
        hm_104_taillow(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.encounters?.taillow?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.encounters.taillow.set(true, false)
            }
            MyStorage['hm_104_taillow'] = newValue
        },
        hm_116_abra(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.encounters?.abra_116?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.encounters.abra_116.set(true, false)
            }
            MyStorage['hm_116_abra'] = newValue
        },
        hm_woods_shroomish(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.encounters?.shroomish?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.encounters.shroomish.set(true, false)
            }
            MyStorage['hm_woods_shroomish'] = newValue
        },
        hm_cave_abra(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.encounters?.abra_granite?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.encounters.abra_granite.set(true, false)
            }
            MyStorage['hm_cave_abra'] = newValue
        },
        hm_119_tropius(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.encounters?.tropius_119?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.encounters.tropius_119.set(true, false)
            }
            MyStorage['hm_119_tropius'] = newValue
        },
        hm_1_pidgey(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.stp_pidgey_on_route_1?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.stp_pidgey_on_route_1?.set(true, false)
            }
            MyStorage['hm_1_pidgey'] = newValue
        },
        hm_1_rattata(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.stp_rattata_on_route_1?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.stp_rattata_on_route_1?.set(true, false)
            }
            MyStorage['hm_1_rattata'] = newValue
        },
        catch_rate(newValue) {
            let game = this.gameSelection
            if (game == "Emerald") {
                if (newValue == false) {
                    this.mapper.properties.stp_vars?.STP_CATCH_RATE?.set(0, true)
                }
                if (newValue == true) {
                    this.mapper.properties.stp_vars?.STP_CATCH_RATE?.set(1, true)
                }
                MyStorage['catch_rate'] = newValue
            }
            else if (game == "FireRed and LeafGreen") {
                if (newValue == false) {
                    this.mapper.properties.patch?.STP_CATCH_RATE?.set(0, true)
                }
                if (newValue == true) {
                    this.mapper.properties.patch?.STP_CATCH_RATE?.set(1, true)
                }
                MyStorage['catch_rate'] = newValue
            }
        },
        playerId(newValue) {
            MyStorage["playerId"]         = newValue
            this.game_over                = false;
            MyStorage["playerResets"]     = 0
            this.playerResets             = 0;
            this.finished_logs            = false;
            MyStorage["blackout_counter"] = 0
            this.blackout_counter         = 0;
        },    
        overlay_color(newColor) {
            document.documentElement.style.setProperty('--overlay-color', newColor);
        }, 
        playerResets(newProp) {
            switch (this.playerResets.toString().length) {
                case 1:
                case 2: document.getElementById("reset_counter").style.fontSize = "68px"; document.getElementById("reset_counter_single").style.fontSize = "68px"; break;
                case 3: document.getElementById("reset_counter").style.fontSize = "58px"; document.getElementById("reset_counter_single").style.fontSize = "58px"; break;
                case 4: document.getElementById("reset_counter").style.fontSize = "48px"; document.getElementById("reset_counter_single").style.fontSize = "48px"; break;
            }
            
            if (this.playerResets < 0) {
                this.playerResets = 0;
            }
            // this.blackout == false
            MyStorage["playerResets"] = this.playerResets
        },
        blackout_counter(newProp) {
            if (this.playerResets > 0) {
                switch (this.blackout_counter.toString().length) {
                    case 1:
                    case 2: document.getElementById("blackout_counter").style.fontSize = "68px"; break;
                    case 3: document.getElementById("blackout_counter").style.fontSize = "58px"; break;
                    case 4: document.getElementById("blackout_counter").style.fontSize = "48px"; break;
                }
            }
            else {
                switch (this.blackout_counter.toString().length) {
                    case 1:
                    case 2: document.getElementById("reset_counter").style.fontSize = "68px"; break;
                    case 3: document.getElementById("reset_counter").style.fontSize = "58px"; break;
                    case 4: document.getElementById("reset_counter").style.fontSize = "48px"; break;
                }
            }

            if (this.blackout_counter < 0) {
                this.blackout_counter = 0;
            }
            MyStorage["blackout_counter"] = this.blackout_counter
        },
        rockTunnelDarkness() {
            if (this.rockTunnelDarkness == true && (this.mapper.properties.overworld.map.value == "Rock Tunnel - 1" || this.mapper.properties.overworld.map.value == "Rock Tunnel")) {
                this.mapper.properties.overworld.mapData.palette.set(0, false)
            }
            else if (this.rockTunnelDarkness == false && (this.mapper.properties.overworld.map.value == "Rock Tunnel - 1" || this.mapper.properties.overworld.map.value == "Rock Tunnel")) {
                this.mapper.properties.overworld.mapData.palette.set(6, false)
            }
            else {
                return
            }
        },  
        playerNameChoice() {
            this.overlay_color = `lch(75% 100 ${hash(this.playerNameChoice) % 360})`
            MyStorage["playerNameChoice"] = this.playerNameChoice
            MyStorage["overlay_color"] = this.overlay_color
        },
        playerName(newName) {
            MyStorage['playerName'] = newName;
        },
        evolution_legacy(newValue) {
            // Legacy watcher for split labels - kept for backwards compatibility
            // Main evolution watcher is at line 1375
            if (this.ready == false) { return }
            const starter = this.starterString || this.starter;
            const evolution_family = this.evolution_data_pokedex?.[starter]?.evolution_family
            const family_length = evolution_family?.length
            if (!family_length) { return; }
            
            const split_label = `${evolution_family[evolution_family.length - 1]?.species}-line`
            // console.log(evolution_family)
            if (newValue == true) {
                this.evolution_splits_label = split_label
            }
            if (newValue == false) {
                this.evolution_splits_label = ""
            }
            for (let i = 0; i < family_length; i++) {
                const species = evolution_family[i].species;
                if (species) {
                    if (!MyStorage[species]) {
                        MyStorage[species] = {};
                    }
                    MyStorage[species] = {
                        ...MyStorage[species],
                        evolution             : newValue,
                        evolution_splits_label: this.evolution_splits_label,
                        attempt_number        : this.attempt_number,
                        finished_run_count    : this.finished_run_count,
                    };
                }
            }
        },
    },

    computed: {
        /**
         * Check if the current Pokemon has multiple evolution stages
         * Returns true if evolution family has more than one species
         * Used to show/hide evolution checkbox (hide for single-species families like Registeel)
         */
        hasMultipleEvolutionStages() {
            // Get the evolution family for the current starter
            const starter = this.starterString || this.starter;
            if (!starter) return false;
            
            const evolutionFamily = this.getEvolutionFamily(starter);
            return evolutionFamily && evolutionFamily.length > 1;
        },
        blackouts_resets() {
            const resets = this.playerResets
            const blackouts = this.blackout_counter
            const allow_none = true // Toggle that allows for the UI to display no border if there are no faults
            if (allow_none == true && blackouts == 0 && resets == 0) {
                return "None"
            }
            else if (blackouts == 0 && resets > 0) {
                return "Resets"
            }
            else if (blackouts > 0 && resets == 0) {
                return "Blackouts"
            }
            else {
                return "Both"
            }
        },
        deoxys_form_base_stats() {
            switch (this.deoxys_form) {
                case "Speed"  : {
                    return {
                        "Hp"             : 50,
                        "Attack"         : 95,
                        "Defense"        : 90,
                        "Special Attack" : 95,
                        "Special Defense": 90,
                        "Speed"          : 180
                    }
                }
                case "Normal" : {
                    return {
                        "Hp"             : 50,
                        "Attack"         : 150,
                        "Defense"        : 50,
                        "Special Attack" : 150,
                        "Special Defense": 50,
                        "Speed"          : 150
                    }
                }
                case "Attack" : {
                    return {
                        "Hp"             : 50,
                        "Attack"         : 180,
                        "Defense"        : 20,
                        "Special Attack" : 180,
                        "Special Defense": 20,
                        "Speed"          : 150
                    }
                }
                case "Defense": {
                    return {
                        "Hp"             : 50,
                        "Attack"         : 70,
                        "Defense"        : 160,
                        "Special Attack" : 70,
                        "Special Defense": 160,
                        "Speed"          : 90
                    }
                }
            }
        },
        deoxys_image() {
            if (this.starterString == "Deoxys") {
                switch (this.deoxys_form) {
                    case "Speed"  : return "Deoxys-Speed"
                    case "Normal" : return "Deoxys-Normal"
                    case "Attack" : return "Deoxys-Attack"
                    case "Defense": return "Deoxys-Defense"
                }
            }
        },
        filtered_pokemon_list() {
            if (this.search_term === '') {
                return this.pokemon_list;
            } else {
                return this.pokemon_list.filter(pokemon => pokemon.toLowerCase().includes(this.search_term.toLowerCase()));
            }
        },
        ev_total() {
            let ev_hp  = this.mapper.properties.player.team[0].evHp.value
            let ev_atk = this.mapper.properties.player.team[0].evAttack.value
            let ev_def = this.mapper.properties.player.team[0].evDefense.value
            let ev_spa = this.mapper.properties.player.team[0].evSpecialAttack.value
            let ev_spd = this.mapper.properties.player.team[0].evSpecialDefense.value
            let ev_spe = this.mapper.properties.player.team[0].evSpeed.value
            let total = ev_hp + ev_atk + ev_def + ev_spa + ev_spd + ev_spe
            return total   
        },
        compare_splits() {
            if (this.collect_split_data == true) {
                const result = []
                let lastPushedTrainer = null; // Keep track of the last pushed trainer
                const trainersToSkip = ["ELITE_FOUR_LORELEI_2", "ELITE_FOUR_BRUNO_2", "ELITE_FOUR_AGATHA_2", "ELITE_FOUR_LANCE_2", "CHAMPION_REMATCH_CHARMANDER", "CHAMPION_REMATCH_BULBASAUR", "CHAMPION_REMATCH_SQUIRTLE"]; // Trainers to skip
                const firstOccurrenceOnly = ["ELITE_FOUR_SIDNEY", "ELITE_FOUR_PHOEBE", "ELITE_FOUR_GLACIA", "ELITE_FOUR_DRAKE", "CHAMPION_WALLACE"]; // Characters to only show first occurrence of
                const processedFirstOccurrences = new Set(); // Track which characters have already been processed for first occurrence
                
                // Helper to normalize trainer ID to display name for matching rival variants
                const getNormalizedName = (trainerId) => this.trainer_name_lookup[trainerId]?.trainer ?? trainerId;
                
                for (const x of this.previous_splits) {
                    if (this.split_trainers.includes(x.trainer)) {
                        // Skip if this is a character that should only show first occurrence and we've already processed it
                        if (firstOccurrenceOnly.includes(x.trainer) && processedFirstOccurrences.has(x.trainer)) {
                            continue;
                        }
                        
                        const default_string = "-"
                        // Match by normalized display name so rival variants (e.g. different starters) are treated as the same split
                        const normalizedName = getNormalizedName(x.trainer);
                        const cur_split = this.current_splits.find(y => y.trainer === x.trainer || getNormalizedName(y.trainer) === normalizedName)
                        const prev = this.convertDurationToSeconds(x.time)
                        if (cur_split == undefined) { 
                            if (x.trainer !== lastPushedTrainer && !(this.league_rematches == false && this.gameSelection === "FireRed and LeafGreen" && trainersToSkip.includes(x.trainer))) { // Check if the current trainer is the same as the last pushed one and if it should be skipped
                                result.push({trainer: x.trainer, previous_time: this.convertSecondsToDuration(prev), current_time: default_string, difference: default_string}) 
                                lastPushedTrainer = x.trainer; // Update the last pushed trainer
                                // Mark this character as processed for first occurrence
                                if (firstOccurrenceOnly.includes(x.trainer)) {
                                    processedFirstOccurrences.add(x.trainer);
                                }
                            }
                            continue
                        }
                        const cur = this.convertDurationToSeconds(cur_split.time)
                        const diff = cur - prev;
                        const diff_abs = Math.abs(diff);
                        const diff_sign = Math.sign(diff);
                        const diff_m = Math.floor(diff_abs / 60);
                        const diff_s = diff_abs % 60;
                        var diff_str = `${diff_sign === -1 ? "-" : "+"}${diff_m}:${diff_s.toString().padStart(2, "0")}`;
                        if (diff_str == "+0:00") { diff_str = "0:00" }
                        if (x.trainer !== lastPushedTrainer && !(this.league_rematches && this.gameSelection === "FireRed and LeafGreen" && trainersToSkip.includes(x.trainer))) { // Check if the current trainer is the same as the last pushed one and if it should be skipped
                            result.push({trainer: x.trainer, previous_time: this.convertSecondsToDuration(prev), current_time: this.convertSecondsToDuration(cur), difference: diff_str})
                            lastPushedTrainer = x.trainer; // Update the last pushed trainer
                            // Mark this character as processed for first occurrence
                            if (firstOccurrenceOnly.includes(x.trainer)) {
                                processedFirstOccurrences.add(x.trainer);
                            }
                        }
                    }
                }
                return result
            }
        },
        stats_header() {
            const stat_type = this.stats
            const state     = this.g3stateVariable
            if (stat_type == 'Base Stats Average') {
                return 'Averages'
            }
            if (stat_type == 'Base Stats Median') {
                return 'Medians'
            }
            if (stat_type == 'Comparison') {
                return 'Comparison'
            }
            if (stat_type == 'Evolution') {
                return 'Evolution'
            }
            switch (stat_type) {
                case "Base Stats": return `Base Stats`
                case "IVs":        return `IVs`
                case "EVs": {
                    return `EVs (Lv:${this.mapper.properties.player.team[0].level.value})`
                }
                case "Detailed EVs": {
                    return `Detailed EVs`
                }
                case "Automatic":    {
                    if (state == 'Base Stats' || this.mapper.properties.player.team[0].species.value == null) {
                        return `Base Stats`
                    }
                    return `Level ${this.mapper.properties.player.team[0].level.value}`
                }
                case "Badge Boosts": return `Level ${this.mapper.properties.player.team[0].level.value}`
            }
        },
        //boolean to check for the tutorial catching battle with wally
        zigzagoon_check() {
            const zigzagoon = this.mapper.properties.player.team[0].species.value
            const map = this.mapper.properties.overworld.mapName.value
            const starter = this.starterString
            if (starter != "Zigzagoon" && (map == "ROUTE 102"|| map == "PETALBURG_CITY" || map == "PETALBURG_CITY - GYM") && zigzagoon == "Zigzagoon") {
                return true
            }
            else { 
                return false
            }
        },
        gametimeSplit() {
            h = this.mapper.properties.gameTime.hours
            m = this.mapper.properties.gameTime.minutes
            timecode = h + ":" + m.toString().padStart(2, "0")
            return timecode
        },
        dropdownDownMenuKeys() {
            return {
                textures: Object.keys(this.textures)
            }
        },
        pkmnAbility() {
            // if (this.pkmn_ability == false) {
            //     return this.dexData[this.starterString]["abilities"][0]
            // }
            // if (this.pkmn_ability == true) {
            //     return this.dexData[this.starterString]["abilities"][1]
            // }

            //this code requires a mapper update to set the nature at the start for multinature pokemon
            //leaving it commented until then
            if(this.g3stateVariable=="Battle" && this.mapper.properties.battle.yourPokemon.ability?.value != null) {
                let ability = this.pascalCaseSpace(this.mapper.properties.battle.yourPokemon?.ability?.value.toLowerCase());
                if(ability=="Natural Care") {
                    return "Natural Cure"; //typo in mapper
                }
                return ability;
            }
            else {

                return this.pkmn_ability;
            }
        },
        enemyTrainerName() {
            try {
                // return this.trainerLists[this.game?.trainerList][this.opponentId?.value]?.trainer_name
                return this.enemyTrainer.trainer_name
            } catch (error) {
                return "";
            }
        },
        enemyTrainerPokemon() {
            return this.enemyTrainer.pokemon;
        },
        enemyTrainer() {
            if(this.opponentId ==0 || !this.opponentId) {
                this.opponentId.change((newProp) => {
                    return this.enemyTrainerList[this.opponentId];    
                })
            }
            else {
                return this.enemyTrainerList[this.opponentId]    
            }
        },
        enemyTeam() {
            return this.mapper.properties.battle.trainer.team
        },
        s1() {
            return this.mapper?.properties?.player?.team[0]
        },
        map() {
            return this.mapper?.properties
        },
        batt() {
            return this.mapper?.properties?.battle
        },
        battEn() {
            return this.mapper?.properties?.battle?.enemyPokemon
        },
        opponent() {
            return this.mapper?.properties?.battle.trainer[this.game?.opponent]?.value
        },
        opponentId() {
            return this.mapper?.properties?.battle.trainer[this.game?.opponentId]?.value
        },
        s1dynamic() {
            if (this.mapper?.properties?.player?.team[0]?.species?.value == "Backport") {
                return {
                    species: {
                        value: this.starterString
                    }
                };
            }
            if (this.g3stateVariable == `Battle`) {
                return this.mapper?.properties?.battle?.yourPokemon
            }
            else {
                return this.mapper?.properties?.player?.team[0]
            }
        },
        s1dynamicReset() {
            if (this.mapper?.properties?.player?.team[0]?.species?.value == "Backport") {
                return {
                    species: {
                        value: this.starterString
                    }
                };
            }
            if (this.starterString == "Mr. Mime") {
                var data = this.dexData[this.starterString]
                return {
                    species: { value: data["name"] },
                    ...data
                }
            }
            if (this.starterString == "Ditto") {
                var data = this.dexData[this.starterString]
                return {
                    species: { value: data["name"] },
                    ...data
                }
            }
            if (this.zigzagoon_check == true) {
                var data = this.dexData[this.starterString]
                return {
                    species: { value: data["name"] },
                    ...data
                }
            }
            else if (this.g3stateVariable == `Battle`) {
                let specArr = this.mapper.properties.battle.yourPokemon.speciesArray.value;
                try {
                    let indexStart = specArr.indexOf("\'");
                    let indexEnd = specArr.indexOf("\'",indexStart+1);
                    let speciesValue = specArr.substring(indexStart+1,indexEnd);
                    return {
                        species: {
                            value: speciesValue
                        }
                    };
                }
                catch {
                    return {
                        species: {
                            value: this.starterString
                        }
                    };
                }
                // return this.mapper?.properties?.battle?.yourPokemon
            }
            else if (this.g3stateVariable == `Base Stats` || this.mapper?.properties?.player?.team[0].species.value == null) {
                var data = this.dexData[this.starterString]
                return {
                    species: { value: data["name"] },
                    ...data
                }
            }
            else {
                return this.mapper?.properties?.player?.team[0]
            }
        },
        typeHeaderColor() {
            const starter_type2 = this.dexData[this.starterString]?.type_2
            if (this.mapper.properties.battle.type.old_man_tutorial.value == true) { return starter_type2 }
            if (this.zigzagoon_check == `Base Stats`) { return starter_type2}
            if (this.g3stateVariable == `Battle`) { return this.mapper.properties.battle.yourPokemon.type2.value }
            if (this.g3stateVariable == `Overworld` && this.mapper.properties.player.team[0].species.value == null) { return starter_type2 }
            if (this.g3stateVariable == `Overworld` && this.mapper.properties.player.team[0].species.value == 'Backport') { return starter_type2 }
            if (this.g3stateVariable == `Overworld`) { return this.dexData[this.mapper.properties.player.team[0].species.value]?.type_2 }
            if (this.g3stateVariable == `Base Stats`) { return starter_type2}
            else { return this.dexData[this.starterString].type_2}
        },
        //BATTLE FADE
        battle_fade() {
            if (
            (this.opponent == "ELITE_FOUR_SIDNEY" ||
            this.opponent == "ELITE_FOUR_PHOEBE" ||
            this.opponent == "ELITE_FOUR_GLACIA" ||
            this.opponent == "ELITE_FOUR_DRAKE" ||
            this.opponent == "CHAMPION_WALLACE") &&
            (this.g3stateVariable == "To Battle" ||
            this.g3stateVariable == "Battle" ||
            this.g3stateVariable == "From Battle")
            ) {
                return true
            }
            else if (
            this.g3stateVariable == "To Battle" ||
            this.g3stateVariable == "Battle") {
                return true
            }
            else {
                return false
            }
        },
        // SCREENS
        screen_weather() { // [statusReflect, reflectCount, statusLightScreen, LightScreenCount, weather, weatherCount, showPopUp]
            var fieldArray = [null, null, null, null, null, null, false]
            if (this.batt.field.weather.value != null) {
                fieldArray[4] = this.batt.field.weather.value
                fieldArray[5] = this.batt.field.weatherCount.value
                fieldArray[6] = true
            }
            if (this.batt.field.player.statusReflect.value == true) {
                fieldArray[2] = "Reflect"
                fieldArray[3] = this.batt.field.player.reflectCount.value
                fieldArray[6] = true
            }
            if (this.batt.field.player.statusLightScreen.value == true) {
                fieldArray[0] = "Light Screen"
                fieldArray[1] = this.batt.field.player.lightScreenCount.value
                fieldArray[6] = true
            }
            return fieldArray
        },
        //SELECT THE RELEVANT FIELD MOVE
        field_selector() {
            var reflect = [this.batt.field.player?.reflectCount?.value, this.batt.field?.player?.statusReflect?.value, "Reflect"]
            var lightscreen = [this.batt.field?.player?.lightScreenCount?.value, this.batt.field?.player?.statusLightScreen?.value, "Light Screen"]
            var safeguard = [this.batt.field?.player?.safeguardCount?.value, this.batt.field?.player?.statusSafeguard?.value, "Safeguard"]
            var weather = [this.batt.field?.weatherCount?.value, this.weather_boolean, this.pascalCaseSpace(this.camelCase(this.batt.field?.weather?.value?.toLowerCase()))]
            var comparison = [reflect, lightscreen, safeguard, weather]
            var maxArr = [0, false, ""]
            for(var i = 0; i < comparison.length; i++) {
                if ((comparison[i][0])) {
                    if(maxArr[0] < comparison[i][0]) {
                        maxArr = comparison[i];
                    }
                }
            }
            return maxArr
        },
        weather_boolean() {
            if (this.batt.field?.weather?.value == "Sun" || this.batt.field?.weather?.value == "Rain" || this.batt.field?.weather?.value == "Sandstorm") {
                return true
            }
            else {
                return false
            }
        },
        pkmnGrowthRate() {
            if (this.dexData[this.starterString].growth_rate == `GROWTH_MEDIUM_SLOW`) { return "Medium Slow" }
            if (this.dexData[this.starterString].growth_rate == `GROWTH_MEDIUM_FAST`) { return "Medium Fast" }
            if (this.dexData[this.starterString].growth_rate == `GROWTH_SLOW`) { return "Slow" }
            if (this.dexData[this.starterString].growth_rate == `GROWTH_FAST`) { return "Fast" }
            if (this.dexData[this.starterString].growth_rate == `GROWTH_FLUCTUATING`) { return "Fluctuating" }
            if (this.dexData[this.starterString].growth_rate == `GROWTH_ERRATIC`) { return "Erratic" }
        },
        field_effect_array() {
            var effect_array = [
                ["Reflect", false, 0,],
                ["Light Screen", false, 0,],
                ["Safeguard", false, 0,],
                [this.mapper.properties.battle.field.weather.value, false, 0,],
            ]
            if (this.g3stateVariable == `Battle`) {
                effect_array[0][1] = this.batt.field.player.statusReflect?.value
                effect_array[0][2] = this.batt.field.player.reflectCount?.value
                effect_array[1][1] = this.batt.field.player.statusLightScreen?.value
                effect_array[1][2] = this.batt.field.player.lightScreenCount?.value
                effect_array[2][1] = this.batt.field.player.statusSafeguard?.value
                effect_array[2][2] = this.batt.field.player.safeguardCount?.value
                effect_array[3][1] = this.batt.field.weather?.value
                effect_array[3][2] = this.batt.field.weatherCount?.value
            }
            return effect_array
        },
        field_effect_first_expiring() {
            var field_effect_most_recent_array = ["Reflect", false, 6,]
            for(var i = 0; i < this.field_effect_array.length; i++) {
                if (this.field_effect_array[i][2] < field_effect_most_recent_array[2] && this.field_effect_array[i][2] != 0) {
                    field_effect_most_recent_array = this.field_effect_array[i]
                }
            }
            if (this.field_effect_array[0][2] == 0 && this.field_effect_array[1][2] == 0 && this.field_effect_array[2][2] == 0 && this.field_effect_array[3][2] == 0) {
                field_effect_most_recent_array = [this.last_initiated_field_effect, false, 0]
            }
            return field_effect_most_recent_array
        },
        starter() {
            return this.dexData[this.starterString].dex_number
        },
        game() {
            if (this.ready == false) { return }
            if (this.mapper && this.mapper.properties.meta?.gameName) {
                if (this.gameVariables[this.mapper.properties.meta.gameName?.value] != null)
                    this.gameSelection = this.mapper.properties.meta.gameName.value;
            }
            return this.gameVariables[this.gameSelection];
        },
        gameName() {
            return this.mapper?.properties?.meta?.gameName;
        },
        enemyTrainerList() {
            return this.trainerLists[this.game?.trainerList]
        },
        dexData() {
            return this.game.dexData;
        },
        weatherDenial() {
            let output = false;
            if(this.pkmnAbility == "Air Lock" || this.pkmnAbility == "Cloud Nine") {
                output = true;
            }
            if(this.mapper.properties.battle.yourPokemon.ability?.value == "Air Lock" || this.mapper.properties.battle.yourPokemon.ability?.value == "Cloud Nine") {
                output = true;
            }
            if(this.mapper.properties.battle.enemyPokemon.ability?.value == "Air Lock" || this.mapper.properties.battle.enemyPokemon.ability?.value == "Cloud Nine") {
                output = true;
            }
            return output;
        },
        //TYPE ICONS FOR THE STARTER SELECTION
        starterTypeCheck() {
            if (this.pick == true)
                var starterType1 = this.gen3data.find(y => y.dexNumber === this.starterString)
                var starterType2 = this.gen3data.find(y => y.dexNumber === this.starterString)
                if (starterType2.type2 == null)
                    return true
                else   
                    return false
        },
        getStarterType1() {
            const species = (this.evolution && this.selected_evolution_species) ? this.selected_evolution_species : this.starterString;
            if (this.zigzagoon_check == true) {
                var type = this.dexData[species].type_1
            }
            if (this.pick == true)
                var type = this.dexData[species].type_1
                if(this.dynamicTypeAvailable) {
                    type = this.mapper.properties.battle.yourPokemon.type1;
                }
                return `images/elements/types/${this.ui_type_icons_modifier}${type}.png`.toLowerCase();
        },
        getStarterType2() {
            const species = (this.evolution && this.selected_evolution_species) ? this.selected_evolution_species : this.starterString;
            if (this.zigzagoon_check == true) {
                var type = this.dexData[species].type_2
            }
            if (this.pick == true)
                var type = this.dexData[species].type_2
                if(this.dynamicTypeAvailable) {
                    type = this.mapper.properties.battle.yourPokemon.type2;
                }
                return `images/elements/types/${this.ui_type_icons_modifier}${type}.png`.toLowerCase();
        },
        dynamicTypeAvailable() {
            if(this.g3stateVariable != "Battle")
                return false;
            /* this is all to check if you have abilities or moves that can change your type */
            /* after thinking about it, I don't think it's needed, unless bugs arise from */
            /* dynamic typing. It can stay here just in case. */
            // let dynamicTypeAbilities = ["COLOR CHANGE","FORECAST"];
            // let dynamicTypeMoves = ["CONVERSION","CONVERSION 2","TRANSFORM","CAMOUFLAGE","METRONOME"];
            // let yourPoke = this.mapper.properties.battle.yourPokemon;
            // let yourMoves = [yourPoke.move1.value,yourPoke.move2.value,yourPoke.move3.value,yourPoke.move4.value];
            // console.log(dynamicTypeAbilities.includes(this.mapper.properties.battle.yourPokemon.ability.value),this.mapper.properties.battle.yourPokemon.ability.value)
            // if (dynamicTypeAbilities.includes(this.mapper.properties.battle.yourPokemon.ability.value))
            //     return true;
            // let hasTypeChangeMove = yourMoves.some(move => dynamicTypeMoves.includes(move));
            // if (hasTypeChangeMove)
            //     return true;
            // return false;
            return true;
        },
        pokemonArtOpacity() {
            // Return opacity for Pokemon art during evolution transition
            if (this.evolution_transitioning) {
                // Fade out old, fade in new
                return 1 - this.evolution_transition_progress;
            }
            return 1;
        },
        pokemonArtTransition() {
            // Return transition style for Pokemon art
            if (this.evolution_transitioning) {
                return 'opacity 1s ease-in-out';
            }
            return '';
        },
        movepoolOpacity() {
            // Return opacity for movepool during evolution transition only
            // Battle transitions are handled by Vue's transition component
            if (this.evolution_transitioning) {
                return 1 - this.evolution_transition_progress;
            }
            
            // For non-evolution transitions, don't set opacity (let Vue transition handle it)
            // Return 1 so it's visible when rendered, Vue transition will handle fade in/out
            return 1;
        },
        movepoolTransition() {
            // Return transition style for movepool
            // During evolution transitions, use longer transition
            if (this.evolution_transitioning) {
                return 'opacity 1s ease-in-out';
            }
            
            // For battle state changes, return empty string to use default in template
            // The template will fall back to 'opacity 0.5s ease-in-out' if this is empty
            return '';
        },
        statsDisplaySpecies() {
            // Return the species to display stats for
            // If showing evolved base stats (temporary after evolution), use the evolved species
            if (this.show_evolved_base_stats && this.evolved_species_for_stats) {
                return this.evolved_species_for_stats;
            }
            // When evolution is enabled, use the selected evolution family species for base stats
            if (this.evolution && this.selected_evolution_species) {
                return this.selected_evolution_species;
            }
            return this.starterString;
        },
        displayedPokemonSpecies() {
            // Return the Pokemon species to display in the art
            // When evolution is enabled, use selected_evolution_species from dropdown
            // Otherwise, use starterString
            if (this.evolution && this.selected_evolution_species) {
                return this.selected_evolution_species;
            }
            return this.starterString;
        },
    },

    methods: {
        // ============ Style Settings Management Methods ============
        /**
         * Export current localStorage settings to the defaults file (dev mode only)
         * This migrates your existing style settings to become the new app defaults
         */
        exportStyleSettingsAsDefaults() {
            return StyleSettingsUtils.exportCurrentAsDefaults();
        },
        
        /**
         * Reset the current Pokemon's style settings to defaults
         */
        resetCurrentPokemonToDefaults() {
            const storageKey = this.getCurrentStorageKey();
            StyleSettingsUtils.resetToDefaults(storageKey);
            // Reload the styles
            if (this.evolution && this.selected_evolution_species) {
                this.loadEvolutionStyle(this.selected_evolution_species, true);
            } else {
                this.load_pokemon_sprite_settings(this.starterString);
            }
        },
        
        /**
         * Reset all style settings to defaults
         */
        resetAllStyleSettingsToDefaults() {
            if (confirm('This will reset ALL Pokemon style settings to defaults. Are you sure?')) {
                StyleSettingsUtils.resetAllToDefaults();
                // Reload current styles
                if (this.evolution && this.selected_evolution_species) {
                    this.loadEvolutionStyle(this.selected_evolution_species, true);
                } else {
                    this.load_pokemon_sprite_settings(this.starterString);
                }
            }
        },
        
        /**
         * Get the current storage key for the active Pokemon
         */
        getCurrentStorageKey() {
            const game_name = this.mapper?.properties?.meta?.game_name?.value || this.gameSelection;
            if (this.evolution && this.selected_evolution_species) {
                return this.getStorageKey(this.selected_evolution_species, true);
            } else {
                return `${game_name}_${this.starterString}`;
            }
        },
        
        // Add this method to your Vue app methods section (around line 4182)
        async fetchEmulatorStats() {
            try {
                const response = await fetch('http://127.0.0.1:30158/stats');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const stats = await response.json();
                
                // Store the stats object in Vue data
                this.emulatorStats = stats;
                
                // Update timer without pausing - sync the timer's startTime to match emulator
                if (stats.time) {
                    // Parse the time string from emulator (format: "hh:mm:ss.ms")
                    const timeRegex = /(\d+):(\d{2}):(\d{2})\.(\d{2})/;
                    const timeArray = stats.time.match(timeRegex)?.slice(1,5).map(x => parseInt(x)) ?? [0,0,0,0];
                    const timeOffsetMs = timeArray[0] * 3600000 + timeArray[1] * 60000 + timeArray[2] * 1000 + timeArray[3] * 10;
                    
                    // Sync timer without pausing - set the startTime so current time matches emulator time
                    const currentPauseState = this.timer.storage.timer_pause;
                    this.timer.storage.timer_startTime = Date.now() - timeOffsetMs;
                    
                    // If timer was paused, also update pause_time
                    if (currentPauseState) {
                        this.timer.storage.timer_pause_time = Date.now();
                    }
                }
                
                return stats;
            } catch (error) {
                console.error('Error fetching emulator stats:', error);
                return null;
            }
        },
        // Add these methods to your Vue app methods section
        async sendEmulatorStart() {
            try {
                const response = await fetch('http://127.0.0.1:30158/mark-start', {
                    method: 'POST'
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('Emulator start command sent successfully');
                return true;
            } catch (error) {
                console.error('Error sending start command:', error);
                return false;
            }
        },
        async sendEmulatorEnd() {
            try {
                const response = await fetch('http://127.0.0.1:30158/mark-end', {
                    method: 'POST'
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('Emulator end command sent successfully');
                return true;
            } catch (error) {
                console.error('Error sending end command:', error);
                return false;
            }
        },
        async incrementEmulatorCounter(counter_name) {
            try {
                const response = await fetch(`http://127.0.0.1:30158/increment-counter?name=${counter_name}`, {
                    method: 'POST'
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('Emulator start command sent successfully');
                return true;
            } catch (error) {
                console.error('Error sending start command:', error);
                return false;
            }
        },
        async incrementEmulatorCounterByAmount(counter_name, amount) {
            try {
                const response = await fetch(`http://127.0.0.1:30158/increment-counter?name=${counter_name}&by=${amount}`, {
                    method: 'POST'
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('Emulator start command sent successfully');
                return true;
            } catch (error) {
                console.error('Error sending start command:', error);
                return false;
            }
        },
        formatMilliseconds(ms) {
            // Truncate milliseconds to seconds
            const totalSeconds = Math.floor(ms / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            // Helper function to pad with leading zero
            const pad = (x) => x.toString().padStart(2, "0");
            
            // Progressive format: starts at "0" and grows as needed
            if (hours > 0) {
                return `${hours}:${pad(minutes)}:${pad(seconds)}`;
            } else if (minutes > 0) {
                return `${minutes}:${pad(seconds)}`;
            } else {
                return seconds.toString();
            }
        },
        getCentiseconds(ms) {
            // Convert milliseconds to centiseconds and extract only the centiseconds part
            const centiseconds = Math.floor(ms / 10) % 100;
            return centiseconds.toString().padStart(2, "0");
        },
        getUnobtainableMoveStyle(move_object, type_of_move) {
            const unobtainable_moves_toggle = this.unobtainable_moves_toggle
            // const state = this.mapper.properties.meta.state.value
            const state = this.g3stateVariable
            const move_name = this.move_name(move_object.Move)
            const unobtainable_moves = this.unobtainable_moves_object[type_of_move] || []
            const opacity = 0.4
            const animation_duration = 1.5 // seconds
            let unobtainable_moves_first_run = (this.finished_run_count > 0 || this.banned_hidden_power == false) ? [] : (this.unobtainable_moves_object['First Playthrough'] || [])

            if (unobtainable_moves_toggle == "Never Cross Out") {
                return `transition: opacity ${animation_duration}s;`
            }
            else if (state != "No Pokemon" && unobtainable_moves_toggle == "Cross Out When Starter is Obtained" && (unobtainable_moves.includes(move_name) || unobtainable_moves_first_run.includes(move_name))) {
                return `transition: opacity ${animation_duration}s; opacity: ${opacity}; text-decoration: line-through;`
            }
            else if (this.mapper.properties.player.badges.badge1.value == true && unobtainable_moves_toggle == "Cross Out After First Badge" && (unobtainable_moves.includes(move_name) || unobtainable_moves_first_run.includes(move_name))) {
                return `transition: opacity ${animation_duration}s; opacity: ${opacity}; text-decoration: line-through;`
            }
            else if (unobtainable_moves_toggle == "Always Cross Out" && (unobtainable_moves.includes(move_name) || unobtainable_moves_first_run.includes(move_name))) {
                return `transition: opacity ${animation_duration}s; opacity: ${opacity}; text-decoration: line-through;`
            }
            else {
                return `transition: opacity ${animation_duration}s;`
            }
        },
        // Evolution family helper functions
        getFullyEvolvedSpecies(species) {
            // Get the fully evolved species from the evolution family
            // This is the species with method == null and parameter == null (or the last one)
            if (!this.evolution_data_pokedex || !species) {
                return species;
            }
            const evolution_family = this.evolution_data_pokedex[species]?.evolution_family;
            if (!evolution_family || evolution_family.length === 0) {
                return species; // If no evolution family, return the species itself
            }
            
            // Find the fully evolved species (the one with no method/parameter, or the last one)
            let fullyEvolved = species;
            for (const member of evolution_family) {
                if (member.method == null && member.parameter == null) {
                    fullyEvolved = member.species;
                }
            }
            // If we didn't find one with null method, get the last one
            if (fullyEvolved === species && evolution_family.length > 0) {
                fullyEvolved = evolution_family[evolution_family.length - 1].species;
            }
            return fullyEvolved;
        },
        getEvolutionFamily(species) {
            // Get the list of species in the evolution family
            if (!this.evolution_data_pokedex || !species) {
                return [species];
            }
            const evolution_family = this.evolution_data_pokedex[species]?.evolution_family;
            if (!evolution_family || evolution_family.length === 0) {
                return [species]; // If no evolution family, return just the species
            }
            return evolution_family.map(member => member.species).filter(s => s != null);
        },
        getStorageKey(species, useEvolutionLine = false) {
            // Get the storage key for a species
            // If useEvolutionLine is true, use "FullyEvolved-line-Species" format
            // Otherwise, use just the species name
            if (!useEvolutionLine) {
                return `${this.mapper?.properties?.meta?.game_name?.value || this.gameSelection}_${species}`;
            }
            
            const fullyEvolved = this.getFullyEvolvedSpecies(species);
            return `${this.mapper?.properties?.meta?.game_name?.value || this.gameSelection}_${fullyEvolved}-line-${species}`;
        },
        getEvolutionFamilyStorageKey(species) {
            // Get the storage key for the entire evolution family (shared settings like ability, nature, gender)
            // Format: "Game_FullyEvolved-line" (e.g., "Black_Unfezant-line")
            const fullyEvolved = this.getFullyEvolvedSpecies(species);
            return `${this.mapper?.properties?.meta?.game_name?.value || this.gameSelection}_${fullyEvolved}-line`;
        },
        getSplitFileName() {
            // Get the filename for split files
            // If evolution is enabled, use "FullyEvolved-line" format
            // Otherwise, use the species name
            const starter = this.starterString || this.starter;
            if (!this.evolution) {
                return starter;
            }
            const fullyEvolved = this.getFullyEvolvedSpecies(starter);
            return `${fullyEvolved}-line`;
        },
        getCurrentStorageKey() {
            // Get the current storage key based on whether evolution is enabled and which species is selected
            if (this.evolution && this.selected_evolution_species) {
                return this.getStorageKey(this.selected_evolution_species, true);
            }
            const starter = this.starterString || this.starter;
            return this.getStorageKey(starter, false);
        },
        light_ball(stat) {
            if (this.mapper.properties.player.team[0].itemHeld.value == 'LIGHT BALL' && this.starterString == "Pikachu") {
                return Math.floor(stat * 2)
            }
            return stat
        },
        speed_comparison(enemy_slot, enemy_speed_incoming) {
            let object = {
                comparison: "Outspeeds",
                color: "background-color: rgba(255, 63, 63, 0.6)",
            }
            if (this.mapper.properties.battle.type.trainer.value == false) { return object }

            const state          = this.g3stateVariable
            let trainer_number = 0
            if (this.gameSelection == 'Emerald') {
                trainer_number = this.mapper.properties.battle.trainer.opponentAId.value
            }
            else if (this.gameSelection == 'FireRed and LeafGreen') {
                trainer_number = this.mapper.properties.battle.trainer.opponentId.value
            }
            else {
                trainer_number = this.mapper.properties.battle.trainer.opponentAId.value
            }
            let data = this.gameSelection == 'Emerald' ? this.emeraldTrainers : this.remakeTrainers
            let enemy_hp = this.mapper.properties.battle.trainer.team[enemy_slot]?.hp.value
            let player_speed   = this.get_stat('Speed')
            let enemy_speed = enemy_speed_incoming
            // console.log(player_speed, enemy_speed)
            if (state == 'To Battle') {
                enemy_speed = data[`${trainer_number}`].pokemon[enemy_slot]?.spe
            }
            if (player_speed > enemy_speed) {
                object.comparison = "Outsped"
                object.color      = "background-color: rgba(28, 255, 58, 0.4)"
            }
            else if (player_speed == enemy_speed) {
                object.comparison = "Speed-tie"
                object.color      = "background-color: rgba(255, 255, 0, 0.5)"
            }
            if (enemy_hp == 0) {
                object.color      = "background-color: rgba(28, 255, 58, 0.5); opacity: 0.0; filter: grayscale(100%)"
            }
            return object
        },
        svgColorClass(speed_comparison, enemy_data) {
            // console.log(enemy_data)
            const isFainted = enemy_data?.hp.value
            if (isFainted == 0) {
                return 'grey-svg';
            }
            if (speed_comparison === 'Outsped') {
                return 'blue-svg';
            } 
            else if (speed_comparison === 'Speed-tie') {
                return 'yellow-svg';
            }
            return 'red-svg';
        },
        battle_testing_ui_toggle() {
            switch (this.battle_testing_ui) {
                case false: this.battle_testing_ui = true; break;
                case true:  this.battle_testing_ui = false; break;
            }
        },
        async update_rom_starter_and_intro_mon() {
            let starter = this.starterString
            let game = this.gameSelection
            if (starter == 'Deoxys') {
                starter = 'Backport'
            }
            if (game == 'Emerald') {
                await Promise.all([
                    this.mapper.properties.patch.sStpIntroSpecies.set(starter, true), 
                    this.mapper.properties.patch.sStpStarterSpecies_0.set(starter, true), 
                    this.mapper.properties.patch.sStpStarterSpecies_1.set(starter, true), 
                    this.mapper.properties.patch.sStpStarterSpecies_2.set(starter, true), 
                ])
            }
            if (game == 'FireRed and LeafGreen') {
                await Promise.all([
                    this.mapper.properties.variables.VAR_CHOSEN_STARTER.set(starter, true), 
                    this.mapper.properties.patch.STP_CHOSEN_STARTER.set(starter, true), 
                ])
            }
            // else {
            //     // console.log("This game is not supported yet.")
            // }
        },
        async update_nature() {
            if (this.mapper.properties.player.teamCount.value == 0) { 
                console.log('Cannot update stats while the player has no Pokemon.')
                return 
            }
            const pkmnData = this.dexData[this.starterString]
            const level    = this.mapper.properties.player.team[0].level.value
            const natures  = this.natures[this.pkmnNature]

            var ivHp  = this.mapper.properties.player.team[0].ivHp.value
            var ivAtk = this.mapper.properties.player.team[0].ivAttack.value
            var ivDef = this.mapper.properties.player.team[0].ivDefense.value
            var ivSpA = this.mapper.properties.player.team[0].ivSpecialAttack.value
            var ivSpD = this.mapper.properties.player.team[0].ivSpecialDefense.value
            var ivSpe = this.mapper.properties.player.team[0].ivSpeed.value

            var evHp  = this.mapper.properties.player.team[0].evHp.value
            var evAtk = this.mapper.properties.player.team[0].evAttack.value
            var evDef = this.mapper.properties.player.team[0].evDefense.value
            var evSpA = this.mapper.properties.player.team[0].evSpecialAttack.value
            var evSpD = this.mapper.properties.player.team[0].evSpecialDefense.value
            var evSpe = this.mapper.properties.player.team[0].evSpeed.value

            //calculates the Pokemon's stats with the desired nature
            var hitpoints      = Math.floor((((2 * pkmnData.base_hp + ivHp + Math.floor(evHp/4)) * level)/100) + level + 10)
            var attack         = Math.floor(Math.floor(((((2 * pkmnData.base_atk + ivAtk + Math.floor(evAtk/4)) * level)/100) + 5)) * natures["nature_attack"])
            var defense        = Math.floor(Math.floor(((((2 * pkmnData.base_def + ivDef + Math.floor(evDef/4)) * level)/100) + 5)) * natures["nature_defense"])
            var specialAttack  = Math.floor(Math.floor(((((2 * pkmnData.base_spc_atk + ivSpA + Math.floor(evSpA/4)) * level)/100) + 5)) * natures["nature_specialAttack"])
            var specialDefense = Math.floor(Math.floor(((((2 * pkmnData.base_spc_def + ivSpD + Math.floor(evSpD/4)) * level)/100) + 5)) * natures["nature_specialDefense"])
            var speed          = Math.floor(Math.floor(((((2 * pkmnData.base_spd + ivSpe + Math.floor(evSpe/4)) * level)/100) + 5)) * natures["nature_speed"])

            const value_object = {
                species: pkmnData,
                level: level,
                natures: natures,
                ivs: {
                    hp:  ivHp,
                    atk: ivAtk,
                    def: ivDef,
                    spa: ivSpA,
                    spd: ivSpD,
                    spe: ivSpe,
                },
                evs: {
                    hp:  evHp,
                    atk: evAtk,
                    def: evDef,
                    spa: evSpA,
                    spd: evSpD,
                    spe: evSpe,
                },
                stats: {
                    hp:  hitpoints,
                    atk: attack,
                    def: defense,
                    spa: specialAttack,
                    spd: specialDefense,
                    spe: speed,
                },
            }

            console.log(value_object)

            // only recalculate stats when IVs when your starter is received
            await Promise.all([
                this.mapper.properties.player.team[0].hp.set(hitpoints, false), 
                this.mapper.properties.player.team[0].maxHp.set(hitpoints, false), 
                this.mapper.properties.player.team[0].attack.set(attack, false), 
                this.mapper.properties.player.team[0].defense.set(defense, false), 
                this.mapper.properties.player.team[0].specialAttack.set(specialAttack, false), 
                this.mapper.properties.player.team[0].specialDefense.set(specialDefense, false), 
                this.mapper.properties.player.team[0].speed.set(speed, false), 
            ])
        },
        openFolder(folderName, game_name, path = "", path2) {
            const fs = require('fs');
            const fullPath = `.\\${folderName}\\${game_name}\\${path}\\${path2}`;
            console.log(fullPath);

            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }

            // Correctly handle spaces in folder names
            require('child_process').exec(`start "" "${fullPath}"`);
        }, 
        async update_items() {
            var item1 = this.item1_replacement.toUpperCase()
            var item2 = this.item2_replacement.toUpperCase()
            var item3 = this.item3_replacement.toUpperCase()
            var item4 = this.item4_replacement.toUpperCase()
            await this.mapper.properties.player.bag.items[0].item.set(item1, false)
            await this.mapper.properties.player.bag.items[0].quantity.set(99, false)
            await this.mapper.properties.player.bag.items[1].item.set(item2, false)
            await this.mapper.properties.player.bag.items[1].quantity.set(99, false)
            await this.mapper.properties.player.bag.items[2].item.set(item3, false)
            await this.mapper.properties.player.bag.items[2].quantity.set(99, false)
            await this.mapper.properties.player.bag.items[3].item.set(item4, false)
            await this.mapper.properties.player.bag.items[3].quantity.set(99, false)
        },
        async update_moveset() {
            const move_data = this.cross_generation_moves.g3
            var move1 = this.move1_replacement.toUpperCase()
            var move2 = this.move2_replacement.toUpperCase()
            var move3 = this.move3_replacement.toUpperCase()
            var move4 = this.move4_replacement.toUpperCase()
            var pp1   = move_data[this.move_name(move1)]
            var pp2   = move_data[this.move_name(move2)]
            var pp3   = move_data[this.move_name(move3)]
            var pp4   = move_data[this.move_name(move4)]
            if (move1 != "") {
                await this.mapper.properties.player.team[0].move1.set(move1, false)
                await this.mapper.properties.player.team[0].move1pp.set(pp1.PP, false)
            }
            if (move2 != "") {
                await this.mapper.properties.player.team[0].move2.set(move2, false)
                await this.mapper.properties.player.team[0].move2pp.set(pp2.PP, false)
            }
            if (move3 != "") {
                await this.mapper.properties.player.team[0].move3.set(move3, false)
                await this.mapper.properties.player.team[0].move3pp.set(pp3.PP, false)
            }
            if (move4 != "") {
                await this.mapper.properties.player.team[0].move4.set(move4, false)
                await this.mapper.properties.player.team[0].move4pp.set(pp4.PP, false)
            }
        },
        async update_battle_moveset() {
            if (this.g3stateVariable == "Battle") {
                const move_data = this.cross_generation_moves.g3
                var move1 = this.move1_replacement.toUpperCase()
                var move2 = this.move2_replacement.toUpperCase()
                var move3 = this.move3_replacement.toUpperCase()
                var move4 = this.move4_replacement.toUpperCase()
                var pp1   = move_data[this.move_name(move1)]
                var pp2   = move_data[this.move_name(move2)]
                var pp3   = move_data[this.move_name(move3)]
                var pp4   = move_data[this.move_name(move4)]
                if (move1 != "") {
                    await this.mapper.properties.battle.yourPokemon.move1.set(move1, false)
                    await this.mapper.properties.battle.yourPokemon.move1pp.set(pp1.PP, false)
                }
                if (move2 != "") {
                    await this.mapper.properties.battle.yourPokemon.move2.set(move2, false)
                    await this.mapper.properties.battle.yourPokemon.move2pp.set(pp2.PP, false)
                }
                if (move3 != "") {
                    await this.mapper.properties.battle.yourPokemon.move3.set(move3, false)
                    await this.mapper.properties.battle.yourPokemon.move3pp.set(pp3.PP, false)
                }
                if (move4 != "") {
                    await this.mapper.properties.battle.yourPokemon.move4.set(move4, false)
                    await this.mapper.properties.battle.yourPokemon.move4pp.set(pp4.PP, false)
                }
            }
            else { return }
        },
        macho_brace(stat) { 
            if (this.mapper.properties.player.team[0].itemHeld.value == 'MACHO BRACE') {
                return Math.floor(stat * 0.5)
            }
            else {
                return stat
            }
        },
        autosplitter_trainer(opponent) {
            switch (opponent) {
                case "RIVAL_BRENDAN_ROUTE_103_TORCHIC" : return "Rival 1"
                case "RIVAL_BRENDAN_ROUTE_103_MUDKIP"  : return "Rival 1"
                case "RIVAL_BRENDAN_ROUTE_103_TREECKO" : return "Rival 1"
                case "RIVAL_MAY_ROUTE_103_TORCHIC"     : return "Rival 1"
                case "RIVAL_MAY_ROUTE_103_MUDKIP"      : return "Rival 1"
                case "RIVAL_MAY_ROUTE_103_TREECKO"     : return "Rival 1"
                case "LEADER_ROXANNE_1"                : return "Roxanne"
                case "LEADER_BRAWLY_1"                 : return "Brawly"
                case "RIVAL_BRENDAN_ROUTE_110_TORCHIC" : return "Rival 2"
                case "RIVAL_BRENDAN_ROUTE_110_MUDKIP"  : return "Rival 2"
                case "RIVAL_BRENDAN_ROUTE_110_TREECKO" : return "Rival 2"
                case "RIVAL_MAY_ROUTE_110_TORCHIC"     : return "Rival 2"
                case "RIVAL_MAY_ROUTE_110_MUDKIP"      : return "Rival 2"
                case "RIVAL_MAY_ROUTE_110_TREECKO"     : return "Rival 2"
                case "LEADER_WATTSON_1"                : return "Wattson"
                case "MAGMA_LEADER_MAXIE_MT_CHIMNEY"   : return "Maxie (Mt. Chimney)"
                case "LEADER_FLANNERY_1"               : return "Flannery"
                case "LEADER_NORMAN_1"                 : return "Norman"
                case "RIVAL_BRENDAN_ROUTE_119_TORCHIC" : return "Rival 3"
                case "RIVAL_BRENDAN_ROUTE_119_MUDKIP"  : return "Rival 3"
                case "RIVAL_BRENDAN_ROUTE_119_TREECKO" : return "Rival 3"
                case "RIVAL_MAY_ROUTE_119_TORCHIC"     : return "Rival 3"
                case "RIVAL_MAY_ROUTE_119_MUDKIP"      : return "Rival 3"
                case "RIVAL_MAY_ROUTE_119_TREECKO"     : return "Rival 3"
                case "LEADER_WINONA_1"                 : return "Winona"
                case "MAGMA_LEADER_MAXIE_MAGMA_HIDEOUT": return "Maxie (Magma Hideout)"
                case "LEADER_TATE_AND_LIZA_1"          : return "Tate and Liza"
                case "AQUA_LEADER_ARCHIE"              : return "Archie"
                case "LEADER_JUAN_1"                   : return "Juan"
                case "RIVAL_WALLY_VR_1"                : return "Wally"
                case "ELITE_FOUR_SIDNEY"               : return "Sidney"
                case "ELITE_FOUR_PHOEBE"               : return "Phoebe"
                case "ELITE_FOUR_GLACIA"               : return "Glacia"
                case "ELITE_FOUR_DRAKE"                : return "Drake"
                case "CHAMPION_WALLACE"                : return "Wallace"
                case "RIVAL_STEVEN"                    : return "Steven"
                default                                : return opponent
            }
        },
        average_median_stats(stat_label) {
            let sum = 0;
            let count = 0;
            let values = [];
            
            for (let pokemon of Object.values(this.dexDataFireRedLeafGreen)) {
                let stat = pokemon[`base_${stat_label}`];
                sum += stat;
                count++;
                values.push(stat);
            }
            
            let average = sum / count;
            
            values.sort((a, b) => a - b);
            let median;
            let midIndex = Math.floor(values.length / 2);
            
            if (values.length % 2 === 0) {
                median = (values[midIndex - 1] + values[midIndex]) / 2;
            } else {
                median = values[midIndex];
            }
            return {
                average: Math.round(average),
                median : Math.round(median),
            };
        },
        async toggle_pokedex() {
            const bit_array_bytes_151 = [   0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                                            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                                            0xFF, 0xFF, 0x7F]
            const bit_array_bytes_386 = [   0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 
                                            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                                            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                                            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                                            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                                            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                                            0x03]
            var write_value = bit_array_bytes_386
            await Promise.all([
                this.mapper.properties.pokedex.owned_start_of_bit_array.setBytes(write_value, false),
                this.mapper.properties.pokedex.seen_start_of_bit_array.setBytes(write_value, false),
                this.mapper.properties.pokedex.seen1_start_of_bit_array.setBytes(write_value, false),
                this.mapper.properties.pokedex.seen2_start_of_bit_array.setBytes(write_value, false),
            ])
        },
        async toggle_national_dex() {
            const magic    = this.mapper.properties.pokedex.magic.value
            const dex_var  = this.mapper.properties.variables.pokedex.value
            const dex_flag = this.mapper.properties.events.nationalDex.value
            if (magic == 185 && dex_var == 25176 && dex_flag == true) {
                await Promise.all([
                    this.mapper.properties.pokedex.magic.set(0, false), // 0xB9
                    this.mapper.properties.variables.pokedex.set(0, false), // 0x6258 (Bytes: 0x58 0x62)
                    this.mapper.properties.events.nationalDex.set(false, false), 
                ])
            }
            else {
                await Promise.all([
                    this.mapper.properties.pokedex.magic.set(185, false), // 0xB9
                    this.mapper.properties.variables.pokedex.set(25176, false), // 0x6258 (Bytes: 0x58 0x62)
                    this.mapper.properties.events.nationalDex.set(true, false), 
                ])
            }
        },
        get_nested_property(obj, path) {
            return path.split('.').reduce((o, p) => (o || {})[p], obj);
        },
        split_diff_color(difference_string) {
            if (difference_string === "-")          { return "color: black" }
            if (difference_string === "+0:00")      { return "color: black" }
            if (difference_string.charAt(0) == "+") { return "color: red" }
            if (difference_string.charAt(0) == "-") { return "color: green" }
        },
        convertDurationToSeconds(duration) {
            const parts = duration.split(':').map(part => parseInt(part, 10));
            if (parts.length === 1) {
                return parts[0];
            } else if (parts.length === 2) {
                return parts[0] * 60 + parts[1];
            } else if (parts.length === 3) {
                return parts[0] * 3600 + parts[1] * 60 + parts[2];
            }
        },
        convertSecondsToDuration(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
        
            if (hours > 0) {
                return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
            } else if (minutes > 0) {
                return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
            } else {
                var seconds = remainingSeconds
                if (remainingSeconds < 10) { seconds = "0" + remainingSeconds.toString() }
                return `0:${String(seconds)}`
            }
        },
        async load_temp_splits() {
            const text = await loadCsvFile();
            const rows = text.split("\n").slice(1).filter(x => x !== '');
            const results = []
            for (const row of rows) {
                const columns = row.split(",");
                results.push({trainer: columns[2], time: columns[3]})
            }
            return results
        },
        async load_splits() {
            const text = await loadCsvFile();
            const rows = text.split("\n").slice(1).filter(x => x !== '');
            const results = []
            for (const row of rows) {
                const columns = row.split(",");
                results.push({trainer: columns[2], time: columns[3]})
            }
            this.previous_splits = results;
        },
        stat_label_opacity() {
            const state = this.g3stateVariable
            if (state != `Battle`) { return }
            let default_opacity = .63
            let faded_opacity = .1
            let mod_atk = this.mapper.properties.battle.yourPokemon.modStageAttack.value != '0'         ? faded_opacity : default_opacity
            let mod_def = this.mapper.properties.battle.yourPokemon.modStageDefense.value != '0'        ? faded_opacity : default_opacity
            let mod_spa = this.mapper.properties.battle.yourPokemon.modStageSpecialAttack.value != '0'  ? faded_opacity : default_opacity
            let mod_spd = this.mapper.properties.battle.yourPokemon.modStageSpecialDefense.value != '0' ? faded_opacity : default_opacity
            let mod_spe = this.mapper.properties.battle.yourPokemon.modStageSpeed.value != '0'          ? faded_opacity : default_opacity
            let object = {
                "Hp":              default_opacity,
                "Attack":          mod_atk,
                "Defense":         mod_def,
                "Speed":           mod_spe,
                "Special Attack":  mod_spa,
                "Special Defense": mod_spd,
            }
            return object
        },
        get_stat(stat_name) {
            const state = this.g3stateVariable
            const level5_exp_points = [
                237, 100, 125, 135, 156, 65
            ]

            // Use statsDisplaySpecies to get the correct species for base stats
            var starter = this.statsDisplaySpecies || this.starterString

            if (state == `To Battle` && this.mapper.properties.battle.type.first_battle.value == true) {
                if (starter == "Deoxys") {
                    return this.deoxys_form_base_stats[stat_name]
                }
                switch (stat_name) {
                    case "Hp":              return this.game.dexData[starter].base_hp
                    case "Attack":          return this.game.dexData[starter].base_atk
                    case "Defense":         return this.game.dexData[starter].base_def
                    case "Special Attack":  return this.game.dexData[starter].base_spc_atk
                    case "Special Defense": return this.game.dexData[starter].base_spc_def
                    case "Speed":           return this.game.dexData[starter].base_spd
                }
            }
            else if (state == `Overworld` && this.mapper.properties.player.team[0].level.value == 5 && level5_exp_points.includes(this.mapper.properties.player.team[0].expPoints.value)) {
                if (starter == "Deoxys") {
                    return this.deoxys_form_base_stats[stat_name]
                }
                switch (stat_name) {
                    case "Hp":              return this.game.dexData[starter].base_hp
                    case "Attack":          return this.game.dexData[starter].base_atk
                    case "Defense":         return this.game.dexData[starter].base_def
                    case "Special Attack":  return this.game.dexData[starter].base_spc_atk
                    case "Special Defense": return this.game.dexData[starter].base_spc_def
                    case "Speed":           return this.game.dexData[starter].base_spd
                }
            }
            else if ((state == `Overworld` || state == `To Battle`) && this.mapper.properties.player.team[0].species.value != null) {
                switch (stat_name) {
                    case "Hp":              return this.mapper.properties.player.team[0].maxHp.value
                    case "Attack":          return this.ability(this.pkmn_ability, "attack",  this.badge_boost(this.mapper.properties.player.badges.badge1.value, this.mapper.properties.player.team[0].attack.value))
                    case "Defense":         return this.metal_powder("defense", this.badge_boost(this.mapper.properties.player.badges.badge5.value, this.mapper.properties.player.team[0].defense.value))
                    case "Special Attack":  return this.light_ball(this.badge_boost(this.mapper.properties.player.badges.badge7.value, this.mapper.properties.player.team[0].specialAttack.value))
                    case "Special Defense": return this.metal_powder("special_defense", this.badge_boost(this.mapper.properties.player.badges.badge7.value, this.mapper.properties.player.team[0].specialDefense.value))
                    case "Speed":           return this.status_stat_change(this.mapper.properties.player.team[0].statusCondition.value, this.badge_boost(this.mapper.properties.player.badges.badge3.value, this.mapper.properties.player.team[0].speed.value))
                }
            }
            else if (state == `Battle` || state == `From Battle`) {
                switch (stat_name) {
                    case "Hp":              return this.mapper.properties.battle.yourPokemon.maxHp.value
                    case "Attack":          return this.ability(this.pkmn_ability, "attack",  this.badge_boost(this.mapper.properties.player.badges.badge1.value, this.stageMultiplier(this.mapper.properties.battle.yourPokemon.modStageAttack.value,  this.mapper.properties.battle.yourPokemon.attack.value)))
                    case "Defense":         return this.metal_powder("defense", this.ability(this.pkmn_ability, "defense", this.badge_boost(this.mapper.properties.player.badges.badge5.value, this.stageMultiplier(this.mapper.properties.battle.yourPokemon.modStageDefense.value, this.mapper.properties.battle.yourPokemon.defense.value))))
                    case "Speed":           return this.status_stat_change(this.mapper.properties.battle.yourPokemon.status1.value, this.macho_brace(this.ability(this.pkmn_ability, "speed",   this.badge_boost(this.mapper.properties.player.badges.badge3.value, this.stageMultiplier(this.mapper.properties.battle.yourPokemon.modStageSpeed.value,   this.mapper.properties.battle.yourPokemon.speed.value)))))
                    case "Special Attack":  return this.light_ball(this.badge_boost(this.mapper.properties.player.badges.badge7.value, this.stageMultiplier(this.mapper.properties.battle.yourPokemon.modStageSpecialAttack.value,  this.mapper.properties.battle.yourPokemon.specialAttack.value)))
                    case "Special Defense": return this.metal_powder("special_defense", this.badge_boost(this.mapper.properties.player.badges.badge7.value, this.stageMultiplier(this.mapper.properties.battle.yourPokemon.modStageSpecialDefense.value, this.mapper.properties.battle.yourPokemon.specialDefense.value)))
                }
            }
            else if (state == `Base Stats` || this.mapper.properties.player.team[0].species.value == null) {
                if (starter == "Deoxys") {
                    return this.deoxys_form_base_stats[stat_name]
                }
                switch (stat_name) {
                    case "Hp":              return this.game.dexData[starter].base_hp
                    case "Attack":          return this.game.dexData[starter].base_atk
                    case "Defense":         return this.game.dexData[starter].base_def
                    case "Special Attack":  return this.game.dexData[starter].base_spc_atk
                    case "Special Defense": return this.game.dexData[starter].base_spc_def
                    case "Speed":           return this.game.dexData[starter].base_spd
                }
            }
        },
        togglePopup() {
            this.showPopup = !this.showPopup;
        },
        closePopup() {
            this.showPopup = false;
        },
        calculate_ev_benefit(stat_name) {
            // const state = this.mapper.properties.meta.state.value
            const state = this.g3stateVariable
            if (state == 'No Pokemon') {
                return
            }

            let level = this.mapper.properties.player.team[0].level.value
            let species = this.starter
            let nature = this.mapper.properties.player.team[0].nature.value
            let nature_modifiers = this.natures[nature]

            let iv_hp = this.mapper.properties.player.team[0].ivs.hp.value
            let iv_atk = this.mapper.properties.player.team[0].ivs.attack.value
            let iv_def = this.mapper.properties.player.team[0].ivs.defense.value
            let iv_spa = this.mapper.properties.player.team[0].ivs.special_attack.value
            let iv_spd = this.mapper.properties.player.team[0].ivs.special_defense.value
            let iv_spe = this.mapper.properties.player.team[0].ivs.speed.value
            
            function calculate_hp(iv, effort_value, level, base_stat) {
                return Math.floor((2 * base_stat + iv + Math.floor(effort_value / 4)) * level / 100) + level + 10
            }
            function calculate_other_stat(iv, effort_value, level, base_stat, nature_modifier) {
                return Math.floor((Math.floor((2 * base_stat + iv + Math.floor(effort_value / 4)) * level / 100) + 5) * nature_modifier)
            }

            switch (stat_name) {
                case 'hp': {
                    let current_stat = this.get_stat().Hp
                    let no_ev_stat   = calculate_hp(iv_hp, 0, level, this.game.dexData[species].base_stats?.hp ?? 1)
                    let difference   = current_stat - no_ev_stat
                    return difference
                }
                case 'attack': {
                    let current_stat = this.get_stat().Atk
                    let no_ev_stat   = calculate_other_stat(iv_atk, 0, level, this.game.dexData[species].base_stats.attack, nature_modifiers?.nature_attack ?? 1)
                    let difference   = current_stat - no_ev_stat
                    return difference
                }
                case 'defense': {
                    let current_stat = this.get_stat().Def
                    let no_ev_stat   = calculate_other_stat(iv_def, 0, level, this.game.dexData[species].base_stats.defense, nature_modifiers?.nature_defense ?? 1)
                    let difference   = current_stat - no_ev_stat
                    return difference
                }
                case 'special_attack': {
                    let current_stat = this.get_stat().SpA
                    let no_ev_stat   = calculate_other_stat(iv_spa, 0, level, this.game.dexData[species].base_stats.special_attack, nature_modifiers?.nature_specialAttack ?? 1)
                    let difference   = current_stat - no_ev_stat
                    return difference
                }
                case 'special_defense': {
                    let current_stat = this.get_stat().SpD
                    let no_ev_stat   = calculate_other_stat(iv_spd, 0, level, this.game.dexData[species].base_stats.special_defense, nature_modifiers?.nature_specialDefense ?? 1)
                    let difference   = current_stat - no_ev_stat
                    return difference
                }
                case 'speed': {
                    let current_stat = this.get_stat().Spe
                    let no_ev_stat   = calculate_other_stat(iv_spe, 0, level, this.game.dexData[species].base_stats.speed, nature_modifiers?.nature_speed ?? 1)
                    let difference   = current_stat - no_ev_stat
                    return difference
                }
                default: {
                    return
                }
            }
        },
        get_base_stat_total() {
            //! EVOLUTION_FIX needed here, recall base stats from the selected evolution species when evolution mode is enabled
            var starter = this.evolution ? this.selected_evolution_species : this.starterString
            const data    = this.game.dexData[starter]
            const hp      = data.base_stats.hp
            const atk     = data.base_stats.attack
            const def     = data.base_stats.defense
            const spa     = data.base_stats.speed
            const spd     = data.base_stats.special_attack
            const spe     = data.base_stats.special_defense
            const total   = hp + atk + def + spa + spd + spe
            return total
        },
        get_base_stat(stat_path) {
            //! EVOLUTION_FIX needed here, recall base stats from the selected evolution species when evolution mode is enabled
            var starter = this.evolution ? this.selected_evolution_species : this.starter
            return this.game.dexData[starter]?.base_stats[stat_path]
        },
        status_stat_change(status_condition, stat_value) {
            // console.log(status_condition, stat_value)
            if (status_condition == "Paralyzed") { 
                return Math.floor(stat_value * 0.25)
            }
            else {
                return stat_value
            }
        },
        metal_powder(stat_name, stat) {
            if (this.mapper.properties.player.team[0].itemHeld.value == 'METAL POWDER') {
                if (stat_name === 'defense' && (this.starterString === "Ditto" && this.s1dynamicReset.species.value === "Ditto")) {
                    return Math.floor(stat * 2)
                }
                else {
                    return stat
                }
            }
            else {
                return stat
            }
        },
        get_bb_stat(stat_name) {
            const state = this.g3stateVariable
            let boosting_badge = false
            let badge_boost_modifier = 0.1
            //assign stats and badges
            if (state != `Base Stats`) {
                switch (stat_name) {
                    case "Hp":              return 'N/A';
                    case "Attack":          { 
                        boosting_badge = this.mapper.properties.player.badges.badge1.value
                        switch (boosting_badge) {
                            case true: return Math.floor(this.mapper.properties.player.team[0].attack.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                    case "Defense":         { 
                        boosting_badge = this.mapper.properties.player.badges.badge5.value
                        switch (boosting_badge) {
                            case true: return Math.floor(this.mapper.properties.player.team[0].defense.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                    case "Speed":           { 
                        boosting_badge = this.mapper.properties.player.badges.badge3.value
                        switch (boosting_badge) {
                            case true: return Math.floor(this.mapper.properties.player.team[0].speed.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                    case "Special Attack":  { 
                        boosting_badge = this.mapper.properties.player.badges.badge7.value
                        switch (boosting_badge) {
                            case true: return Math.floor(this.mapper.properties.player.team[0].specialAttack.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                    case "Special Defense": { 
                        boosting_badge = this.mapper.properties.player.badges.badge7.value
                        switch (boosting_badge) {
                            case true: return Math.floor(this.mapper.properties.player.team[0].specialDefense.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                }
            }
            if (state == `Base Stats`) {
                switch (stat_name) {
                    case "Hp":              return 0
                    case "Attack":          return 0
                    case "Defense":         return 0
                    case "Special Attack":  return 0
                    case "Special Defense": return 0
                    case "Speed":           return 0
                }
            }
        },
        get_iv(stat_name) {
            const state = this.g3stateVariable
            let iv_hp  = this.mapper.properties.player.team[0].ivHp.value
            let iv_atk = this.mapper.properties.player.team[0].ivAttack.value
            let iv_def = this.mapper.properties.player.team[0].ivDefense.value
            let iv_spa = this.mapper.properties.player.team[0].ivSpecialAttack.value
            let iv_spd = this.mapper.properties.player.team[0].ivSpecialDefense.value
            let iv_spe = this.mapper.properties.player.team[0].ivSpeed.value
            switch (stat_name) {
                case "Hp":
                    return iv_hp
                case "Attack":
                    return iv_atk
                case "Defense":
                    return iv_def
                case "Special Attack":
                    return iv_spa
                case "Special Defense":
                    return iv_spd
                case "Speed":
                    return iv_spe
            }
        },
        //methods
        special_trainer_names(trainer_name) {
            switch (trainer_name) {
                case "Rival Brendan 1":  return "Rival 1";
                case "Rival Brendan 2":  return "Rival 2";
                case "Rival Brendan 3":  return "Rival 3";
                case "Rival Brendan 4":  return "Rival 1";
                case "Rival Brendan 5":  return "Rival 2";
                case "Rival Brendan 6":  return "Rival 3";
                case "Rival Brendan 7":  return "Rival 1";
                case "Rival Brendan 8":  return "Rival 2";
                case "Rival Brendan 9":  return "Rival 3";
                case "Rival Brendan 10": return "Optional Rival";
                case "Rival Brendan 11": return "Optional Rival";
                case "Rival Brendan 12": return "Optional Rival";
                case "Rival Brendan 13": return "Rival 4";
                case "Rival Brendan 14": return "Rival 4";
                case "Rival Brendan 15": return "Rival 4";
                case "Rival May":        return "May";
                case "Rival May 1":      return "Rival 1";
                case "Rival May 2":      return "Rival 2";
                case "Rival May 3":      return "Rival 3";
                case "Rival May 4":      return "Rival 1";
                case "Rival May 5":      return "Rival 2";
                case "Rival May 6":      return "Rival 3";
                case "Rival May 7":      return "Rival 1";
                case "Rival May 8":      return "Rival 2";
                case "Rival May 9":      return "Rival 3";
                case "Rival May 10":     return "Optional Rival";
                case "Rival May 11":     return "Optional Rival";
                case "Rival May 12":     return "Optional Rival";
                case "Rival May 13":     return "Rival 4";
                case "Rival May 14":     return "Rival 4";
                case "Rival May 15":     return "Rival 4";
                case "Rival Wally":           return "Rival Wally";
                case "Rival Wally Rematch 1": return "Rival Wally";
                case "Rival Wally Rematch 2": return "Rival Wally";
                case "Rival Wally Rematch 3": return "Rival Wally";
                case "Magma Leader Maxie":   return "Magma Leader Maxie";
                case "Magma Leader Maxie 2": return "Magma Leader Maxie";
                case "Magma Leader Maxie 3": return "Magma Leader Maxie";
                case "Rival Early Terry":   return "Rival 1";
                case "Rival Early Terry 2": return "Rival 1";
                case "Rival Early Terry 3": return "Rival 1";
                case "Rival Early Terry 4": return "Rival 1A";
                case "Rival Early Terry 5": return "Rival 1A";
                case "Rival Early Terry 6": return "Rival 1A";
                case "Rival Early Terry 7": return "Rival 2";
                case "Rival Early Terry 8": return "Rival 2";
                case "Rival Early Terry 9": return "Rival 2";
                case "Rival Late Terry":    return "Rival 3";
                case "Rival Late Terry 2":  return "Rival 3";
                case "Rival Late Terry 3":  return "Rival 3";
                case "Rival Late Terry 4":  return "Rival 4";
                case "Rival Late Terry 5":  return "Rival 4";
                case "Rival Late Terry 6":  return "Rival 4";
                case "Rival Late Terry 7":  return "Rival 5";
                case "Rival Late Terry 8":  return "Rival 5";
                case "Rival Late Terry 9":  return "Rival 5";
                case "Rival Late Terry 10": return "Rival 6";
                case "Rival Late Terry 11": return "Rival 6";
                case "Rival Late Terry 12": return "Rival 6";
                case "Champion Terry":      return "Champion";
                case "Champion Terry 2":    return "Champion";
                case "Champion Terry 3":    return "Champion";
                default: return this.capitalization_format(trainer_name);
            }
        },
        stat_mod(modifer) {
            mod = parseInt(modifer)
            if (mod > 0) {
                return `+${mod}`
            }
            else return mod
        },
        enemyFaint(slotIndex) {
            let fainted = false
            if (this.mapper.properties.battle.trainer.team[slotIndex].hp.value == 0) {
                fainted = true
            }
            if (fainted == true) {
                return "opacity: .35; filter: grayscale(100%);"
            }
            else {
                return
            }
        },
        enemyStatLabelOpacity(modifier, slot) {
            // console.log(modifier, slot)
            if (this.g3stateVariable == "To Battle") {
                return
            }
            if (this.mapper.properties.battle.trainer.team[slot].hp.value == 0) {
                return `opacity: .3;`
            }
            if (this.mapper.properties.battle.enemyPokemon.partyPos.value == slot) {
                if (this.mapper.properties.battle.trainer.team[0].personalityValue == null)
                    return
                else if (this.g3stateVariable == "Battle") {
                    if (modifier != 0)
                        return `opacity: ${this.statLabelOpacityValue};`
                }
            }
            else
                return
        },
        enemyHpOpacity(modifier, slot) {
            // console.log(modifier, slot)
            if (this.g3stateVariable == "To Battle") {
                return
            }
            if (this.mapper.properties.battle.trainer.team[slot].hp.value == 0) {
                return `opacity: .3;`
            }
            else
                return
        },
        enemyMove(slot, moveNumber) {
            if (this.g3stateVariable == `Battle`) {
                return this.mapper.properties.battle.trainer.team[slot][`move${moveNumber}`]?.value?.toLowerCase()
            }
            else {
                return
            }
        },
        eHPType(valueToReturn, moveValue, slotIndex) {
            if (moveValue == "Hidden Power") {
                return this.hiddenPowerTypeCalc(this.mapper.properties.battle.trainer.team[slotIndex])
            }
            else {
                return valueToReturn
            }
        },
        enemyType1(slotNumber) {
            if (this.g3stateVariable == "Overworld" || this.g3stateVariable == "From Battle" || this.g3stateVariable == "No Pokemon") { return }
            const opponent_id = this.mapper.properties.battle.trainer.opponentAId?.value ?? this.mapper.properties.battle.trainer.opponentId?.value
            const species = this.gameSelection == 'Emerald' ? this.emeraldTrainers[opponent_id].pokemon[slotNumber].species : this.remakeTrainers[opponent_id].pokemon[slotNumber].species
            const type1 = this.gameSelection == 'Emerald' ? this.dexDataRubySapphireEmerald[species].type_1 : this.dexDataFireRedLeafGreen[species].type_1
            // console.log(opponent_id)
            // console.log(species)
            // console.log(type1)
            return type1
        },
        enemyType2(slotNumber) {
            if (this.g3stateVariable == "Overworld" || this.g3stateVariable == "From Battle" || this.g3stateVariable == "No Pokemon") { return }
            const opponent_id = this.mapper.properties.battle.trainer.opponentAId?.value ?? this.mapper.properties.battle.trainer.opponentId?.value
            const species = this.gameSelection == 'Emerald' ? this.emeraldTrainers[opponent_id].pokemon[slotNumber].species : this.remakeTrainers[opponent_id].pokemon[slotNumber].species
            const type2 = this.gameSelection == 'Emerald' ? this.dexDataRubySapphireEmerald[species].type_2 : this.dexDataFireRedLeafGreen[species].type_2
            // console.log(opponent_id)
            // console.log(species)
            // console.log(type2)
            return type2
        },
        enemyType(slotNumber) {
            return this.dexData[this.enemyTeam[slotNumber].species.value].type_1
        },
        clear_overlay_color() {
            starterType = this.dexData[this.starterString].type_1;
            newColor = getComputedStyle(document.documentElement).getPropertyValue("--"+starterType.toLowerCase());
            this.set_pokemon_prop("overlay_color", newColor)
            this.overlay_color = newColor;
            // this.load_pokemon_sprite_settings()
        },
        load_pokemon_sprite_settings(pokemon_species) {
            // If evolution is enabled, use loadEvolutionStyle to load from evolution line storage
            // Otherwise, load from individual species storage
            if (this.evolution && this.evolution_family_list.length > 0) {
                // When evolution is enabled, we need to determine which species to load
                // If selected_evolution_species is set and valid, use it; otherwise use the pokemon_species
                const speciesToLoad = (this.selected_evolution_species && this.evolution_family_list.includes(this.selected_evolution_species)) 
                    ? this.selected_evolution_species 
                    : pokemon_species;
                this.loadEvolutionStyle(speciesToLoad, true);
            } else {
                // Evolution is disabled, load from individual species storage
                this.loadEvolutionStyle(pokemon_species, false);
            }
        },
        load_deoxys_sprite_settings(form) {            
            switch (form) {
                case "Speed"  : {
                    this.overlay_color   = "#bc6f42"
                    this.imageXOffset    = 27
                    this.imageYOffset    = 41
                    this.imageScale      = 0.86
                    this.imageFlip       = true
                    this.imageSat        = 100
                    this.backgroundBlur  = 0
                    this.backgroundHue   = 271
                    this.backgroundScale = 120
                    this.backgroundUrl   = false
                    this.backgroundFlip  = false
                    this.backgroundXFlip = false
                    break;
                }
                case "Normal" : {
                    this.overlay_color   = "#79becb"
                    this.imageXOffset    = 55
                    this.imageYOffset    = 41
                    this.imageScale      = 1
                    this.imageFlip       = true
                    this.imageSat        = 100
                    this.backgroundBlur  = 0
                    this.backgroundHue   = 183
                    this.backgroundScale = 100
                    this.backgroundUrl   = false
                    this.backgroundFlip  = false
                    this.backgroundXFlip = false
                    break;
                }
                case "Attack" : {
                    this.overlay_color   = "#7c5181"
                    this.imageXOffset    = 20
                    this.imageYOffset    = 62
                    this.imageScale      = 1
                    this.imageFlip       = true
                    this.imageSat        = 100
                    this.backgroundBlur  = 0
                    this.backgroundHue   = 0
                    this.backgroundScale = 100
                    this.backgroundUrl   = false
                    this.backgroundFlip  = true
                    this.backgroundXFlip = true
                    break;
                }
                case "Defense": {
                    this.overlay_color   = "#819ff5"
                    this.imageXOffset    = -16
                    this.imageYOffset    = 48
                    this.imageScale      = 1
                    this.imageFlip       = false
                    this.imageSat        = 100
                    this.backgroundBlur  = 0
                    this.backgroundHue   = 319
                    this.backgroundScale = 100
                    this.backgroundUrl   = false
                    this.backgroundFlip  = true
                    this.backgroundXFlip = false
                    break;
                }
            }
        },
        keys_function(object) {
            return Object.keys(object)
        },
        values_function(object) {
            return Object.values(object)
        },

        async newRun() {         
            // this.current_splits = await this.load_temp_splits()
            this.compared_splits = []
            this.current_splits  = []

            if (this.shuckie_timer == false) {
                this.timer.setTimer(this.timer_startTimeOffset);
            }

            this.playerResets = 0
            this.finished_logs = false
            this.blackout_counter = 0
            this.playerId = 0

            this.update_rom_starter_and_intro_mon()

            if (this.set_rom_starter_automatically && this.timer.formatted_time[0] == "0" && this.timer.formatted_time[1] == ".00") {
                console.log('Setting ROM starter automatically')
                this.update_rom_starter_and_intro_mon()
            }
            // this.playerName = "NINTEN"
            // start timer
            if (this.shuckie_timer == true) {
                this.sendEmulatorStart();
            }   
            else {
                this.timer.startTime(this.timer_startTimeOffset);
            }
        },
        copy_overlay_properties() {
            const copy_from = this.copy_overlay_pokemon_from
            const copy_to   = this.copy_overlay_pokemon_to
            const from      = `${copy_from}`
            const to        = `${copy_to}`
        
            if (!MyStorage[from]) {
                console.log("The Pokemon you are trying to copy from does not have overlay data stored for it.")
                return
            }
        
            console.log(MyStorage[from])
            if (MyStorage[from]) {
                const properties = [
                    'overlay_color', 'backgroundBlur', 'backgroundHue', 'backgroundScale', 'backgroundUrl', 
                    'backgroundFlip', 'backgroundXFlip', 'use_custom_background', 'backgroundXOffset', 'backgroundYOffset', 
                    'backgroundTexture', 'backgroundBrightness', 'backgroundContrast', 'backgroundSaturation'
                ];
        
                // Create a new object and copy the properties
                const newObject = {};
                properties.forEach(property => {
                    if (property in MyStorage[from]) {
                        newObject[property] = MyStorage[from][property];
                    }
                });
        
                // Assign the new object to MyStorage[to]
                MyStorage[to] = newObject;
            }
            console.log(MyStorage[to])
        },
        copyCurrentStylesToAllFamilyMembers() {
            // Copy all style settings from the currently selected evolution family member
            // to all other members of the evolution family
            if (!this.evolution || !this.selected_evolution_species || this.evolution_family_list.length <= 1) {
                console.log("Evolution mode must be enabled and you must have multiple species in the evolution family.")
                return
            }
            
            const game_name = this.mapper?.properties?.meta?.game_name?.value || this.gameSelection;
            const sourceSpecies = this.selected_evolution_species;
            const sourceStorageKey = this.getStorageKey(sourceSpecies, true); // Evolution line storage
            
            // Initialize source storage if it doesn't exist
            if (!MyStorage[sourceStorageKey]) {
                MyStorage[sourceStorageKey] = {};
            }
            
            // List of all styling properties to copy
            // This includes all properties from pokemon_settings that affect visual styling
            const stylingProperties = [
                // Overlay color and UI settings
                'overlay_color',
                'ui_saturation',
                
                // Pokemon image settings
                'imageXOffset',
                'imageYOffset',
                'imageScale',
                'imageFlip',
                'imageSat',
                'imageRotation',
                
                // Background texture settings
                'backgroundTexture',
                'backgroundBlur',
                'backgroundHue',
                'backgroundScale',
                'backgroundUrl',
                'backgroundFlip',
                'use_custom_background',
                'backgroundXOffset',
                'backgroundYOffset',
                'backgroundBrightness',
                'backgroundContrast',
                'backgroundSaturation'
            ]
            
            // Build the source data object with all current values
            const sourceData = {};
            stylingProperties.forEach(prop => {
                if (this[prop] !== undefined) {
                    sourceData[prop] = this[prop];
                }
            });
            
            // First, save current values to source storage key to ensure consistency
            // Get existing data (handles null case when key doesn't exist)
            const sourceExistingData = MyStorage[sourceStorageKey];
            MyStorage[sourceStorageKey] = {
                ...(sourceExistingData || {}),
                ...sourceData
            };
            
            // Copy to all other members of the evolution family
            let copiedCount = 0;
            const copiedValues = {}; // Store what we're copying for debugging
            this.evolution_family_list.forEach(targetSpecies => {
                if (targetSpecies !== sourceSpecies) {
                    const targetStorageKey = this.getStorageKey(targetSpecies, true); // Evolution line storage
                    
                    // Get existing data (might be null if key doesn't exist)
                    const existingData = MyStorage[targetStorageKey] || {};
                    
                    // Copy all properties at once - merge existing with new source data
                    const mergedData = {
                        ...existingData,
                        ...sourceData
                    };
                    
                    // Save to storage - this will trigger the Proxy's set trap
                    MyStorage[targetStorageKey] = mergedData;
                    
                    // Store for debugging
                    copiedValues[targetSpecies] = { ...sourceData };
                    
                    // Verify what was actually saved (re-read from storage to confirm)
                    const verifiedData = MyStorage[targetStorageKey];
                    
                    copiedCount++;
                    // Debug: Log what was copied for this species
                    console.log(`Copied to ${targetSpecies} (key: ${targetStorageKey}):`, copiedValues[targetSpecies]);
                    // Verify what was actually saved
                    console.log(`Verified storage for ${targetSpecies}:`, verifiedData);
                }
            });
            
            console.log(`Successfully copied style settings from "${sourceSpecies}" (key: ${sourceStorageKey}) to ${copiedCount} other family member(s).`);
        },
        load_all_settings() {
            const game_name             = this.gameSelection
            this.starterString          = MyStorage["starterString"] ?? "Rayquaza"
            this.show_advanced_settings = MyStorage['show_advanced_settings'] ?? false,
            this.set_rom_starter_automatically = MyStorage['set_rom_starter_automatically'] ?? true,
            this.catch_rate             = MyStorage['catch_rate'] ?? false,
            this.post_kanto_evolutions  = MyStorage['post_kanto_evolutions'] ?? false,
            this.show_post_battle_splits = MyStorage['show_post_battle_splits'] ?? false,

            this.stat_exp_display =   MyStorage['stat_exp_display']   ?? true,
            this.dv_display =         MyStorage['dv_display']         ?? true,
            this.inventory_display =  MyStorage['inventory_display']  ?? true,
            this.battleGraphic =      MyStorage['battleGraphic']      ?? true,
            this.base_stats_display = MyStorage['base_stats_display'] ?? true,
            this.stats_display =      MyStorage['stats_display']      ?? true,
            this.legacy_state =       MyStorage['legacy_state']       ?? false,

            this.graphicOverlay =             MyStorage['graphicOverlay']             ?? true
            this.gameArea =                   MyStorage['gameArea']                   ?? false
            this.pokeballFloor =              MyStorage['pokeballFloor']              ?? false
            this.dynamicOverlay =             MyStorage['dynamicOverlay']             ?? false
            this.gametime =                   MyStorage['gametime']                   ?? false
            this.pick =                       MyStorage['pick']                       ?? true
            this.typeCalcs =                  MyStorage['typeCalcs']                  ?? true
            this.moveset =                    MyStorage['moveset']                    ?? true
            this.dynamicPower =               MyStorage['dynamicPower']               ?? false
            this.resets =                     MyStorage['resets']                     ?? false
            this.stats_display  =             MyStorage['stats_display']              ?? true
            this.movepool =                   MyStorage['movepool']                   ?? false
            this.inventory =                  MyStorage['inventory']                  ?? false
            this.battleStats =                MyStorage['battleStats']                ?? false
            this.battleInfo =                 MyStorage['battleInfo']                 ?? false
            this.conditions =                 MyStorage['conditions']                 ?? false
            this.expBar =                     MyStorage['expBar']                     ?? false
            this.splits =                     MyStorage['splits']                     ?? false
            this.tooltips =                   MyStorage['tooltips']                   ?? false
            this.btcInfo =                    MyStorage['btcInfo']                    ?? false
            this.returnPower =                MyStorage['returnPower']                ?? true
            this.gamestate =                  MyStorage['gamestate']                  ?? true
            this.labels =                     MyStorage['labels']                     ?? true
            this.tutor_moves =                MyStorage['tutor_moves']                ?? false
            this.showSpecialTrainerGraphics = MyStorage['showSpecialTrainerGraphics'] ?? true
            this.route_101 =                  MyStorage['route_101']                  ?? true
            this.route_102 =                  MyStorage['route_102']                  ?? true
            this.route_103 =                  MyStorage['route_103']                  ?? true
            this.hm_102_zigzagoon =           MyStorage['hm_102_zigzagoon']           ?? true
            this.hm_104_marill =              MyStorage['hm_104_marill']              ?? true
            this.hm_104_taillow =             MyStorage['hm_104_taillow']             ?? true
            this.hm_116_abra =                MyStorage['hm_116_abra']                ?? false,
            this.hm_woods_shroomish =         MyStorage['hm_woods_shroomish']         ?? false,
            this.hm_cave_abra =               MyStorage['hm_cave_abra']               ?? false,
            this.hm_119_tropius =             MyStorage['hm_119_tropius']             ?? false,
            this.hm_1_pidgey =                MyStorage['hm_1_pidgey']                ?? true,
            this.hm_1_rattata =               MyStorage['hm_1_rattata']               ?? true,
            this.testRun =                    MyStorage['testRun']                    ?? false
            this.simple_data_str =            MyStorage['simple_data_str']            ?? ""
            this.full_data_str =              MyStorage['full_data_str']              ?? ""
            this.deprecated_data_str =        MyStorage['deprecated_data_str']        ?? ""
            this.simple_data =                MyStorage['simple_data']                ?? ""
            this.time_split_start =           MyStorage['time_split_start']           ?? "00:00:00:00"
            this.battle_start =               MyStorage['battle_start']               ?? 0
            
            let starter = this.starterString
            const evolution_family = (this.evolution_data_pokedex && this.starterString) ? (this.evolution_data_pokedex[this.starterString]?.evolution_family ?? [ {species: null, method: null,}, {species: null, method: null,}, {species: null, method: null,}, ]) : [ {species: null, method: null,}, {species: null, method: null,}, {species: null, method: null,}, ]
            // Check evolution from the correct storage key (with game name prefix)
            this.evolution = MyStorage[`${game_name}_${starter}`]?.evolution ?? MyStorage[starter]?.evolution ?? false
            this.evolution_splits_label =  MyStorage[`${game_name}_${this.starterString}`]?.evolution_splits_label ?? ""
            
            // Note: Style settings (overlay_color, image settings, background settings) are loaded later
            // based on whether evolution is enabled, to ensure we use the correct storage keys
            
            if (starter && this.evolution_splits_label) { starter = this.evolution_splits_label }
            // console.log("Starter", starter)
            
            // Load attempt number and finished run count from the correct storage key
            const attemptStorageKey = this.evolution && this.evolution_splits_label ? this.evolution_splits_label : `${game_name}_${this.starterString}`;
            this.attempt_number        = MyStorage[attemptStorageKey]?.attempt_number        ?? MyStorage[starter]?.attempt_number        ?? 0
            this.finished_run_count    = MyStorage[attemptStorageKey]?.finished_run_count    ?? MyStorage[starter]?.finished_run_count    ?? 0

            // const evolution_family = this.game.evolutions[starter]?.evolution_family  ?? [ {species: null, method: null,}, {species: null, method: null,}, {species: null, method: null,}, ]
            // console.log(this.evolution)
            this.copy_overlay_pokemon_from = MyStorage['copy_overlay_pokemon_from'] ?? ""
            this.copy_overlay_pokemon_to   = MyStorage['copy_overlay_pokemon_to']   ?? ""

            this.current_splits  = MyStorage["current_splits"]  ?? []
            this.previous_splits = MyStorage["previous_splits"] ?? []

            // Update evolution family list
            this.updateEvolutionFamilyList();
            
            // Load styles based on whether evolution is enabled
            if (this.evolution && this.evolution_family_list.length > 0) {
                // Load shared evolution family settings (ability, nature, gender, hidden power)
                // These are stored in the evolution family storage key (e.g., "Black_Unfezant-line")
                const evolutionFamilyStorageKey = this.getEvolutionFamilyStorageKey(this.starter);
                const familyStored = MyStorage[evolutionFamilyStorageKey] || {};
                
                // Load shared family settings
                this.pkmnNature = familyStored.pkmnNature ?? MyStorage[`${game_name}_${this.starter}`]?.pkmnNature ?? "Hardy";
                this.pkmn_ability = familyStored.pkmn_ability ?? MyStorage[`${game_name}_${this.starter}`]?.pkmn_ability ?? (this.game.dexData?.[this.starter]?.abilities?.[0]) ?? null;
                this.pkmn_gender = familyStored.pkmn_gender ?? MyStorage[`${game_name}_${this.starter}`]?.pkmn_gender ?? "Female";
                this.hidden_power_type = familyStored.hidden_power_type ?? MyStorage[`${game_name}_${this.starter}`]?.hidden_power_type ?? "Dark";
                this.hidden_power_index = familyStored.hidden_power_index ?? MyStorage[`${game_name}_${this.starter}`]?.hidden_power_index ?? 0;
                
                // Load selected evolution species from storage
                const stored_evolution_species = MyStorage[`${game_name}_${this.starter}`]?.selected_evolution_species;
                if (stored_evolution_species && this.evolution_family_list.includes(stored_evolution_species)) {
                    this.selected_evolution_species = stored_evolution_species;
                } else {
                    // Default to starter if not set or invalid
                    this.selected_evolution_species = this.starter;
                    // Save it
                    if (!MyStorage[`${game_name}_${this.starter}`]) {
                        MyStorage[`${game_name}_${this.starter}`] = {};
                    }
                    MyStorage[`${game_name}_${this.starter}`] = {
                        ...MyStorage[`${game_name}_${this.starter}`],
                        selected_evolution_species: this.starter
                    };
                }
                
                // Load evolution line styles for the selected species (this will also load the shared settings if they're in the individual storage)
                this.loadEvolutionStyle(this.selected_evolution_species, true);
            } else {
                // Evolution is disabled, load individual species styles
                // Use starterString instead of starter to ensure we have the correct value
                const speciesToLoad = this.starterString || this.starter;
                const storageKey = this.getStorageKey(speciesToLoad, false);
                
                //Pokemon settings for local storage
                this.overlay_color = MyStorage[storageKey]?.overlay_color ?? this.default_colors[`${this.game.dexData?.[speciesToLoad]?.type_1}`] ?? this.default_colors.Normal
                this.imageXOffset =  MyStorage[storageKey]?.imageXOffset ?? 0
                this.imageYOffset =  MyStorage[storageKey]?.imageYOffset ?? 0
                this.imageScale =    MyStorage[storageKey]?.imageScale ?? 1
                this.imageFlip =     MyStorage[storageKey]?.imageFlip ?? false
                this.imageSat =      MyStorage[storageKey]?.imageSat ?? 100
                this.imageRotation = MyStorage[storageKey]?.imageRotation ?? 0

                //background texture settings
                // Use 'in' operator to check if property exists in storage, to handle 0 and false values correctly
                const stored = MyStorage[storageKey] || {};
                this.frame = 'frame' in stored ? stored.frame : true;
                this.backgroundBlur =        'backgroundBlur' in stored ? stored.backgroundBlur : 0
                this.backgroundHue =         'backgroundHue' in stored ? stored.backgroundHue : 0
                this.backgroundScale =       'backgroundScale' in stored ? stored.backgroundScale : 100
                this.backgroundUrl =         'backgroundUrl' in stored ? stored.backgroundUrl : ""
                this.backgroundFlip =        'backgroundFlip' in stored ? stored.backgroundFlip : false
                this.backgroundXFlip =       'backgroundXFlip' in stored ? stored.backgroundXFlip : false
                this.use_custom_background = 'use_custom_background' in stored ? stored.use_custom_background : false
                this.backgroundXOffset =     'backgroundXOffset' in stored ? stored.backgroundXOffset : 0
                this.backgroundYOffset =     'backgroundYOffset' in stored ? stored.backgroundYOffset : 0
                this.backgroundTexture =     'backgroundTexture' in stored ? stored.backgroundTexture : `${this.game.dexData?.[speciesToLoad]?.type_1 ?? 'Normal'}`
                this.backgroundBrightness =  'backgroundBrightness' in stored ? stored.backgroundBrightness : 100
                this.backgroundContrast =    'backgroundContrast' in stored ? stored.backgroundContrast : 100
                this.backgroundSaturation =  'backgroundSaturation' in stored ? stored.backgroundSaturation : 100
                
                //UI styling - load from per-species storage, fall back to global storage, then default to 0.6
                this.ui_saturation =  'ui_saturation' in stored ? stored.ui_saturation : (MyStorage['ui_saturation'] ?? 0.6)
            }

            //main pokemon settings
            // Use starterString instead of starter to ensure we have the correct value
            const speciesForSettings = this.starterString || this.starter;
            const settingsStorageKey = this.evolution && this.selected_evolution_species 
                ? this.getStorageKey(this.selected_evolution_species, true)
                : this.getStorageKey(speciesForSettings, false);
            
            // For shared evolution family properties, use evolution family storage key
            let sharedStorageKey = settingsStorageKey;
            if (this.evolution && this.selected_evolution_species) {
                sharedStorageKey = this.getEvolutionFamilyStorageKey(speciesForSettings);
            }
            
            this.pkmnNature   = MyStorage[sharedStorageKey]?.pkmnNature ?? MyStorage[settingsStorageKey]?.pkmnNature ?? "Hardy"

            if (this.game.dexData?.[speciesForSettings]?.abilities && this.game.dexData[speciesForSettings].abilities.indexOf(this.pkmn_ability) == -1 && !MyStorage[sharedStorageKey]?.pkmn_ability && !MyStorage[settingsStorageKey]?.pkmn_ability) {
                this.pkmn_ability = this.game.dexData[speciesForSettings].abilities[0]
            }
            else {
                this.pkmn_ability = MyStorage[sharedStorageKey]?.pkmn_ability ?? MyStorage[settingsStorageKey]?.pkmn_ability ?? this.game.dexData?.[speciesForSettings]?.abilities?.[0] ?? null
            }
            if (this.set_starter_stats_object) {
                this.set_starter_stats_object.gender = this.pkmn_gender;
                this.set_starter_stats_object.nature = this.pkmnNature;
                this.set_starter_stats_object.ability = this.pkmn_ability;
            }
        },
        reset() {
            this.backgroundBlur        = 0,
            this.backgroundHue         = 0,
            this.backgroundScale       = 100,
            this.backgroundUrl         = "",
            this.use_custom_background = false,
            this.backgroundXOffset     = 0,
            this.backgroundYOffset     = 0,
            this.backgroundTexture     = this.dexData[this.starterString]?.type_1?.toLowerCase(),
            this.backgroundBrightness  = 100,
            this.backgroundContrast    = 100,
            this.backgroundSaturation  = 100
        },
        resetPokemon() {
            this.imageXOffset  = 0
            this.imageYOffset  = 0
            this.imageScale    = 1
            this.imageFlip     = false
            this.imageSat      = 100
            this.imageRotation = 0
        },
        increment(property) {
            this[property]++;
            if (this.shuckie_counters == true) { 
                this.incrementEmulatorCounter(property) 
            }
        },
        decrement(property) {
            if (this[property] == 0) {
                return 0
            }
            this[property]--;

            if (this.shuckie_counters == true) { 
                if (this.emulatorStats?.counters?.[property] == undefined || this.emulatorStats?.counters?.[property] <= 0) {
                    return
                }
                this.incrementEmulatorCounterByAmount(property, -1) 
            }
        },
        async colorPick() {
            return new EyeDropper().open().then(res => res.sRGBHex)
        },
        async color_picker() {
            var color = await this.colorPick()
            this.set_pokemon_prop("overlay_color", color)
            this.overlay_color = color
            // console.log(MyStorage.entries())
        },
        set_pokemon_prop(property_name, value) {
            // Use the appropriate storage key based on evolution mode
            const storageKey = this.getCurrentStorageKey();
            MyStorage[storageKey] = {
                ...MyStorage[storageKey],
                [property_name]: value,
            }
        },
        saveCurrentStyles(oldEvolutionValue = null) {
            // Save all current style properties to the storage key
            // oldEvolutionValue: the previous evolution state value (for saving before toggle)
            // If null, use current evolution state
            const wasEvolution = oldEvolutionValue !== null ? oldEvolutionValue : this.evolution;
            const species = this.starterString || this.starter;
            
            // Determine which species to use for storage
            // If saving old state when evolution was enabled, use selected_evolution_species
            // Otherwise, use the current starter species
            let speciesForStorage = species;
            if (wasEvolution && this.selected_evolution_species) {
                speciesForStorage = this.selected_evolution_species;
            }
            
            // Determine storage key based on evolution state
            let storageKey;
            if (wasEvolution) {
                storageKey = this.getStorageKey(speciesForStorage, true);
            } else {
                storageKey = this.getStorageKey(species, false);
            }
            
            if (!MyStorage[storageKey]) {
                MyStorage[storageKey] = {};
            }
            
            // Save all pokemon_settings properties (excluding shared family properties)
            const sharedProperties = ['pkmnNature', 'pkmn_ability', 'pkmn_gender', 'hidden_power_type', 'hidden_power_index'];
            for (let propName of this.pokemon_settings) {
                // Skip shared properties - they're saved separately
                if (sharedProperties.includes(propName)) {
                    continue;
                }
                if (this[propName] !== undefined && this[propName] !== null) {
                    MyStorage[storageKey] = {
                        ...MyStorage[storageKey],
                        [propName]: this[propName]
                    };
                }
            }
            
            // Save ui_saturation (not in pokemon_settings but is a style property)
            if (this.ui_saturation !== undefined && this.ui_saturation !== null) {
                MyStorage[storageKey] = {
                    ...MyStorage[storageKey],
                    ui_saturation: this.ui_saturation
                };
            }
            
            // Save shared evolution family properties if evolution was enabled
            if (wasEvolution && this.selected_evolution_species) {
                const familyStorageKey = this.getEvolutionFamilyStorageKey(species);
                if (!MyStorage[familyStorageKey]) {
                    MyStorage[familyStorageKey] = {};
                }
                for (let propName of sharedProperties) {
                    if (this[propName] !== undefined && this[propName] !== null) {
                        MyStorage[familyStorageKey] = {
                            ...MyStorage[familyStorageKey],
                            [propName]: this[propName]
                        };
                    }
                }
            }
        },
        updateEvolutionFamilyList() {
            // Update the evolution family list when starter changes
            const starter = this.starterString || this.starter;
            // console.log('updateEvolutionFamilyList called for:', starter);
            // console.log('evolution_data_pokedex available:', !!this.evolution_data_pokedex);
            
            if (!starter) {
                console.log('No starter, clearing list');
                this.evolution_family_list = [];
                return;
            }
            
            // Always try to get the evolution family, even if evolution_data_pokedex is not available yet
            if (!this.evolution_data_pokedex) {
                // If no evolution data yet, just use the starter as the only option
                console.log('No evolution_data_pokedex, using starter only');
                this.evolution_family_list = [starter];
                return;
            }
            
            const family = this.getEvolutionFamily(starter);
            // console.log('getEvolutionFamily returned:', family);
            this.evolution_family_list = family;
            
            // Ensure list is never empty - always include at least the starter
            if (this.evolution_family_list.length === 0) {
                // console.log('List was empty, adding starter');
                this.evolution_family_list = [starter];
            }
            
            // If the evolution family has only one member (e.g., Registeel), disable evolution
            if (this.evolution_family_list.length <= 1 && this.evolution) {
                console.log(`[Evolution] Disabling evolution for single-species family: ${starter}`);
                this.evolution = false;
            }
            
            // Set default selected evolution species to the starter if not set
            if (this.evolution && this.evolution_family_list.length > 1) {
                if (!this.selected_evolution_species || !this.evolution_family_list.includes(this.selected_evolution_species)) {
                    this.selected_evolution_species = starter;
                }
            }
            
            // console.log('Final evolution_family_list:', this.evolution_family_list);
        },
        loadEvolutionStyle(species, useEvolutionLine = false) {
            // Set flag to prevent watchers from saving during loading
            this.is_loading_evolution_style = true;
            
            // Load styles for a species, either from evolution line storage or individual storage
            const game_name = this.mapper?.properties?.meta?.game_name?.value || this.gameSelection;
            const storageKey = useEvolutionLine ? this.getStorageKey(species, true) : this.getStorageKey(species, false);
            
            // Debug: Log what we're trying to load
            // console.log(`Loading styles for ${species} (useEvolutionLine: ${useEvolutionLine}, key: ${storageKey})`);
            // console.log(`Storage data for ${species}:`, MyStorage[storageKey]);
            
            // Load overlay and image settings
            // Get type_1 from evolution_data_pokedex or fallback to appropriate dex data based on game selection
            const type_1 = this.evolution_data_pokedex?.[species]?.type_1 
                ?? (this.gameSelection == 'Emerald' ? dexDataRubySapphireEmerald?.[species]?.type_1 : dexDataFireRedLeafGreen?.[species]?.type_1)
                ?? this.game?.dexData?.[species]?.type_1 
                ?? 'Normal';
            this.overlay_color = MyStorage[storageKey]?.overlay_color ?? this.default_colors[type_1] ?? this.default_colors.Normal;
            // Load ui_saturation from per-species storage, fall back to global storage, then default to 0.6
            this.ui_saturation = MyStorage[storageKey]?.ui_saturation ?? MyStorage['ui_saturation'] ?? 0.6;
            this.imageXOffset = MyStorage[storageKey]?.imageXOffset ?? 0;
            this.imageYOffset = MyStorage[storageKey]?.imageYOffset ?? 0;
            this.imageScale = MyStorage[storageKey]?.imageScale ?? 1;
            this.imageFlip = MyStorage[storageKey]?.imageFlip ?? false;
            this.imageSat = MyStorage[storageKey]?.imageSat ?? 100;
            this.imageRotation = MyStorage[storageKey]?.imageRotation ?? 0;
            
            // Load background texture settings
            // Use 'in' operator to check if property exists in storage, to handle 0 and false values correctly
            const stored = MyStorage[storageKey] || {};
            
            this.frame = 'frame' in stored ? stored.frame : false;
            this.backgroundTexture = 'backgroundTexture' in stored ? stored.backgroundTexture : `${type_1}`;
            this.backgroundBlur = 'backgroundBlur' in stored ? stored.backgroundBlur : 0;
            this.backgroundHue = 'backgroundHue' in stored ? stored.backgroundHue : 0;
            this.backgroundScale = 'backgroundScale' in stored ? stored.backgroundScale : 100;
            this.backgroundUrl = 'backgroundUrl' in stored ? stored.backgroundUrl : "";
            this.backgroundFlip = 'backgroundFlip' in stored ? stored.backgroundFlip : false;
            this.backgroundXFlip = 'backgroundXFlip' in stored ? stored.backgroundXFlip : false;
            this.use_custom_background = 'use_custom_background' in stored ? stored.use_custom_background : false;
            this.backgroundXOffset = 'backgroundXOffset' in stored ? stored.backgroundXOffset : 0;
            this.backgroundYOffset = 'backgroundYOffset' in stored ? stored.backgroundYOffset : 0;
            this.backgroundBrightness = 'backgroundBrightness' in stored ? stored.backgroundBrightness : 100;
            this.backgroundContrast = 'backgroundContrast' in stored ? stored.backgroundContrast : 100;
            this.backgroundSaturation = 'backgroundSaturation' in stored ? stored.backgroundSaturation : 100;
            
            // Load shared evolution family settings (ability, nature, gender, hidden power) if using evolution line
            if (useEvolutionLine) {
                const familyStorageKey = this.getEvolutionFamilyStorageKey(species);
                const familyStored = MyStorage[familyStorageKey] || {};
                
                // Load ability, nature, gender, and hidden power from family storage
                // Use 'in' operator to check if property exists, handling null/undefined correctly
                if ('pkmnNature' in familyStored) {
                    this.pkmnNature = familyStored.pkmnNature;
                }
                if ('pkmn_ability' in familyStored) {
                    this.pkmn_ability = familyStored.pkmn_ability;
                } else if (this.pkmn_ability === null || this.pkmn_ability === undefined) {
                    // Only default to first ability if not set at all
                    this.pkmn_ability = this.game?.dexData?.[species]?.abilities?.[0] ?? null;
                }
                if ('pkmn_gender' in familyStored) {
                    this.pkmn_gender = familyStored.pkmn_gender;
                }
                if ('hidden_power_type' in familyStored) {
                    this.hidden_power_type = familyStored.hidden_power_type;
                }
                if ('hidden_power_index' in familyStored) {
                    this.hidden_power_index = familyStored.hidden_power_index;
                }
            }
            
            // Debug: Log what was actually loaded
            // console.log(`Loaded background settings for ${species}:`, {
            //     backgroundTexture: this.backgroundTexture,
            //     backgroundXOffset: this.backgroundXOffset,
            //     backgroundYOffset: this.backgroundYOffset,
            //     backgroundScale: this.backgroundScale,
            //     backgroundBrightness: this.backgroundBrightness,
            //     backgroundContrast: this.backgroundContrast,
            //     backgroundSaturation: this.backgroundSaturation,
            //     backgroundBlur: this.backgroundBlur,
            //     backgroundHue: this.backgroundHue,
            //     backgroundFlip: this.backgroundFlip
            // });
            
            // Clear flag after loading is complete, use $nextTick to ensure all watchers have fired
            this.$nextTick(() => {
                this.is_loading_evolution_style = false;
            });
        },
        async performEvolutionTransition(oldSpecies, newSpecies) {
            // Perform smooth fade transition between old and new overlays
            this.evolution_transitioning = true;
            this.evolution_old_species = oldSpecies;
            this.evolution_new_species = newSpecies;
            
            // Get old and new styles
            const oldStorageKey = this.getStorageKey(oldSpecies, true);
            const newStorageKey = this.getStorageKey(newSpecies, true);
            const game_name = this.mapper?.properties?.meta?.game_name?.value || this.gameSelection;
            
            const oldType1 = this.game?.dexData?.[oldSpecies]?.type_1 ?? 'Normal';
            const newType1 = this.game?.dexData?.[newSpecies]?.type_1 ?? 'Normal';
            const oldOverlayColor = MyStorage[oldStorageKey]?.overlay_color ?? this.default_colors[oldType1] ?? this.default_colors.Normal;
            const newOverlayColor = MyStorage[newStorageKey]?.overlay_color ?? this.default_colors[newType1] ?? this.default_colors.Normal;
            
            // Transition duration in milliseconds
            const duration = 1000; // 1 second
            const startTime = Date.now();
            
            // If overlay colors are the same, skip color transition
            const colorsMatch = oldOverlayColor === newOverlayColor;
            
            // Perform fade transition
            return new Promise((resolve) => {
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    this.evolution_transition_progress = progress;
                    
                    // Fade Pokemon art (handled via opacity in template)
                    // Fade movepool (handled via opacity in template)
                    // Overlay color transition is handled by CSS transition on the .colored-image::after element
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Transition complete
                        this.evolution_transitioning = false;
                        this.evolution_transition_progress = 0;
                        this.evolution_old_species = null;
                        this.evolution_new_species = null;
                        
                        // Update Pokemon art source after transition
                        this.$nextTick(() => {
                            // Art source will update automatically via :src binding
                            resolve();
                        });
                    }
                };
                
                // Styles should already be loaded by the watcher before this is called
                // If colors match, still do a quick transition for Pokemon art
                // If colors don't match, CSS transitions will handle the color fade
                
                animate();
            });
        },
        paralysis(speed) {
            if (this.s1.statusCondition.value == `Paralyzed`) {
                return Math.floor(speed * 0.25)
            }
            else {
                return speed
            }
        },
        //ENEMY MOD STYLING
        enemyMods(modValue) {
            // if (this.g3stateVariable != "Battle") { return this.enemyModColour }
            // var raised = [modValue, "background: #d84444;"]
            // var lowered = [modValue, "background: #21c500"]
            // if (modValue < 0) { this.enemyModColour = raised }
            // if (modValue > 0) { this.enemyModColour = lowered }
            // return this.enemyModColour 
            if (this.g3stateVariable != "Battle") { return this.enemyModColour }
            var neutral = ["0", "background: #a1a1a1;"]
            var raised = [modValue, "background: #d84444;"]
            var lowered = [modValue, "background: #21c500"]
            if (modValue < 0) {
                this.enemyModColour = raised
                return raised
             }
            if (modValue > 0) {
                this.enemyModColour = lowered
                return lowered
            }
            return neutral;
        },
        enemyDynamic(activePkmn, currentSlot) {
            if (activePkmn == currentSlot && this.g3stateVariable == "Battle") {
                return this.mapper?.properties?.battle?.enemyPokemon
            }
            else { 
                return this.mapper?.properties?.battle?.trainer?.team[activePkmn]
            }
        },

        //SPLITS
        currentSplit(splitData) {
            var arrayLength = splitData.length
            var split = splitData[arrayLength]["realtime.end"]
            return this.formatDuration(split)
        },
        lastSplit(splitData) {
            var arrayLength = splitData.length
            var splitNumber = arrayLength - 1
            var split = splitData[splitNumber]["realtime.end"]
            return this.formatDuration(split)
        },

        split(splitName, splits) {
            // console.log(splits)
            var split = splits.find(x => x.trainer_name === splitName)
            if (split == undefined) return
            return split["realtime.end.hours"] + ":" + split["realtime.end.minutes"] + ":" + split["realtime.end.seconds"]
        },

        curseType(x) {
            if (x == `Curse`) {
                return "???"
            }
            else {
                return x
            }
        },
        //AUTOMATION MOVEPOOL GRAPHIC
        dataSearch(dataObject, pointerValue) {
            if (!pointerValue) return ""
            const key = Object.keys(dataObject).find(x => x.toLowerCase() == this.move_name(pointerValue).toLowerCase())
            return dataObject[key] || "ERROR"
        },
        getMovepool(gen3PkmnData, moveData, tmhmMapping, species) {
            const pkmn = this.dataSearch(gen3PkmnData, species)
            let levelup_set = pkmn.levelup_moveset
            if (this.starterString == "Deoxys") {
                switch (this.deoxys_form) {
                    case "Speed"  : levelup_set = pkmn.levelup_moveset_speed; break;
                    case "Normal" : levelup_set = pkmn.levelup_moveset_normal; break;
                    case "Attack" : levelup_set = pkmn.levelup_moveset_attack; break;
                    case "Defense": levelup_set = pkmn.levelup_moveset_defense; break;
                }
            }
            let obj = {
                level: levelup_set.map(x => {
                    return {
                        ...{Level: x[0]},
                        ...this.dataSearch(moveData, x[1]) //searching for index 1
                    }
                }), 
                tmhm: pkmn.tm_hm_learnset.map(x => {
                    return {
                        ...{tmhm: tmhmMapping.find(y => y.Move == x)?.tmhmIndex??"TM01"},
                        ...this.dataSearch(moveData, x)
                    }
                }),     
                tutor: pkmn.tutor_learnset.map(x => {
                    return this.dataSearch(moveData, x)
                }),    
                egg: pkmn.egg_moves.map(x => {
                    return this.dataSearch(moveData, x)
                }),    
            }
            return obj
        }, 
        movepoolResize() {
            let out = this.movepoolResizeCalc();
            if(this.g3stateVariable == "From Battle") {
                return out;
            }
            this.mapper.properties.player.team[0].species.change((newProp, oldProp) => {
                out = this.movepoolResizeCalc();
            })
            return out;
        },
        movepoolResizeCalc() {
            if(!this.dexData){ 
                return;
            }
            //retrieve the default sizing from the .css
            var element = document.getElementById('movepoolMoveTable')

            let small_line_height = 19;
            let resize_threshold = 20;
            this.movepoolDefaultFontSize = 13;//parseInt(computedStyle.getPropertyValue('font-size'),10);
            this.movepoolDefaultLineHeight = 18;//parseInt(computedStyle.getPropertyValue('line-height'),10);
            this.movepoolDefaultContainerHeight = 1000-(this.movepoolDefaultLineHeight);// parseInt(computedStyle.getPropertyValue('height'),10)-this.movepoolDefaultLineHeight+1;
            let maxSize = this.movepoolDefaultContainerHeight / this.movepoolDefaultLineHeight;

            //calculate new sizes
            let currentStarter = this.evolution ? this.displayedPokemonSpecies : this.s1dynamicReset.name;
            if(currentStarter == undefined || currentStarter == null) {
                if (this.mapper.properties.player.team[0].species.value == 'Backport') {
                    currentStarter = this.starterString;
                }
                else if (this.mapper.properties.player.team[0].species) {
                    currentStarter = this.mapper.properties.player.team[0].species.value;
                }
                else {
                    currentStarter = this.starterString;
                }
            }
            let levelup_set = this.dexData[currentStarter].levelup_moveset
            if (this.starterString == "Deoxys") {
                switch (this.deoxys_form) {
                    case "Speed"  : levelup_set = this.dexData[currentStarter].levelup_moveset_speed; break;
                    case "Normal" : levelup_set = this.dexData[currentStarter].levelup_moveset_normal; break;
                    case "Attack" : levelup_set = this.dexData[currentStarter].levelup_moveset_attack; break;
                    case "Defense": levelup_set = this.dexData[currentStarter].levelup_moveset_defense; break;
                }
            }
            let tmhm_set = this.dexData[currentStarter].tm_hm_learnset
            
            let movepoolSize = tmhm_set.length + levelup_set.length;
            if (this.tutor_moves) {
                movepoolSize = movepoolSize + this.dexData[currentStarter].tutor_learnset.length;
            }
            let correctedLineHeight = this.movepoolDefaultContainerHeight / movepoolSize;
            let fontShrinkFactor = 0; //make this bigger to shrink the font more. 0.5 was the default in gen1-3. 0 = no shrinking. 1 or above will be *tiny*

            let correctedFontSize = this.movepoolDefaultFontSize * Math.pow(correctedLineHeight / this.movepoolDefaultLineHeight, fontShrinkFactor);
           
            if (movepoolSize > (maxSize)) {
                return "line-height: " + correctedLineHeight + "px; font-size: "+correctedFontSize+"px;";
            }
            else if (movepoolSize < resize_threshold) {
                return "line-height: " + small_line_height + "px; font-size: "+this.movepoolDefaultFontSize+"px;";
            }
            else if (movepoolSize < resize_threshold) {
                return "line-height: " + small_line_height + "px; font-size: "+this.movepoolDefaultFontSize+"px;";
            }
            else {
                return "line-height: " + correctedLineHeight + "px; font-size: "+this.movepoolDefaultFontSize+"px;";
            }
        },

        // MOVE ACCURACY
        moveAccuracyStatic(move) {
            var moveObject = this.gen3moves.find(x => x.Move.toLowerCase() === this.move_name(move).toLowerCase())
            if(!moveObject) {
                console.error(" Move not found")
                return `-`;
            }
            return moveObject.Accuracy
        },
        moveAccuracyDynamic(move) {
            var moveObject = this.gen3moves.find(x => x.Move.toLowerCase() === this.move_name(move).toLowerCase())
            if(!moveObject)
            {
                console.error(" Move not found: "+move)
                return `-`;
            }
            var moveAccuracy = moveObject.Accuracy
            if(move.toUpperCase() == "THUNDER") {
                if(this.mapper.properties.battle.field.weather.value == "Sun" && !this.weatherDenial && this.g3stateVariable == "Battle") {
                    moveAccuracy = 50;
                }
                if(this.mapper.properties.battle.field.weather.value == "Rain" && !this.weatherDenial && this.g3stateVariable == "Battle") {
                    return `-`;
                }
            }
            var stageModsAcc       = this.stageModifiersData.find(x => x.modType === "accuracy")
            var stageModsEva       = this.stageModifiersData.find(x => x.modType === "evasion")
            var currentModStageAcc = this.batt.yourPokemon.modStageAccuracy.value
            var currentModStageEva = this.batt.enemyPokemon.modStageEvasion.value
            var abilityMod         = 1
            // debugger
            let soundProof = ["GRASSWHISTLE","GROWL","METAL SOUND","PERISH SONG","ROAR","SCREECH","SING","SUPERSONIC"]
            if (this.mapper.properties.battle.enemyPokemon.ability.value == "SOUNDPROOF" && soundProof.includes(move) && this.g3stateVariable=="Battle") {
                return 0;
            }
            if (this.pkmn_ability == "Compound Eyes") {
                abilityMod *= 1.3
            }
            if (this.pkmn_ability == "Hustle") {
                abilityMod *= 0.8;
            }
            if (this.mapper.properties.battle.enemyPokemon.ability.value == "SAND VEIL" && this.mapper.properties.battle.field.weather.value == "Sandstorm" && !this.weatherDenial && this.g3stateVariable == "Battle") {
                abilityMod *= 0.8;
            }
            if (moveAccuracy == `-`) {
                return `-`
            }
            else if (this.g3stateVariable == `Battle`) {
                var accuracy = Math.floor(moveAccuracy * abilityMod * stageModsAcc[currentModStageAcc] * stageModsEva[currentModStageEva])
                if (accuracy > 100) {
                    return 100
                }
                return accuracy
            }
            else {
                var accuracy = Math.floor(moveAccuracy * abilityMod)
                if (accuracy > 100) {
                    return 100
                }
                return accuracy
            }
        },

        // ENEMY TRAINER GRAPHIC
        g3trainerEnemySelector(trainerClass) {
            if (this.game.opponentImageMap[trainerClass]) {
                    return 1
                }
            else
                return 0
        },
        specialTrainerGraphics() {
            if (this.showSpecialTrainerGraphics == true) {
                return this.game.opponentImageMap[this.opponent];
                if (this.opponent == "YOUNGSTER_CALVIN_1") return `images/trainers/${this.opponent}.png`
                if (this.opponent == "LEADER_ROXANNE_1") return `images/trainers/${this.opponent}.png`
                if (this.opponent == "LEADER_BRAWLY_1") return `images/trainers/${this.opponent}.png`
                if (this.opponent == "LEADER_WATTSON_1") return `images/trainers/${this.opponent}.png`
                if (this.opponent == "LEADER_FLANNERY_1") return `images/trainers/${this.opponent}.png`
                if (this.opponent == "LEADER_NORMAN_1") return `images/trainers/${this.opponent}.png`
                if (this.opponent == "LEADER_WINONA_1") return `images/trainers/${this.opponent}.png`
                if (this.opponent == "LEADER_TATE_AND_LIZA_1") return `images/trainers/${this.opponent}.png`
                if (this.opponent == "LEADER_JUAN_1") return `images/trainers/${this.opponent}.png`
                
                // if (this.opponent == "ELITE_FOUR_SIDNEY") return `images/trainers/${this.opponent}.png`
                // if (this.opponent == "ELITE_FOUR_PHOEBE") return `images/trainers/${this.opponent}.png`
                // if (this.opponent == "ELITE_FOUR_GLACIA") return `images/trainers/${this.opponent}.png`
                // if (this.opponent == "ELITE_FOUR_DRAKE") return `images/trainers/${this.opponent}.png`
                // if (this.opponent == "CHAMPION_WALLACE") return `images/trainers/${this.opponent}.png`
                // if (this.opponent == "RIVAL_STEVEN") return `images/trainers/${this.opponent}.png`

                if (this.opponent == "RIVAL_WALLY_MAUVILLE") return `images/trainers/RIVAL_WALLY.png`
                // if (this.opponent == "RIVAL_WALLY_VR_1") return `images/trainers/RIVAL_WALLY.png`

                if (this.opponent == "RIVAL_MAY_RUSTBORO_TREECKO") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_RUSTBORO_TORCHIC") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_RUSTBORO_MUDKIP") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_ROUTE_103_MUDKIP") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_ROUTE_110_MUDKIP") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_ROUTE_119_MUDKIP") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_ROUTE_103_TREECKO") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_ROUTE_110_TREECKO") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_ROUTE_119_TREECKO") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_ROUTE_103_TORCHIC") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_ROUTE_110_TORCHIC") return `images/trainers/RIVAL_MAY.png`
                if (this.opponent == "RIVAL_MAY_ROUTE_119_TORCHIC") return `images/trainers/RIVAL_MAY.png`

                if (this.opponent == "RIVAL_BRENDAN_RUSTBORO_TREECKO") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_RUSTBORO_MUDKIP") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_RUSTBORO_TORCHIC") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_ROUTE_103_MUDKIP") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_ROUTE_110_MUDKIP") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_ROUTE_119_MUDKIP") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_ROUTE_103_TREECKO") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_ROUTE_110_TREECKO") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_ROUTE_119_TREECKO") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_ROUTE_103_TORCHIC") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_ROUTE_110_TORCHIC") return `images/trainers/RIVAL_BRENDAN.png`
                if (this.opponent == "RIVAL_BRENDAN_ROUTE_119_TORCHIC") return `images/trainers/RIVAL_BRENDAN.png`
                else return null;
            }
        },

        speedComparison(playerPkmnData, enemyPkmnData) {
            var playerSpeed = playerPkmnData.speed.value
            var enemySpeed = enemyPkmnData.speed.value
            if (playerSpeed > enemySpeed) {
                return "Outspeeds"
            }
            if (playerSpeed == enemySpeed) {
                return "Speed-Tied"
            }
            if (playerSpeed < enemySpeed) {
                return "Underspeeds"
            }
        },
        fade_enemy_mon(pkmnData) {
            const enemy_hp = pkmnData.hp.value
            if (enemy_hp > 0 || this.g3stateVariable == `To Battle`) {
                return
            }
            else {
                return `filter: grayscale(100%);`
            }
        },
        enemyPkmnUI(pkmnData) {
            if (this.g3stateVariable != `Battle` && this.g3stateVariable != `From Battle`) { return "opacity: 1" }
            if (pkmnData.hp == 0 || this.g3stateVariable == `From Battle`) {
                return "opacity: .5;"
            }
            else {
                return "opacity: 1"
            }
        },
        enemyPkmnFaintCheck(pkmnData) {
            if (pkmnData.hp == 0) {
                return false
            }
            else {
                return true
            }
        },
        enemyPkmnFaint(pkmnData) {
            if (this.g3stateVariable != `Battle` && this.g3stateVariable != `From Battle`) { return "filter: drop-shadow(2px 2px 2px #000) saturate(1.1) grayscale(0%);" }
            if (pkmnData.hp == 0 || this.g3stateVariable == `From Battle`) {
                return "filter: drop-shadow(2px 2px 2px #000) saturate(1.1) grayscale(100%); opacity: .3;"
            }
            else {
                return "filter: drop-shadow(2px 2px 2px #000) saturate(1.1) grayscale(0%);"
            }
        },
        enemyPkmnFaintWild() {
            return "filter: drop-shadow(2px 2px 2px #000) saturate(1.1) grayscale(100%); opacity: .3;"
        },
        enemyPkmnText(pkmnData) {
            if (this.g3stateVariable != `Battle` && this.g3stateVariable != `From Battle`) { return "opacity: 1" }
            if (pkmnData.hp == 0 || this.g3stateVariable == `From Battle`) {
                return "opacity: .3"
            }
            else {
                return "opacity: 1"
            }
        },
        enemyPkmnHP(pkmnData) {
            if (this.g3stateVariable != `Battle` && this.g3stateVariable != `From Battle`) { return "opacity: 1" }
            if (pkmnData.hp == 0 || this.g3stateVariable == `From Battle`) {
                return "opacity: .3"
            }
            else {
                return "opacity: .7"
            }
        },
        enemyPkmnSpecies(pkmnData) {
            if (this.g3stateVariable != `Battle` && this.g3stateVariable != `From Battle`) { return "opacity: .7" }
            if (pkmnData.hp == 0 || this.g3stateVariable == `From Battle`) {
                return "opacity: .3"
            }
            else {
                return "opacity: .7"
            }
        },
        enemyPkmnFaintStats(pkmnData) {
            if (this.g3stateVariable == `To Battle`) {
                return "filter: grayscale(0%);"
            }
            else if (pkmnData.hp == 0 || this.g3stateVariable == `From Battle`) {
                return "filter: grayscale(100%); opacity: .5;"
            }
            else {
                return "filter: grayscale(0%);"
            }
        },
        enemyPkmnFaintTypes(pkmnData) {
            if (this.g3stateVariable == `To Battle`) {
                return "filter: grayscale(0%) drop-shadow(0px 0px 1px #000000c5);"
            }
            else if (pkmnData.hp == 0 || this.g3stateVariable == `From Battle`) {
                return "filter: grayscale(100%) drop-shadow(0px 0px 1px #000000c5); opacity: .5; "
            }
            else {
                return "filter: grayscale(0%) drop-shadow(0px 0px 1px #000000c5);"
            }
        },

        // STAGE MULTIPLIERS
        enemyStatModification(activePkmn, currentSlot, statLabel, stat, modifier, pkmnData) {
            var modData = this.stageModifiersData.find(x => x.modType === "stat")
            var modified_stat = stat
            var status_paralysis = 1
            var status_burn = 1
            var mod_ability = 1
            var mod_weather = 1
            var ability = pkmnData.ability?.value?.toLowerCase() ?? null

            if (pkmnData.status1.value == "Paralyzed" && statLabel == "speed") { status_paralysis = .25 } // sets modifier for paralysis if the Pokemon is paralyzed
            if (pkmnData.status1.value == "Burned" && statLabel == "attack")   { status_burn = 1 }      // sets modifier for burn if the Pokemon is burned

            //ABILITIES
            //Guts
            if (ability == "guts" && statLabel == "attack" && 
            (pkmnData.status1.value == "Burned" || pkmnData.status1.value == "Paralyzed" || pkmnData.status1.value == "Poisoned" || pkmnData.status1.value == "Badly Poisoned" || pkmnData.status1.value == "Badly Posioned")) {
                mod_ability = 1.5 
            }
            //Marvel Scale
            if (ability == "marvel scale" && statLabel == "defense" && pkmnData.status1.value != null) {
                mod_ability = 1.5 
            }
            //Chlorophyll
            if (ability == "chlorophyll" && statLabel == "speed" && this.mapper.properties.battle.field.weather.value == "Sun" && !this.weatherDenial) {
                mod_weather = 2 
            }
            //Swift Swim
            if (ability == "swift swim" && statLabel == "speed" && this.mapper.properties.battle.field.weather.value == "Rain"&& !this.weatherDenial) {
                mod_weather = 2 
            }
            //THESE ABILITIES DON'T MODIFY STATS UNTIL GENERATION 5
            //Torrent 
            //Blaze
            //Overgrow

            //CALCULATES THE CORRECT STAT
            if (activePkmn == currentSlot && this.g3stateVariable == "Battle") {
                modified_stat = Math.floor(stat * modData[modifier] * status_paralysis * status_burn * mod_ability * mod_weather)
            }

            //RETURNS THE CORRECT VALUE
            if (this.enemyState == "Fainted" || this.g3stateVariable == "From Battle") {
                return stat
            }
            if (this.enemyState == "Pokemon" || this.enemyState == "Fainting") {
                return modified_stat
            }
            return modified_stat
        },

        setGamestate(state, number) {
            if (this.gamestateLogging == true)
                // console.log("Gamestate: "+"("+number+") "+state)
            this.currentGameStateNew = string
            return string
        },
        displayState(x = g3state()) {
            if (x == "New Game") {
                return "display-basestats"
            }
            else if (x == "New Game" ) {
                return "display-overworld"
            }
            else if (x == "New Game" ) {
                return "display-battle"
            }
            else if (x == "New Game" ) {
                return "display-doublebattle"
            }
            else
                return "display-default"
        },

        versionCheck() {
            if (this.mapper.meta.gameName == "Pokemon Emerald")
                return "emerald"
            else if (this.mapper.meta.gameName == "Pokemon FireRed & LeafGreen")
                return "remakes-scaled"
            else return "Version Error"
        },

        g3state() {
            // NEW GAME
            if (
                this.gameStarted == false
                )
            {
                string = "New Game"
                gamestate = 1
                return this.setGamestate(string, gamestate)
            }
            // NO POKEMON
            else if (            
                this.mapper.properties.player.name.bytes > 0 &&
                this.mapper.properties.player.teamCount.value == 0 &&
                this.gameStarted == false
                ) 
            {
                string = "No Pokemon"
                gamestate = 2
                return this.setGamestate(string, gamestate)
            }   
            // OVERWORLD
            else if (
                this.mapper.properties.player.name.bytes > 0 &&
                this.mapper.properties.player.teamCount.value > 0 &&
                this.gameStarted == true
                ||
                this.mapper.properties.battle.turnInfo.battleOutcome.bytes > 0 && 
                this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value == 0
            ) 
            {
                string = "Overworld"
                gamestate = 3
                return this.setGamestate(string, gamestate)
            }
            // POST-RESET
            else if (
                this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
                this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value == 0 &&
                this.mapper.properties?.player?.teamCount > 0 &&
                this.gameStarted == true 
            ) 
            {
                string = "Post-Reset"
                gamestate = 9
                return this.setGamestate(string, gamestate)
            }
            //  TO BATTLE
            else if (
                this.mapper.properties.battle.turnInfo.battleDialogue.bytes != 18 &&
                this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
                this.currentGameStateNew == "New Game"
                ||
                this.mapper.properties.battle.turnInfo.battleDialogue.bytes != 18 &&
                this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
                this.currentGameStateNew == "Overworld"
                ||
                this.mapper.properties.battle.turnInfo.battleDialogue.bytes != 18 &&
                this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
                this.currentGameStateNew == "To Battle"
                ||
                this.mapper.properties.battle.turnInfo.battleDialogue.bytes != 18 &&
                this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
                this.currentGameStateNew == "Post-Reset"
            ) 
            {
                string = "To Battle"
                gamestate = 4
                return this.setGamestate(string, gamestate)
            }
            // BATTLE
            else if (
                this.mapper.properties.battle.turnInfo.battleDialogue.bytes == 18 ||
                this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
                this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
                this.currentGameStateNew == "Battle"
            ) 
            {
                string = "Battle"
                gamestate = 5
                this.gameStarted = true
                return this.setGamestate(string, gamestate)
            }
            // DOUBLE-BATTLE
            else if (
                this.mapper.properties.battle.turnInfo.battleDialogue.bytes == 18 ||
                this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
                this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
                this.currentGameStateNew == "Battle"
            ) 
            {
                string = "Double-Battle"
                gamestate = 6
                return this.setGamestate(string, gamestate)
            }
            // FROM BATTLE
            else if (
                this.mapper.properties.battle.turnInfo.battleOutcome.bytes > 0 && 
                this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0
            ) 
            {

                string = "From Battle"
                gamestate = 7
                return this.setGamestate(string, gamestate)
            }
            // RESET
            else if (
                this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
                this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value == 0 &&
                this.mapper.properties?.player?.teamCount == 0 &&
                this.gameStarted == true
            ) 
            {
                string = "Reset"
                gamestate = 8
                return this.setGamestate(string, gamestate)
            }
            // ERROR
            else {
                string = "Error"
                gamestate = 10
                return this.setGamestate(string, gamestate)
            }
        },

        growthRate() {
            var growthRate = this.dexData[this.starterString].growth_rate
            if (growthRate == "GROWTH_MEDIUM_SLOW") {
                return "Medium Slow"
            }
            else if (growthRate == "GROWTH_MEDIUM_FAST") {
                return "Medium Fast"
            }
            else if (growthRate == "GROWTH_FAST") {
                return "Fast"
            }
            else if (growthRate == "GROWTH_SLOW") {
                return "Slow"
            }
            else if (growthRate == "GROWTH_FLUCTUATING") {
                return "Fluctuating"
            }
            else if (growthRate == "GROWTH_ERRATIC") {
                return "Erratic"
            }
            else {
                return this.dexData[starterString].growth_rate
            }
        },


        // Badge boosts
        badge_boost(badge, stat) {
            if (this.display_badge_boosts == false) { return stat }
            return badge ? Math.floor(stat * 1.1) : stat;
        },

        //autosplitter_functions.js
        log_split,
        autosplitter_process,

        // text_functions.js
        move_name,
        camelCase,
        capitalization_format,
        pascalCaseSpace,
        pascalCaseDot,
        titleCaseNoUnderscores,
        itemCheck,
        ifZero,
        nullToNone,
        nullToSpace,

        // time_functions.js
        padTime,
        gameTimeHM,
        gameTimeHM,
        gameTimeM,
        gameTimeHMS,
        leadZero,
        formatDuration,

        getPokemonImageUrl: function (x) {
            if (x != null)
                return `images/overlay/${x.pokedexNumber}.png`
        },
        getStarterArt: function () {
            return `images/pokemon/${this.starterString}.png`
        },
        getStarterImageUrl: function () {
            return `images/overlay/${this.starterString}.png`
        },
        getStarterTypeTexture() {
            if (this.pick == true) {
                var type = this.gen3data.find(y => y.dexNumber === this.starterString)
                return `images/elements/textures/${type.type1.toLowerCase()}.png`
            }
            else
                return `images/elements/textures/normal.png`
        },

        //BADGE GRAPHIC RECALL
        badgeGraphic(x) {
            if (x.value == true) {
                var badge = x.path.toString().substring(14)
                return `images/badges/${badge}.png`
            }
            else if (x.value == false) {   
                return null
            }
        },
        
        //STATUS CONDITION FUNCTIONS
        statusHealedFix(y) { //this function fixes the status so that when " " is returned it says "cured"
            if (y == " " || y == null || y == undefined)
                return "Cured"
            else
                return y
        },
        statusCheck(y) {
            if (y == null || y == undefined)
                return ""
            else
                return y
        },
        
        //GENERAL FUNCTIONS
        nullCheck(y) {
            if (y != null || y != undefined)
                return y
            else
                return ""
            },
        pokemon(y, x) {
            if (y != null)
                var pkmnData = this.gen3data.find(x => x.dexNumber === y.toString())
                return pkmnData[x]
        },
        stageModifiers(y) {
            if (y === null) {
                return ""
            }
            else if (y == -6 && this.mapper.properties.battle?.yourPokemon?.species?.value == null)
                return ""
            else
                if (y > 0) {
                    return "+" + y.toString()
                }
                else
                    if (y < 0) {
                        return y.toString()
                    }
                    else
                        return ""
        },
        species(x) {
            if (x != null && x.value != null)
                return x.value.name
            else
                return null
        },
        natureCalculation(x) {
            var natureKey = (x % 25).toString()
            return this.camelCase(this.natures[natureKey])
        },
        abilityDescription(y) {
            return gen3abilities[y]
        },
        
        //BATTLE STATE
        currentBattleState() {
            //BATTLE
            if (this.mapper.properties.battle.turnInfo.battleStart.value >= 1 && this.mapper.properties.battle.type.bytes >= 1) {
                return 4
            }
            //START OF BATTLE
            else if (this.mapper.properties.battle.turnInfo.battleStart.value === 0 && this.mapper.properties.battle.type.bytes >= 1) {
                return 2
            }
            //OVERWORLD
            else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.type.value === `None`) {
                return 2
            }
            //OAK CATCHING STARTER
            else if (this.mapper.properties.battle.specialType.value === `Oak Catching Starter`) {
                return 0
            }
            //BASE STATS
            else
                return 0
        },
        
        //DAMAGE CALCULATIONS
        damageRange(x, y, z) {
            level = this.mapper.properties.battle.yourPokemon.level.value
            attack = this.mapper.properties.battle.yourPokemon.attack.value
            defense = this.mapper.properties.battle.enemyPokemon.defense.value
            specialA = this.mapper.properties.battle.yourPokemon.special.value
            specialD = this.mapper.properties.battle.enemyPokemon.special.value
            power = x
            stab = 1.5
            type1 = y
            type2 = z
            const randomMax = 1
            const randomMin = 217 / 255
            damageMax = ((((((2 * level / 5) + 2) * power * attack) / defense) / 50) + 2) * stab * type1 * type2 * randomMax
            damageMin = ((((((2 * level / 5) + 2) * power * attack) / defense) / 50) + 2) * stab * type1 * type2 * randomMin
            return damageMin.toString() + "-" + damageMax.toString()
        },
    
        sleep(ms) {
            return new Promise((res) => setTimeout(res, ms))
        },
        ability(ability, statname, statValue) {
            if (ability == `Hustle` && statname == `attack`) {
                return Math.floor(statValue * 1.5)
            }
            else if (ability == `Pure Power` && statname == `attack`) {
                return Math.floor(statValue * 2)
            }
            else if (ability == `Huge Power` && statname == `attack`) {
                return Math.floor(statValue * 2)
            }
            else if (ability == `Marvel Scale` && this.s1.statusCondition.value != null && statname == `defense`) {
                return Math.floor(statValue * 1.5)
            }
            else if (ability == `Chlorophyll` && this.batt.turnInfo.battleWeather.value == `Sun` && statname == `speed`&& !this.weatherDenial) {
                return Math.floor(statValue * 1.5)
            }
            else if (ability == `Swift Swim` && this.batt.turnInfo.battleWeather.value == `Rain` && statname == `speed`&& !this.weatherDenial) {
                return Math.floor(statValue * 1.5)
            }
            else if (ability == `Guts` && statname == `attack` && (this.s1.statusCondition.value == "Paralyzed" || this.s1.statusCondition.value == "Poisoned" || this.s1.statusCondition.value == "Burned")) {
                return Math.floor(statValue * 1.5)
            }
            else { 
                return statValue
            }
        },
        
        //EXPERIENCE FUNCTIONS
        calcExpStats(growthRate, exp) {
            if (growthRate == "GROWTH_MEDIUM_SLOW") {
                growthRate = "Medium Slow"
            }
            else if (growthRate == "GROWTH_MEDIUM_FAST") {
                growthRate = "Medium Fast"
            }
            else if (growthRate == "GROWTH_FAST") {
                growthRate = "Fast"
            }
            else if (growthRate == "GROWTH_SLOW") {
                growthRate = "Slow"
            }
            else if (growthRate == "GROWTH_FLUCTUATING") {
                growthRate = "Fluctuating"
            }
            else if (growthRate == "GROWTH_ERRATIC") {
                growthRate = "Erratic"
            }
            const expTable = {
                "Erratic":     [0,15,52,122,237,406,637,942,1326,1800,2369,3041,3822,4719,5737,6881,8155,9564,11111,12800,14632,16610,18737,21012,23437,26012,28737,31610,34632,37800,41111,44564,48155,51881,55737,59719,63822,68041,72369,76800,81326,85942,90637,95406,100237,105122,110052,115015,120001,125000,131324,137795,144410,151165,158056,165079,172229,179503,186894,194400,202013,209728,217540,225443,233431,241496,249633,257834,267406,276458,286328,296358,305767,316074,326531,336255,346965,357812,367807,378880,390077,400293,411686,423190,433572,445239,457001,467489,479378,491346,501878,513934,526049,536557,548720,560922,571333,583539,591882,600000],
                "Fast":        [0,6,21,51,100,172,274,409,583,800,1064,1382,1757,2195,2700,3276,3930,4665,5487,6400,7408,8518,9733,11059,12500,14060,15746,17561,19511,21600,23832,26214,28749,31443,34300,37324,40522,43897,47455,51200,55136,59270,63605,68147,72900,77868,83058,88473,94119,100000,106120,112486,119101,125971,133100,140492,148154,156089,164303,172800,181584,190662,200037,209715,219700,229996,240610,251545,262807,274400,286328,298598,311213,324179,337500,351180,365226,379641,394431,409600,425152,441094,457429,474163,491300,508844,526802,545177,563975,583200,602856,622950,643485,664467,685900,707788,730138,752953,776239,800000],
                "Medium Fast": [0,8,27,64,125,216,343,512,729,1000,1331,1728,2197,2744,3375,4096,4913,5832,6859,8000,9261,10648,12167,13824,15625,17576,19683,21952,24389,27000,29791,32768,35937,39304,42875,46656,50653,54872,59319,64000,68921,74088,79507,85184,91125,97336,103823,110592,117649,125000,132651,140608,148877,157464,166375,175616,185193,195112,205379,216000,226981,238328,250047,262144,274625,287496,300763,314432,328509,343000,357911,373248,389017,405224,421875,438976,456533,474552,493039,512000,531441,551368,571787,592704,614125,636056,658503,681472,704969,729000,753571,778688,804357,830584,857375,884736,912673,941192,970299,1000000],
                "Medium Slow": [0,9,57,96,135,179,236,314,419,560,742,973,1261,1612,2035,2535,3120,3798,4575,5460,6458,7577,8825,10208,11735,13411,15244,17242,19411,21760,24294,27021,29949,33084,36435,40007,43808,47846,52127,56660,61450,66505,71833,77440,83335,89523,96012,102810,109923,117360,125126,133229,141677,150476,159635,169159,179056,189334,199999,211060,222522,234393,246681,259392,272535,286115,300140,314618,329555,344960,360838,377197,394045,411388,429235,447591,466464,485862,505791,526260,547274,568841,590969,613664,636935,660787,685228,710266,735907,762160,789030,816525,844653,873420,902835,932903,963632,995030,1027103,1059860],
                "Slow":        [0,10,33,80,156,270,428,640,911,1250,1663,2160,2746,3430,4218,5120,6141,7290,8573,10000,11576,13310,15208,17280,19531,21970,24603,27440,30486,33750,37238,40960,44921,49130,53593,58320,63316,68590,74148,80000,86151,92610,99383,106480,113906,121670,129778,138240,147061,156250,165813,175760,186096,196830,207968,219520,231491,243890,256723,270000,283726,297910,312558,327680,343281,359370,375953,393040,410636,428750,447388,466560,486271,506530,527343,548720,570666,593190,616298,640000,664301,689210,714733,740880,767656,795070,823128,851840,881211,911250,941963,973360,1005446,1038230,1071718,1105920,1140841,1176490,1212873,1250000],
                "Fluctuating": [0,4,13,32,65,112,178,276,393,540,745,967,1230,1591,1957,2457,3046,3732,4526,5440,6482,7666,9003,10506,12187,14060,16140,18439,20974,23760,26811,30146,33780,37731,42017,46656,50653,55969,60505,66560,71677,78533,84277,91998,98415,107069,114205,123863,131766,142500,151222,163105,172697,185807,196322,210739,222231,238036,250562,267840,281456,300293,315059,335544,351520,373744,390991,415050,433631,459620,479600,507617,529063,559209,582187,614566,639146,673863,700115,737280,765275,804997,834809,877201,908905,954084,987754,1035837,1071552,1122660,1160499,1214753,1254796,1312322,1354652,1415577,1460276,1524731,1571884,1640000]
            };

            // makes searching a bit easiser
            expTable["Erratic"][100]     = expTable["Erratic"][99] + 1;
            expTable["Fast"][100]        = expTable["Fast"][99] + 1;
            expTable["Medium Fast"][100] = expTable["Medium Fast"][99] + 1;
            expTable["Medium Slow"][100] = expTable["Medium Slow"][99] + 1;
            expTable["Slow"][100]        = expTable["Slow"][99] + 1;
            expTable["Fluctuating"][100] = expTable["Fluctuating"][99] + 1;
        
            const index = expTable[growthRate].findIndex(x => x > exp);
            const currLvlExp = expTable[growthRate][index - 1];
            const nextLvlExp = expTable[growthRate][index];
            return {
                level: index,
                percent: (exp - currLvlExp) / (nextLvlExp - currLvlExp),
            };
        }, 
        decimalToPercentage(decimal) {
            return Math.round(decimal * 100);
        },

        // MOVE MANAGEMENT
        movepoolPower(moveObject) {
            if (moveObject.Move.toUpperCase() == `HIDDEN POWER`) {
                return this.hiddenPowerPowerCalc(this.mapper.properties.player.team[0])
            }
            if (moveObject.Move.toUpperCase() == `RETURN`) {
                if (this.mapper.properties.player.teamCount.value == 0) {
                    return "-"
                }
                return this.g3ReturnPowerCalc(this.mapper.properties.player.team[0])
            }
            if (moveObject.Move.toUpperCase() == `FRUSTRATION`) {
                if (this.mapper.properties.player.teamCount.value == 0) {
                    return "-"
                }
                return this.g3FrustrationPowerCalc(this.mapper.properties.player.team[0])
            }
            else { return moveObject.Power }
        },
        movepoolTypeColor(moveObject) {
            if (moveObject.Type == `Curse`) {
                return "Curse"
            }
            // console.log(moveObject.Move)
            if (moveObject.Move.toUpperCase() == `HIDDEN POWER`) {
                return this.hidden_power_type
            }
            return moveObject.Type
        },
        movepoolType(moveObject) {
            if (moveObject.Type == `Curse`) {
                return "???"
            }
            if (moveObject.Type == `curse`) {
                return "???"
            }
            if (moveObject.Move.toUpperCase() == `HIDDEN POWER`) {
                return this.hidden_power_type
            }
            return moveObject.Type
        },


        moveType(y) { //y = move1.value
            if (y.toUpperCase() == "HIDDEN POWER") {
                var move = this.hiddenPowerTypeCalc(this.mapper.properties.player.team[0])
                return move
            }
            if(y.toUpperCase() == "WEATHER BALL") {
                // let weatherType = {
                //     "Sun" : "Fire",
                //     "Hail" : "Ice",
                //     "Rain" : "Water",
                //     "Sandstorm" : "Rock",
                //     "" : "Normal",
                //     null : "Normal",
                //     undefined : "Normal",
                // }
                // console.log(y);
                // console.log(this.mapper.properties.battle.turnInfo.battleWeather.value)
                // var moveType = weatherType[this.mapper.properties.battle.turnInfo.battleWeather.value];
                // console.log(moveType);
                // return moveType;
                return this.weatherBallTypeCalc();
            }
            else if (y) {
                var move = this.gen3moves.find(x => x.Move.toLowerCase() === this.move_name(y).toLowerCase())
                if (move) return move.Type
            }
            return null
        },
        moveTypeIcon(y) { //y = move1.value
            if (y != null && y != undefined && y.toUpperCase() == "HIDDEN POWER") {
                return `images/elements/type-icons/${this.hiddenPowerTypeCalc(this.mapper.properties.player.team[0]).toLowerCase()}.png`
            }
            if (y != null && y != undefined && y.toUpperCase() == "WEATHER BALL" && this.g3stateVariable=="Battle") {
                return `images/elements/type-icons/${this.weatherBallTypeCalc().toLowerCase()}.png`
            }
            if (y === "Struggle") {
                return `images/elements/type-icons/curse.png`
            }
            else if (y != null && y != undefined) {
                var move = this.gen3moves.find(x => x.Move.toLowerCase() === this.move_name(y).toLowerCase())
                if(!move) {
                    console.error(" Move not found")
                    return null
                }
                var moveType = move[`Type`]?.toLowerCase()
                return `images/elements/type-icons/${moveType}.png`
            }
            else {
                return null
            }
        },
        // TYPE EFFECTIVENESS
        checkTypes(x, y) { //x = type1.value, y = type2.value
            if (x.value == y.value)
                return true
            else
                return false
        },
        
        stageModColor(x) {
            if (x == 0)
                return "rgb(0, 0, 0);"
            else if (x < 0)
                return "rgb(107, 0, 0);"
            else (x > 0)
                return "rgb(0, 66, 14);"
        },


        
        //x = stat modifier property (not the value of the property. [ex. battle.modStageAttack])
        statLabelOpacity(x) {
            if (this.mapper.properties.battle?.yourPokemon?.species?.value == null)
                return 1
            else if (this.g3stateVariable == "Battle")
                if (x.bytes != 6)
                    return this.statLabelOpacityValue
                else
                    return 1
            else
                return 1
        },



        //move_functions.js
        movePower,
        hiddenPowerTypeCalc,
        hiddenPowerPowerCalc,
        weatherBallTypeCalc,
        g3ReturnPowerCalc,
        g3FrustrationPowerCalc,

        //modifier_functions.js
        determineSTAB,
        determineItemBoost,
        abilityModifier,
        burnModifier,
        stageMultiplier,
        weatherModifier,

        //attacking_functions.js
        enemy_move_power,
        enemy_effective_power,
        typeEffectiveness,
        type_effectiveness,
        g3ReturnPowerCalc,
        g3FrustrationPowerCalc,

        battlePokemonCrop() {
            const totalPokemon = this.enemyTrainerList?.[this.opponentId]?.pokemon?.length;
            const heights = {
              1: "234px",
              2: "402px",
              3: "566px",
              4: "736px",
              5: "902px",
              6: "1080px"
            };
            return `height: ${heights[totalPokemon]}; filter: saturate(${this.ui_saturation}) drop-shadow(0px 0px 1px #000000)`;
        },
        battlePokemonCropWild() {
            return `height: 234px`
        },
        newGame() {
            // console.log("watching for new game")
            // console.log(this.mapper.properties[this.game.newGameFlagContainer][this.game.newGameFlag])
            if (this.no_counters == false) {
                if (this.gameSelection == 'Emerald') {
                    this.mapper.properties[this.game.newGameFlagContainer][this.game.newGameFlag].change((newProp, oldProp) => {
                        if(this.game.newGameValueNew.includes(newProp.value) && this.game.newGameValueOld.includes(oldProp.value)){
                            console.log("New run detected... Timer started.")
                            if (!this.testRun && this.no_counters == false) { 
                                this.attempt_number++ 
                            }
                            this.hallOfFameReset = false;
                            this.newRun();
                            // this.timer.startTime(this.timer_startTimeOffset);
                            if (this.set_rom_starter_automatically) { this.update_rom_starter_and_intro_mon(); }
                        }
                    })
                }
                else if (this.gameSelection == 'FireRed and LeafGreen') {
                    if (this.legacy_state == false) {
                        this.mapper.properties.pointers.sStpCallback2.change((currentProp, previousProp) => {
                            value_current  = currentProp.value
                            value_previous = previousProp.value
                            // console.log(value_current, value_previous)
                            if (value_current == 'CB2_NewGameScene' && (value_previous == 'CB2_TitleScreenRun' || value_previous == 'CB2_TitleScreenRun' || value_previous == 'CB2_MainMenu')) {
                                console.log("New run detected... Timer started.")
                                if (!this.testRun && this.no_counters == false) { 
                                    this.attempt_number++ 
                                }
                                this.hallOfFameReset = false;
                                this.newRun();
                                // this.timer.startTime(this.timer_startTimeOffset);
                                if (this.set_rom_starter_automatically) { this.update_rom_starter_and_intro_mon(); }
                            }
                        })
                    }
                    else {
                        this.mapper.properties[this.game.newGameFlagContainer][this.game.newGameFlag].change((newProp, oldProp) => {
                            if(this.game.newGameValueNew.includes(newProp.value) && this.game.newGameValueOld.includes(oldProp.value)){
                                console.log("New run detected... Timer started.")
                                if (!this.testRun && this.no_counters == false) { 
                                    this.attempt_number++ 
                                }
                                this.hallOfFameReset = false;
                                this.newRun();
                                // this.timer.startTime(this.timer_startTimeOffset);
                                if (this.set_rom_starter_automatically) { this.update_rom_starter_and_intro_mon(); }
                            }
                        })
                    }
                }
                else {
                    this.mapper.properties[this.game.newGameFlagContainer][this.game.newGameFlag].change((newProp, oldProp) => {
                        if(this.game.newGameValueNew.includes(newProp.value) && this.game.newGameValueOld.includes(oldProp.value)){
                            console.log("New run detected... Timer started.")
                            if (!this.testRun && this.no_counters == false) { 
                                this.attempt_number++ 
                            }
                            this.hallOfFameReset = false;
                            this.newRun();
                            // this.timer.startTime(this.timer_startTimeOffset);
                            if (this.set_rom_starter_automatically) { this.update_rom_starter_and_intro_mon(); }
                        }
                    })
                }
            }
        },
        freezeEncounters() {
            const debug_function = false
            if (debug_function) { console.log("Freezing encounters") }
            const map_name = this.mapper.properties.overworld.mapName.value;
            const starter  = this.starterString
            const badge    = this.mapper.properties.player.badges.badge1.value
            const game     = this.gameSelection
            if (game == 'Emerald' && starter == "Latios") {
                if (this.catch_rate == true) { this.mapper.properties.stp_vars.STP_CATCH_RATE.set(0x01,false); }
                if (badge == false) {
                    this.mapper.setBits([
                        {path: 'overworld.encounters.zigzagoon', value: false, freeze: false},
                        {path: 'overworld.encounters.marill',    value: false, freeze: false},
                        {path: 'overworld.encounters.taillow',   value: false, freeze: false},
                    ])
                    return
                }
                if (badge == true) {
                    this.mapper.setBits([
                        {path: 'overworld.encounters.zigzagoon', value: true, freeze: false},
                        {path: 'overworld.encounters.marill',    value: true, freeze: false},
                        {path: 'overworld.encounters.taillow',   value: true, freeze: false},
                    ])
                }
                switch (map_name) {
                    case "ROUTE 101": 
                        if (this.route_101 == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        break;
                    case "ROUTE 102": 
                        if (this.route_102 == false && badge == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        else if (this.route_102 == false && badge == true && this.mapper.properties.overworld.encounters.zigzagoon.value == true) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x00,false);
                        }
                        else if (this.route_102 == false && badge == true) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        break;
                    case "ROUTE 103": 
                        if (this.route_103 == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        break;
                    default: this.mapper.properties.overworld.disabledEncounters.set(0x00,false);
                }
            }
            else if (game == 'Emerald') {
                if (this.catch_rate == true) { this.mapper.properties.stp_vars.STP_CATCH_RATE.set(0x01,false); }
                switch (map_name) {
                    case "ROUTE 101": 
                        if (this.route_101 == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        break;
                    case "ROUTE 102": 
                        if (this.route_102 == false && badge == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        else if (this.route_102 == false && badge == true && this.mapper.properties.overworld.encounters.zigzagoon.value == true) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x00,false);
                        }
                        else if (this.route_102 == false && badge == true) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        break;
                    case "ROUTE 103": 
                        if (this.route_103 == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        break;
                    default: this.mapper.properties.overworld.disabledEncounters.set(0x00,false);
                }
            }
            else if (game == 'FireRed and LeafGreen') {
                if (this.catch_rate == true) { this.mapper.properties.patch.STP_CATCH_RATE.set(1,false); }
                switch (map_name) {
                    case "ROUTE 1": 
                        if (this.mapper.properties.events.menu.pokedex.value == true) {
                            if (this.route_1 == true || this.mapper.properties.events.stp_pidgey_on_route_1.value == true || this.mapper.properties.events.stp_rattata_on_route_1.value == true) {
                                this.mapper.properties.overworld.disabledEncounters.set(0x00,false);
                            }
                            else {
                                this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                            }
                        }
                        else if (this.mapper.properties.events.menu.pokedex.value == false) {
                            if (this.route_1 == false) {
                                this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                            }
                            else {
                                this.mapper.properties.overworld.disabledEncounters.set(0x00,false);
                            }
                        }
                        break;
                    case "ROUTE 2": 
                        if (this.route_2 == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        break;
                    case "ROUTE 22": 
                        if (this.route_22 == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        break;
                    case "VIRIDIAN_FOREST": 
                        if (this.viridian_forest == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        break;
                    case "ROUTE 6": 
                        if (this.route_6 == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(0x01,false);
                        }
                        break;
                    default: this.mapper.properties.overworld.disabledEncounters.set(0x00,false);
                }
            }
        },
        natureLabels(nature) {
            let output = nature + ": ";
            // let pad = 7 - nature.length;
            // output+="-".repeat(pad) + ": "
            switch(this.natures[nature].raises) {
                case "Attack":
                    output+= "+Attack";
                    break;
                case "Defense":
                    output+= "+Defense";
                    break;
                case "Special Attack":
                    output+= "+Sp. Atk";
                    break;
                case "Special Defense":
                    output+= "+Sp. Def";
                    break;
                case "Speed":
                    output+= "+Speed";
                    break;
                default:
                    output+= "Neutral";
                    break;
            }
            switch(this.natures[nature].lowers) {
                case "Attack":
                    output+= " | -Attack";
                    break;
                case "Defense":
                    output+= " | -Defense";
                    break;
                case "Special Attack":
                    output+= " | -Sp. Atk";
                    break;
                case "Special Defense":
                    output+= " | -Sp. Def";
                    break;
                case "Speed":
                    output+= " | -Speed";
                    break;
                default:
                    break;
            }
            return output;
        },
        trashCans() {
            if(this.game.gameName != "FireRed and LeafGreen") {
                return;
            }
            //TRASH CAN PUZZLE
            //This functions solves the trash can puzzle automatically for the player.
            const trashCanPuzzle = async () => {
                if (this.mapper.properties.events.trashCanPuzzle.value == false) {//check to see if the Puzzle is solved yet, if it's not proceeds to solve it
                    await Promise.all([
                        this.mapper.properties.events.trashCanPuzzle.set(true, false), 
                    ])
                }
            }	
            this.mapper.properties.overworld.mapName.change(async (newMap) => {
                if(newMap == "VERMILION_CITY") {
                    await trashCanPuzzle();
                }
            })
        },
        checkedEncounters(route) {
            let newValue = this.game.encountersMap[route];
            if(typeof this.mapper.properties.overworld.disabledEncounters.value == 'number') {
                if(newValue) {
                    newValue = 1;
                }
                else {
                    newValue = 0;
                }
            }
            if(this.mapper.properties.overworld.mapName.value == route) {
                this.mapper.properties.overworld.disabledEncounters.set(newValue,false);
            }
        },
    },
    

//--------- PROGRAM MOUNTED ---------------------------------------------------------------------------------------------------------------//
    mounted: async function () {
        const that = this
        this.mapper = new GameHookMapperClient()
        this.mapper.onMapperLoaded = (x) => this.ready = true
        this.mapper.onMapperUnloaded = (x) => this.ready = false
        await this.mapper.connect()

        // In mounted hook (around line 6897)
        // Poll for emulator stats continuously
        this.emulatorStatsInterval = setInterval(async () => {
            if (this.ready) { // Only poll when mapper is ready
                await this.fetchEmulatorStats();
            }
        }, 10); // 100ms = 10 times per second (adjust as needed)

        // console.log("mapper set")
        this.timer.update();
        this.load_all_settings()

        // Initialize evolution family list
        this.updateEvolutionFamilyList();

        // Initial tracking of personality value and species
        this.last_known_personality_value = this.mapper.properties.player.team[0].personalityValue.value;
        this.last_known_species = this.mapper.properties.player.team[0].species.value;
        
        // Track personality value changes
        this.mapper.properties.player.team[0].personalityValue.change(async (newProp, oldProp) => {
            // Update tracked personality value
            this.last_known_personality_value = newProp.value;
        });

        // Species change handler - handles both normal species changes and evolution
        this.mapper.properties.player.team[0].species.change(async (newProp, oldProp) => {
            const currentPersonalityValue = this.mapper.properties.player.team[0].personalityValue.value;
            // const state = this.mapper.properties.meta.state.value
            const state = this.g3stateVariable
            // console.log(newProp)
            // console.log(this.evolution)
            // console.log(this.last_known_personality_value)
            
            // Check if this is an evolution (same personality value, different species, evolution enabled)
            if (this.evolution == true && newProp.value != oldProp.value && 
                currentPersonalityValue === this.last_known_personality_value &&
                this.last_known_personality_value != null) {
                    
                    const evolution_family_raw = this.evolution_data_pokedex?.[this.starterString]?.evolution_family;
                    // console.log(evolution_family_raw)
                    // console.log(this.evolution_data_pokedex)

                    if (evolution_family_raw && evolution_family_raw.length > 0) {
                        // console.log('Got here')
                        const evolution_family = evolution_family_raw.map(obj => obj.species).filter(s => s != null);
                        const evolved = evolution_family.includes(newProp.value);
                        console.log(evolved)
                        if (evolved == true) {
                            // Store old species for transition
                            const oldSpecies = this.starter;
                            const newSpecies = newProp.value;

                            this.stats = "Base Stats";
                            
                            // Update starter
                            this.starter = newSpecies;
                            this.last_known_species = newSpecies;
                            
                            // Update the dropdown to the new evolved species
                            // This will trigger the watcher to load the new species' styles
                            this.selected_evolution_species = newSpecies;
                            
                            // Show base stats of new evolved species until next battle
                            this.show_evolved_base_stats = true;
                            this.evolved_species_for_stats = newSpecies;
                            
                            // Perform fade transition
                            await this.performEvolutionTransition(oldSpecies, newSpecies);
                            
                            // Update personality value tracking
                            this.last_known_personality_value = currentPersonalityValue;
                            return; // Don't process as normal species change
                        }
                    }
            }
            
            // Normal species change handling (not an evolution)
            this.last_known_species = newProp.value;
            this.last_known_personality_value = currentPersonalityValue;
            
            if ((state == "Battle" || state == "From Battle") && this.mapper.properties.battle.yourPokemon.hp.value != 0) {
                this.starterString = newProp.value
            }
            else if (state == "Overworld") {
                this.starterString = newProp.value
            }
        })

        if (this.playerResets.toString().length == 1) {
            document.getElementById("reset_counter_single").style.fontSize = "68px"
        }
        if (this.playerResets.toString().length == 3) {
            document.getElementById("reset_counter_single").style.fontSize = "58px"
        }
        if (this.playerResets.toString().length == 4) {
            document.getElementById("reset_counter_single").style.fontSize = "48px"
        }
        if (this.playerResets.toString().length == 1) {
            document.getElementById("reset_counter").style.fontSize = "68px"
        }
        if (this.playerResets.toString().length == 3) {
            document.getElementById("reset_counter").style.fontSize = "58px"
        }
        if (this.playerResets.toString().length == 4) {
            document.getElementById("reset_counter").style.fontSize = "48px"
        }
        if (this.blackout_counter.toString().length == 1) {
            document.getElementById("blackout_counter").style.fontSize = "68px"
        }
        if (this.blackout_counter.toString().length == 3) {
            document.getElementById("blackout_counter").style.fontSize = "58px"
        }
        if (this.blackout_counter.toString().length == 4) {
            document.getElementById("blackout_counter").style.fontSize = "48px"
        }

        for (var species of Object.keys(dexDataRubySapphireEmerald)) {
            var image = new Image();
            image.src = `images/pokemon/${species}.png`;
        }
        this.pokemon_list = this.keys_function(this.dexDataRubySapphireEmerald)

        this.newGame();

        this.mapper.properties.pointers.sStpCallback2.change((newProp) => {
            if (this.set_rom_starter_automatically && newProp.value == 'CB2_InitMainMenu' && this.timer.formatted_time[0] == "0h0m0s" && this.timer.formatted_time[1] == ".00") {
                console.log('Setting ROM starter automatically')
                this.update_rom_starter_and_intro_mon()
            }
        });
        //GAMESTATE MANAGEMENT
        // set initial gamestate value when the layout is loaded
        if (this.legacy_state == true) {
            if (this.mapper.properties.player.team[0].level.value == 0) {
                this.g3stateVariable = "Base Stats"
            }
            else if (this.mapper.properties.pointers.callback1.value == 0 || this.mapper.properties.pointers.callback1.value == null) {
                this.g3stateVariable = "Base Stats"
            }
            else if (this.game.callback1.overworld.includes(this.mapper.properties.pointers.callback1.value)) {
                this.g3stateVariable = "Overworld"
            }
            else if (this.game.callback1.toBattle.includes(this.mapper.properties.pointers.callback1.value)) {
                if (this.game.callback2.toBattle.includes(this.mapper.properties.pointers.callback2.value) && this.mapper.properties.battle.turnInfo.battleDialogue.value == null) {
                    this.g3stateVariable = "To Battle"
                }
                else {
                    this.g3stateVariable = "Battle"
                }
            }
            else 
                this.g3stateVariable = "Battle"
    
            // wait for events to change the state
            this.mapper.properties.pointers.callback1.change((prop) => {
                if ((this.game.callback1.overworld.includes(prop.value))) {
                    this.g3stateVariable = "Overworld"
                }
            });
            this.mapper.properties.battle.turnInfo.battleDialogue.change((prop) => {
                if(prop == " " || prop == null || prop == undefined ) {
                    return;
                }
                if (prop.value == "Player Control" || prop.bytes == 6) { 
                    this.g3stateVariable = "Battle"
                }
            });
            this.mapper.properties.battle.turnInfo.battleOutcome.change((prop) => {
                let endConditions = ["WON", "LOST", "DRAW", "RAN", "CAUGHT", "PLAYER_TELEPORTED", "POKEMON_FLED", "NO_SAFARI_BALLS", "FORFEITED", "POKEMON_TELEPORTED",1,2,3,4,5,6,7,8,9,10];
                if (endConditions.includes(prop.value)) { this.g3stateVariable = "From Battle"}
                if (prop.value == "WON")                { this.g3stateVariable = "From Battle"}
                if (prop.value == "LOST")               { this.g3stateVariable = "From Battle"}
                if (prop.value == "DRAW")               { this.g3stateVariable = "From Battle"}
                if (prop.value == "RAN")                { this.g3stateVariable = "From Battle"}
                if (prop.value == "CAUGHT")             { this.g3stateVariable = "From Battle"}
                if (prop.value == "PLAYER_TELEPORTED")  { this.g3stateVariable = "From Battle"}
                if (prop.value == "POKEMON_FLED")       { this.g3stateVariable = "From Battle"}
                if (prop.value == "NO_SAFARI_BALLS")    { this.g3stateVariable = "From Battle"}
                if (prop.value == "FORFEITED")          { this.g3stateVariable = "From Battle"}
                if (prop.value == "POKEMON_TELEPORTED") { this.g3stateVariable = "From Battle"}
            });
            this.mapper.properties.pointers.callback2.change((prop) => {
                if (this.game.callback2.baseStats.includes(prop.value)) { 
                    this.g3stateVariable = "Base Stats"
                }
                else if (this.game.callback2.toBattle.includes(prop.value) && this.g3stateVariable != "Battle") { 
                    this.g3stateVariable = "To Battle"
                }
            });
            this.mapper.properties.player.team[0].personalityValue.change((prop) => {
                if (prop.value == 0) {
                    this.g3stateVariable = "Base Stats"
                }
            });
            //track resets
            //callback2 seems more reliable to track than dma1 in firered no encryption
            if (this.legacy_state == true) {
                this.mapper.properties.pointers.callback2.change((newProp, oldProp) => {
                    if(this.game.callback2.reset.includes(newProp.value) /*&& !this.game.callback2.reset.includes(newProp.value)*/) {
                        if (this.hallOfFameReset == true) {
                            this.hallOfFameReset = false;
                        }
                        else {
                            if (this.no_counters == false) {
                                this.playerResets++;
                                if (this.shuckie_counters) { this.incrementEmulatorCounter("playerResets") }
                            }
                        }
                    }
                    if(this.game.callback2.blackout.includes(newProp.value) /*&& !this.game.callback2.reset.includes(newProp.value)*/) {
                        if (this.no_counters == false) {
                            this.blackout_counter++;
                            if (this.shuckie_counters) { this.incrementEmulatorCounter("blackout_counter") }
                        }
                    }
                });
            }
            else {
                this.mapper.properties.pointers.sStpCallback2.change((newProp, oldProp) => {
                    if(this.game.callback2.reset.includes(newProp.value) /*&& !this.game.callback2.reset.includes(newProp.value)*/) {
                        if (this.hallOfFameReset == true) {
                            this.hallOfFameReset = false;
                        }
                        else {
                            if (this.no_counters == false) {
                                this.playerResets++;
                                if (this.shuckie_counters) { this.incrementEmulatorCounter("playerResets") }
                            }
                        }
                    }
                    if(this.game.callback2.blackout.includes(newProp.value) /*&& !this.game.callback2.reset.includes(newProp.value)*/) {
                        if (this.no_counters == false) {
                            this.blackout_counter++;
                            if (this.shuckie_counters) { this.incrementEmulatorCounter("blackout_counter") }
                        }
                    }
                });
            }
        }
        else {
            if (this.mapper.properties.player.team[0].level.value == 0) {
                this.g3stateVariable = "Base Stats"
            }
            else if (this.mapper.properties.pointers.sStpCallback1.value == null) {
                this.g3stateVariable = "Base Stats"
            }
            else if (this.game.callback1.overworld.includes(this.mapper.properties.pointers.sStpCallback1.value)) {
                this.g3stateVariable = "Overworld"
            }
            else if (this.game.callback1.toBattle.includes(this.mapper.properties.pointers.sStpCallback1.value)) {
                if (this.game.callback2.toBattle.includes(this.mapper.properties.pointers.sStpCallback2.value) && this.mapper.properties.battle.turnInfo.battleDialogue.value == null) {
                    if (this.show_evolved_base_stats) {
                        this.show_evolved_base_stats = false;
                        this.stats = "Automatic";
                    }
                    this.g3stateVariable = "To Battle"
                }
                else {
                    if (this.show_evolved_base_stats) {
                        this.show_evolved_base_stats = false;
                        this.stats = "Automatic";
                    }
                    this.g3stateVariable = "Battle"
                }
            }
            else {
                if (this.show_evolved_base_stats) {
                    this.show_evolved_base_stats = false;
                    this.stats = "Automatic";
                }
                this.g3stateVariable = "Battle"
            }
    
            // wait for events to change the state
            this.mapper.properties.pointers.sStpCallback1.change((prop) => {
                if ((this.game.callback1.overworld.includes(prop.value))) {
                    this.g3stateVariable = "Overworld"
                }
            });
            this.mapper.properties.battle.turnInfo.battleDialogue.change((prop) => {
                if(prop == " " || prop == null || prop == undefined ) {
                    return;
                }
                if (prop.value == "Player Control" || prop.bytes == 6) { 
                    if (this.show_evolved_base_stats) {
                        this.show_evolved_base_stats = false;
                        this.stats = "Automatic";
                    }
                    this.g3stateVariable = "Battle"
                }
            });
            this.mapper.properties.battle.turnInfo.battleOutcome.change((prop) => {
                let endConditions = ["WON", "LOST", "DRAW", "RAN", "CAUGHT", "PLAYER_TELEPORTED", "POKEMON_FLED", "NO_SAFARI_BALLS", "FORFEITED", "POKEMON_TELEPORTED",1,2,3,4,5,6,7,8,9,10];
                if (endConditions.includes(prop.value)) { this.g3stateVariable = "From Battle"}
                if (prop.value == "WON")                { this.g3stateVariable = "From Battle"}
                if (prop.value == "LOST")               { this.g3stateVariable = "From Battle"}
                if (prop.value == "DRAW")               { this.g3stateVariable = "From Battle"}
                if (prop.value == "RAN")                { this.g3stateVariable = "From Battle"}
                if (prop.value == "CAUGHT")             { this.g3stateVariable = "From Battle"}
                if (prop.value == "PLAYER_TELEPORTED")  { this.g3stateVariable = "From Battle"}
                if (prop.value == "POKEMON_FLED")       { this.g3stateVariable = "From Battle"}
                if (prop.value == "NO_SAFARI_BALLS")    { this.g3stateVariable = "From Battle"}
                if (prop.value == "FORFEITED")          { this.g3stateVariable = "From Battle"}
                if (prop.value == "POKEMON_TELEPORTED") { this.g3stateVariable = "From Battle"}
            });
            this.mapper.properties.pointers.sStpCallback2.change((prop) => {
                if (this.game.callback2.baseStats.includes(prop.value)) { 
                    this.g3stateVariable = "Base Stats"
                }
                else if (this.game.callback2.toBattle.includes(prop.value) && this.g3stateVariable != "Battle") { 
                    this.g3stateVariable = "To Battle"
                }
            });
            this.mapper.properties.player.team[0].personalityValue.change((prop) => {
                if (prop.value == 0) {
                    this.g3stateVariable = "Base Stats"
                }
            });
            //track resets
            //callback2 seems more reliable to track than dma1 in firered no encryption
            this.mapper.properties.pointers.sStpCallback2.change((newProp, oldProp) => {
                if(this.game.callback2.reset.includes(newProp.value) /*&& !this.game.callback2.reset.includes(newProp.value)*/) {
                    if (this.hallOfFameReset == true) {
                        this.hallOfFameReset = false;
                    }
                    else {
                        if (this.no_counters == false) {
                            this.playerResets++;
                            if (this.shuckie_counters) { this.incrementEmulatorCounter("playerResets") }
                        }
                    }
                }
                if(this.game.callback2.blackout.includes(newProp.value) /*&& !this.game.callback2.reset.includes(newProp.value)*/) {
                    if (this.no_counters == false) {
                        this.blackout_counter++;
                        if (this.shuckie_counters) { this.incrementEmulatorCounter("blackout_counter") }
                    }
                }
            });
        }

        //ENEMY STATE MANAGER
        if (this.mapper.properties.player.team[0].level.value == 0 || this.g3stateVariable == 'Overworld') 
            this.enemyState = "Not In Battle";
        else if (this.mapper.properties.battle.turnInfo.battleDialogue.value ==  6 ||this.mapper.properties.battle.turnInfo.battleDialogue.bytes ==  6)
            this.enemyState = "Pokemon";
        else if (this.mapper.properties.battle.type.is_battle.value == true)
            this.enemyState = "Not In Battle";
        else if  (this.mapper.properties.battle.enemyPokemon.hp.value == 0)
            this.enemyState = "Fainted";
        else if  (this.mapper.properties.battle.enemyPokemon.hp.value > 0 && this.mapper.properties.screen.menu.currentItem.value == 0)
            this.enemyState = "Pokemon Sent Out";
        else if  (this.mapper.properties.battle.enemyPokemon.hp.value > 0 && this.mapper.properties.screen.menu.currentItem.value > 0)
            this.enemyState = "Pokemon";

        this.mapper.properties.pointers.callback2.change((prop) => {
            if (this.g3stateVariable == 'To Battle') { 
                this.enemyState = "Battle Starting"
            }
        });

        this.mapper.properties.battle.turnInfo.battleDialogue.change((prop) => {
            if ((prop.value == `Player Control` || prop.value == 6) && this.enemyState == "Battle Starting") {
                this.enemyState = "Pokemon";
            }
        });
        this.mapper.properties.battle.enemyPokemon.hp.change(async (newProp, oldProp) => {
            if (newProp.value == 0 && this.enemyState == "Pokemon") {
                this.enemyState = "Fainting"
                await this.sleep(200) 
                this.enemyState = "Fainted"
            }
            if (newProp.value > 0 && this.enemyState == "Fainted") {
                this.enemyState = "Pokemon"
            }
        });
        this.mapper.properties.battle.outcome.change(async (prop) => {
            if (prop.value != null) {
                this.enemyState = "Battle Finished"
            }
        });

        // // Evolution control
        // this.mapper.properties.player.team[0].species.change(async (newProp, oldProp) => {
        //     if (this.evolution == true && this.game.evolutions[this.starterString]) {
        //         const evolution_family_raw = this.game.evolutions[this.starterString]?.evolution_family
        //         const evolution_family = evolution_family_raw.map(obj => obj.species)
        //         const length = evolution_family.length
        //         const evolved = evolution_family.includes(newProp.value)
        //         const buffer_evolution_splits_label = this.evolution_splits_label
        //         this.buffer_battle_exp = this.mapper.properties.player.team[0].expPoints.value
        //         if (evolved == true) {
        //             this.starterString = newProp.value
        //             this.evolution_splits_label = buffer_evolution_splits_label
        //         }
        //     }
        // })

        //MOST RECENT FIELD STATUS
        //resets the field status at the start of battle
        this.mapper.properties.battle.field?.player?.statusReflect.change(async (prop) => { 
            if (prop.value == true) {
                this.last_initiated_field_effect = "Reflect"
            }
        });
        this.mapper.properties.battle.field?.player?.statusLightScreen.change(async (prop) => { 
            if (prop.value == true) {
                this.last_initiated_field_effect = "Light Screen"
            }
        });
        this.mapper.properties.battle.field?.player?.statusSafeguard.change(async (prop) => { 
            if (prop.value == true) {
                this.last_initiated_field_effect = "Safeguard"
            }
        });
        this.mapper.properties.battle.field?.weather.change(async (prop) => { 
            if (prop.value != null) {
                this.last_initiated_field_effect = prop.value
            }
        });


        this.mapper.properties.player.badges.badge1.change(async (prop) => {
            if (this.game.gameName == "Emerald" && prop.value == true) {
                if (this.hm_woods_shroomish == true) {
                    this.mapper.properties.overworld.encounters.shroomish.set(true, false)
                }
                // if (this.hm_116_abra == true) {

                // }
                // if (this.hm_cave_abra == true) {
                    
                // }
            }
        })     

        // TRACK VARIABLES HERE ------------------------------------------------------------------------------------------------//
        this.mapper.properties.gameTime.seconds.change(async (x) => {
            if (this.mapper.properties.battle.yourPokemon.speciesArray.value != null) {
                this.bufferNature = this.natureCalculation(this.mapper.properties.player.team[0].personalityValue.value)
                this.bufferAbility = this.camelCase(this.mapper.properties.battle.yourPokemon.ability.value)
                this.bufferHeldItem = this.camelCase(this.mapper.properties.player.team[0].itemHeld.value)
                this.bufferLevel = this.mapper.properties.player.team[0].level.value
            }
        })
        

        // DEFINE FUNCTIONS FOR GAMEHOOK MODIFICATIONS HERE --------------------------------------------------------------------//
        const onLoad = async () => {
            const noMod = 0x06 //0x06 - no modifier
            // const noMod = "0" //0x06 - no modifier
            if (this.mapper.properties.player.team[0].personalityValue?.value == 0 || this.mapper.properties.player.team[0].personalityValue?.value == null) //battle is cleared
                await Promise.all([
                    this.mapper.properties.battle.yourPokemon.modStageAttack.setBytes([noMod], false), //resets ram to no mod
                    this.mapper.properties.battle.yourPokemon.modStageDefense.setBytes([noMod], false), //resets ram to no mod
                    this.mapper.properties.battle.yourPokemon.modStageSpeed.setBytes([noMod], false), //resets ram to no mod
                    this.mapper.properties.battle.yourPokemon.modStageSpecialAttack.setBytes([noMod], false), //resets ram to no mod
                    this.mapper.properties.battle.yourPokemon.modStageSpecialDefense.setBytes([noMod], false), //resets ram to no mod
                ])
        }
        await onLoad()

        const stageMods = async () => {
            const noMod = 0x06 //0x06 - no modifier
            // const noMod = "0" //0x06 - no modifier
            if (this.mapper.properties.battle.turnInfo.battleOutcome.bytes > 0) { //checks to see if the player is current in the overworld
                await Promise.all([
                    this.mapper.properties.battle.yourPokemon.modStageAttack.setBytes([noMod], false), //resets ram to no mod
                    this.mapper.properties.battle.yourPokemon.modStageDefense.setBytes([noMod], false), //resets ram to no mod
                    this.mapper.properties.battle.yourPokemon.modStageSpeed.setBytes([noMod], false), //resets ram to no mod
                    this.mapper.properties.battle.yourPokemon.modStageSpecialAttack.setBytes([noMod], false), //resets ram to no mod
                    this.mapper.properties.battle.yourPokemon.modStageSpecialDefense.setBytes([noMod], false), //resets ram to no mod
                ])
            }
        }

        this.mapper.properties.battle.turnInfo.battleOutcome.change(async (x) => {
            await stageMods()
        })
        this.mapper.properties.player.team[0].move1.change(async (x) => {
            if (x.value == null) {
                return
            }
            that.move1 = x
        })

        // SETTING THE STARTER POKEMON'S STATS ----------------------------------------------------------------------------------------------//
        const setStartingAttributes = async () => {
            //* PERSIONALITY VALUE CALCULATION
            // const personalityValue = this.natures[this.pkmnNature][`personality_value_${this.pkmn_gender.toLowerCase()}`]
            //256 * 25 * 10 = 70400, gives a clean starting point where modulo 25 and modulo 256 are both 0
            //this can really be anything divisible by 256 though
            var personalityValue = 70400 + this.natures[this.pkmnNature]["modulo_value"];
            if(this.pkmn_gender == "Male") {
                //31 and 225 are the breakpoints for 87% gender ratio pokemon
                personalityValue += 225;
            }
            //the odd/evenness may need to be flipped according to the selected ability
            //this is very important to ensure evolutions do not have their abilities swapped
            if ((personalityValue % 2 == 0 && this.pkmn_ability == this.game.dexData[this.starterString].abilities[1]) ||
            (personalityValue % 2 == 1 && this.pkmn_ability == this.game.dexData[this.starterString].abilities[0])) {
                //these checks are trying to flip the odd/even by adding an odd number multiple of 25
                //in order to not disturb the nature calc. It's trying to maintain the gender calc too.
                if (personalityValue % 256 <= 11 && this.pkmn_gender != "Male") {
                    personalityValue += 275; //adding 275 won't make the modulo exceed 31
                }
                else if (personalityValue % 256 > 11 && this.pkmn_gender != "Male") {
                    personalityValue += 1525; //1525 keeps the modulo between 0 and 31
                }
                else if (personalityValue % 256 <= 236 && this.pkmn_gender == "Male") {
                    personalityValue += 275; //adding 275 keeps the modulo between 225 and 255
                }
                else if (personalityValue % 256 > 236 && this.pkmn_gender == "Male") {
                    personalityValue += 1525; //1525 keeps the modulo between 225 and 255
                }
            }

            //* IV BLOCK CALCULATION
            var hp_data       = this.hiddenpowers
            var pkmn_hp       = this.hidden_power_type  
            var pkmn_hp_index = this.hidden_power_index

            var ivHp    = hp_data[pkmn_hp][pkmn_hp_index][0]
            var ivAtk   = hp_data[pkmn_hp][pkmn_hp_index][1]
            var ivDef   = hp_data[pkmn_hp][pkmn_hp_index][2]
            var ivSpe   = hp_data[pkmn_hp][pkmn_hp_index][3]
            var ivSpA   = hp_data[pkmn_hp][pkmn_hp_index][4]
            var ivSpD   = hp_data[pkmn_hp][pkmn_hp_index][5]
            var int_ability = this.pkmn_ability == this.game.dexData[this.starterString].abilities[1] ? 1 : 0

            //* SET PROPERTIES
            // only recalculate stats when IVs when your starter is received
            if (this.game.starterLocation.includes(this.mapper.properties.overworld.mapName.value)  && this.mapper.properties.player.team[0].level.value == 5) {
                await Promise.all([
                    this.mapper.properties.player.team[0].personalityValue.set(personalityValue, false), 
                    this.mapper.setBits([
                        {path: 'player.team.0.ivHp',             value: ivHp,        freeze: false},
                        {path: 'player.team.0.ivAttack',         value: ivAtk,       freeze: false},
                        {path: 'player.team.0.ivDefense',        value: ivDef,       freeze: false},
                        {path: 'player.team.0.ivSpeed',          value: ivSpe,       freeze: false},
                        {path: 'player.team.0.ivSpecialAttack',  value: ivSpA,       freeze: false},
                        {path: 'player.team.0.ivSpecialDefense', value: ivSpD,       freeze: false},
                        {path: 'player.team.0.int_ability',      value: int_ability, freeze: false},
                    ]),
                ])
                if (this.gameSelection == 'FireRed and LeafGreen' && (this.starterString == 'Mew' || this.starterString == 'Celebi' || this.starterString == 'Jirachi' || this.starterString == 'Deoxys')) {
                    await Promise.all([ 
                        this.mapper.properties.player.team[0].fateful_encounter.set(true, false), 
                    ])
                }
                if (this.gameSelection == 'Emerald' && (this.starterString == 'Mew' || this.starterString == 'Celebi' || this.starterString == 'Jirachi' || this.starterString == 'Deoxys')) {
                    await Promise.all([ 
                        this.mapper.properties.player.team[0].fateful_encounter.set(1, false), 
                    ])
                }
                if (this.gameSelection == 'Emerald') {
                    const abra_116 = this.hm_116_abra
                    const abra_granite = this.hm_cave_abra
                    await this.mapper.setBits([
                        {path: 'overworld.encounters.abra_116',     value: abra_116,     freeze: false},
                        {path: 'overworld.encounters.abra_granite', value: abra_granite, freeze: false},
                    ])
                }
            }
        }
        
        const setStartingStats = async () => {
            let pkmnData = this.dexData[this.starterString]
            const level    = 5
            const natures  = this.natures[this.pkmnNature]

            // Deoxys Forms
            const deoxys_stats = {
                "Speed": {
                    "base_hp"     : 50,
                    "base_atk"    : 95,
                    "base_def"    : 90,
                    "base_spc_atk": 95,
                    "base_spc_def": 90,
                    "base_spd"    : 180
                },
                "Normal" : {
                    "base_hp"     : 50,
                    "base_atk"    : 150,
                    "base_def"    : 50,
                    "base_spc_atk": 150,
                    "base_spc_def": 50,
                    "base_spd"    : 150
                },
                "Attack" : {
                    "base_hp"     : 50,
                    "base_atk"    : 180,
                    "base_def"    : 20,
                    "base_spc_atk": 180,
                    "base_spc_def": 20,
                    "base_spd"    : 150
                },
                "Defense": {
                    "base_hp"     : 50,
                    "base_atk"    : 70,
                    "base_def"    : 160,
                    "base_spc_atk": 70,
                    "base_spc_def": 160,
                    "base_spd"    : 90
                }
            }
            if (this.starterString == "Deoxys") {
                switch (this.deoxys_form) {
                    case "Speed"  : pkmnData = deoxys_stats["Speed"]; break;
                    case "Normal" : pkmnData = deoxys_stats["Normal"]; break;
                    case "Attack" : pkmnData = deoxys_stats["Attack"]; break;
                    case "Defense": pkmnData = deoxys_stats["Defense"]; break;
                }
            }

            var ivHp  = this.mapper.properties.player.team[0].ivHp.value
            var ivAtk = this.mapper.properties.player.team[0].ivAttack.value
            var ivDef = this.mapper.properties.player.team[0].ivDefense.value
            var ivSpA = this.mapper.properties.player.team[0].ivSpecialAttack.value
            var ivSpD = this.mapper.properties.player.team[0].ivSpecialDefense.value
            var ivSpe = this.mapper.properties.player.team[0].ivSpeed.value

            //calculates the Pokemon's starting stats with the desired DVs
            var hitpoints      = Math.floor((((2 * pkmnData.base_hp + ivHp + 0) * level)/100) + level + 10)
            var attack         = Math.floor(Math.floor(((((2 * pkmnData.base_atk + ivAtk + 0) * level)/100) + 5)) * natures["nature_attack"])
            var defense        = Math.floor(Math.floor(((((2 * pkmnData.base_def + ivDef + 0) * level)/100) + 5)) * natures["nature_defense"])
            var specialAttack  = Math.floor(Math.floor(((((2 * pkmnData.base_spc_atk + ivSpA + 0) * level)/100) + 5)) * natures["nature_specialAttack"])
            var specialDefense = Math.floor(Math.floor(((((2 * pkmnData.base_spc_def + ivSpD + 0) * level)/100) + 5)) * natures["nature_specialDefense"])
            var speed          = Math.floor(Math.floor(((((2 * pkmnData.base_spd + ivSpe + 0) * level)/100) + 5)) * natures["nature_speed"])

            // only recalculate stats when IVs when your starter is received
            if (this.game.starterLocation.includes(this.mapper.properties.overworld.mapName?.value) && this.mapper.properties.player.team[0].level.value == 5) {
                await Promise.all([
                    this.mapper.properties.player.team[0].hp.set(hitpoints, false), 
                    this.mapper.properties.player.team[0].maxHp.set(hitpoints, false), 
                    this.mapper.properties.player.team[0].attack.set(attack, false), 
                    this.mapper.properties.player.team[0].defense.set(defense, false), 
                    this.mapper.properties.player.team[0].specialAttack.set(specialAttack, false), 
                    this.mapper.properties.player.team[0].specialDefense.set(specialDefense, false), 
                    this.mapper.properties.player.team[0].speed.set(speed, false), 
                ])
            }
            // if (this.pokedex_indexes[this.starterString] > 0x97 && this.gameSelection == 'FireRed and LeafGreen') { // TODO requires testing
            //     this.toggle_national_dex()
            // }
        }
        this.mapper.properties.player.team[0].move1pp.change(async (newProp) => {
            const species = this.mapper.properties.player.team[0].species.value
            const move1 = this.mapper.properties.player.team[0].move1.value
            const move2 = this.mapper.properties.player.team[0].move2.value
            if (species == 'Regirock' || species == 'Regice' || species == 'Registeel') {
                if (move1 == 'EXPLOSION' && move2 == null) {
                    await Promise.all([
                        this.mapper.properties.player.team[0].move1pp.set(0, false),
                    ])
                }   
            }
        });
        this.mapper.properties.player.team[0].level.change(async (newProp) => {
            if (newProp == 5 && this.game.starterLocation.includes(this.mapper.properties.overworld.mapName?.value) ) {
                console.log("Set starting attributes")
                await setStartingAttributes()
            }
        });
        this.mapper.properties.battle.type.first_battle.change(async (newProp, oldProp) => {
            if (newProp.value == true && oldProp.value == false && this.game.starterLocation.includes(this.mapper.properties.overworld.mapName?.value) && this.mapper.properties.player.team[0].level.value == 5) {
                await setStartingStats()
            }
        });
        this.mapper.properties.overworld.mapName.change(async (newProp) => {
            this.freezeEncounters();
            // Automatic EV display based on location has been disabled
            // if (this.automatic_evs == true) { 
            //     const locations = [
            //         "VIRIDIAN_CITY - MART",
            //         "CELADON_CITY - DEPARTMENT_STORE_1F",      
            //         "CELADON_CITY - DEPARTMENT_STORE_2F",      
            //         "CELADON_CITY - DEPARTMENT_STORE_3F",      
            //         "CELADON_CITY - DEPARTMENT_STORE_4F",      
            //         "CELADON_CITY - DEPARTMENT_STORE_5F",      
            //         "CELADON_CITY - DEPARTMENT_STORE_ROOF",    
            //         "CELADON_CITY - DEPARTMENT_STORE_ELEVATOR",
            //         "SILPH_CO - 1F",       
            //         "SILPH_CO - 2F",       
            //         "SILPH_CO - 3F",       
            //         "SILPH_CO - 4F",       
            //         "SILPH_CO - 5F",       
            //         "SILPH_CO - 6F",       
            //         "SILPH_CO - 7F",       
            //         "SILPH_CO - 8F",       
            //         "SILPH_CO - 9F",       
            //         "SILPH_CO - 10F",      
            //         "SILPH_CO - 11F",      
            //         "SILPH_CO - ELEVATOR", 
            //         "POKEMON_MANSION - 1F",
            //         "POKEMON_MANSION - 2F",
            //         "POKEMON_MANSION - 3F",
            //         "POKEMON_MANSION - B1F",
            //         "SAFARI_ZONE - CENTER",
            //         "SAFARI_ZONE - EAST",  
            //         "SAFARI_ZONE - NORTH", 
            //         "SAFARI_ZONE - WEST",  
            //         "ROCKET_HIDEOUT - B1F",     
            //         "ROCKET_HIDEOUT - B2F",     
            //         "ROCKET_HIDEOUT - B3F",     
            //         "ROCKET_HIDEOUT - B4F",     
            //         "ROCKET_HIDEOUT - ELEVATOR",
            //         "SAFARI_ZONE - CENTER_REST_HOUSE",
            //         "SAFARI_ZONE - EAST_REST_HOUSE",  
            //         "SAFARI_ZONE - NORTH_REST_HOUSE", 
            //         "SAFARI_ZONE - WEST_REST_HOUSE",  
            //         "SAFARI_ZONE - SECRET_HOUSE",     
            //         "INDIGO_PLATEAU - POKEMON_CENTER_1F",
            //         "INDIGO_PLATEAU - POKEMON_CENTER_2F",
            //     ]
            //     if (locations.includes(newProp.value)) {
            //         this.stats = "EVs"
            //     }
            //     else {
            //         this.stats = "Automatic"
            //     }
            // }
        });
        this.mapper.properties.overworld.disabledEncounters.change(async (newProp) => {
            console.log("disabled encounters: " + newProp.value)
        });

        //FIX OF ENEMY BATTLE STATS
        this.mapper.properties.battle.enemyPokemon.partyPos.change(async (newProp) => {
            if (newProp == 0 || newProp == 255) { return }
            this.slotTimingFix = true    
            await this.sleep(100)
            this.slotTimingFix = false
        })

        //Styling for stats in case they go above 999
        const stat_size_3_digit = "50px"
        const stat_size_4_digit = "43px"
        if (document.getElementById("Atk") && this.get_stat('Attack').toString().length <= 3)          { document.getElementById("Atk").style.fontSize = stat_size_3_digit }
        if (document.getElementById("Atk") && this.get_stat('Attack').toString().length >= 4)          { document.getElementById("Atk").style.fontSize = stat_size_4_digit }
        if (document.getElementById("Def") && this.get_stat('Defense').toString().length <= 3)         { document.getElementById("Def").style.fontSize = stat_size_3_digit }
        if (document.getElementById("Def") && this.get_stat('Defense').toString().length >= 4)         { document.getElementById("Def").style.fontSize = stat_size_4_digit }
        if (document.getElementById("SpA") && this.get_stat('Special Attack').toString().length <= 3)  { document.getElementById("SpA").style.fontSize = stat_size_3_digit }
        if (document.getElementById("SpA") && this.get_stat('Special Attack').toString().length >= 4)  { document.getElementById("SpA").style.fontSize = stat_size_4_digit }
        if (document.getElementById("SpD") && this.get_stat('Special Defense').toString().length <= 3) { document.getElementById("SpD").style.fontSize = stat_size_3_digit }
        if (document.getElementById("SpD") && this.get_stat('Special Defense').toString().length >= 4) { document.getElementById("SpD").style.fontSize = stat_size_4_digit }
        if (document.getElementById("Spe") && this.get_stat('Speed').toString().length <= 3)           { document.getElementById("Spe").style.fontSize = stat_size_3_digit }
        if (document.getElementById("Spe") && this.get_stat('Speed').toString().length >= 4)           { document.getElementById("Spe").style.fontSize = stat_size_4_digit }
        this.mapper.properties.battle.yourPokemon.modStageAttack.change(async () => {
            if (this.get_stat('Attack').toString().length <= 3) { document.getElementById("Atk").style.fontSize = stat_size_3_digit }
            if (this.get_stat('Attack').toString().length >= 4) { document.getElementById("Atk").style.fontSize = stat_size_4_digit }
        })
        this.mapper.properties.battle.yourPokemon.modStageDefense.change(async () => {
            if (this.get_stat('Defense').toString().length <= 3) { document.getElementById("Def").style.fontSize = stat_size_3_digit }
            if (this.get_stat('Defense').toString().length >= 4) { document.getElementById("Def").style.fontSize = stat_size_4_digit }
        })
        this.mapper.properties.battle.yourPokemon.modStageSpecialAttack.change(async () => {
            if (this.get_stat('Special Attack').toString().length <= 3) { document.getElementById("SpA").style.fontSize = stat_size_3_digit }
            if (this.get_stat('Special Attack').toString().length >= 4) { document.getElementById("SpA").style.fontSize = stat_size_4_digit }
        })
        this.mapper.properties.battle.yourPokemon.modStageSpecialDefense.change(async () => {
            if (this.get_stat('Special Defense').toString().length <= 3) { document.getElementById("SpD").style.fontSize = stat_size_3_digit }
            if (this.get_stat('Special Defense').toString().length >= 4) { document.getElementById("SpD").style.fontSize = stat_size_4_digit }
        })
        this.mapper.properties.battle.yourPokemon.modStageSpeed.change(async () => {
            if (this.get_stat('Speed').toString().length <= 3) { document.getElementById("Spe").style.fontSize = stat_size_3_digit }
            if (this.get_stat('Speed').toString().length >= 4) { document.getElementById("Spe").style.fontSize = stat_size_4_digit }
        })

        //*Autosplitter
        //write to file at the end of a key battle
        this.mapper.properties.battle.turnInfo.battleOutcome.change(async (prop) => {
            // console.log('Battle Outcome Changed')
            this.autosplitter_process()
            // console.log('Autosplitter Attempted to Run by Battle Outcome Change')
            // console.log("Battle outcome: " + prop.value)
            if ((prop.value == "WON" || prop.value == 1) && this.mapper.properties.battle.type.trainer.value) {
                // console.log('Starting log process')
                let trainer = this.opponent
                let id = this.opponentId
                let gameName = this.game.gameName == 'Emerald' ? 'E' : this.game.gameName == 'Ruby & Sapphire' ? 'RS' : this.game.gameName == 'FireRed and LeafGreen' ? 'FRLG' : this.game.gameName;
                let gameName_path = this.game.gameName;
                const splitFileName = this.getSplitFileName();

                //write full split data
                logData(gameName, gameName_path, this.full_data_str, this.attempt_number, splitFileName, "Full", this.testRun, this.scott_mode, this.evolution, this.evolution_splits_label)
                
                //write deprecated split data
                if (this.autosplitter[this.game.gameName][trainer]) {
                    logData(gameName, gameName_path, this.deprecated_data_str, this.attempt_number, splitFileName, "Deprecated", this.testRun, this.scott_mode, this.evolution, this.evolution_splits_label)
                }
                
                //write simple split data
                const simpleSplit = () => {
                    this.log_split()
                    logData(gameName, gameName_path, this.simple_data_str, this.attempt_number, splitFileName, "Simple", this.testRun, this.scott_mode, this.evolution, this.evolution_splits_label)
                    this.split_data.push(this.simple_data)
                    MyStorage["split_data"] = this.split_data
                    MyStorage[this.starterString] = {
                        ...MyStorage[this.starterString],
                        split_data: this.split_data
                    }
                }
                if(this.game.splits.includes(trainer) && !this.game.finalBattle.includes(trainer)) {
                    simpleSplit();
                    if (this.automatic_post_battle_splits == true) {
                        // this.battle_summary_header = `${this.capitalization_format(trainer)} Summary`
                        this.right_panel = "Splits"
                        // this.automatic_splits = true
                    }
                }
           
                if (this.game.champion.includes(trainer)) {
                    this.hallOfFameReset = true;
                }

                //stop timer
                if (this.game.finalBattle.includes(trainer)) {
                    if ((this.mapper.properties.battle.trainer.opponent?.value == "CHAMPION_FIRST_CHARMANDER" || this.mapper.properties.battle.trainer.opponent?.value == "CHAMPION_FIRST_SQUIRTLE" || this.mapper.properties.battle.trainer.opponent?.value == "CHAMPION_FIRST_BULBASAUR") 
                        && this.league_rematches == true) {
                            return
                    }
                    this.timer.stopTime();
                    if (this.shuckie_timer == true) { 
                        this.sendEmulatorEnd(); 
                    }
                    if (!this.testRun && !this.no_counters) {
                        this.finished_run_count++
                    };
                    if (this.automatic_post_battle_splits == true) {
                        // this.battle_summary_header = `${this.capitalization_format(trainer)} Summary`
                        this.right_panel = "Splits"
                        // this.automatic_splits = true
                    }
                    this.log_split();

                    //use then so that logCopy doesn't touch any files until logData finishes
                    if (this.gameSelection == 'FireRed and LeafGreen') {
                        simpleSplit();
                    }
                    else {
                        logData(gameName, gameName_path, this.simple_data_str, this.attempt_number, splitFileName, "Simple", this.testRun, this.scott_mode, this.evolution, this.evolution_splits_label)
                        .then(() => {
                                console.log("Run complete - moving attempt files to finished folder.")
                                logCopy(gameName, gameName_path, this.attempt_number, splitFileName, this.finished_run_count, this.evolution, this.evolution_splits_label);
                            })
                            .catch(error => {
                                console.error("Error:", error);
                            });
                        this.split_data.push(this.simple_data)
                        MyStorage["split_data"] = this.split_data
                        MyStorage[this.starterString] = {
                            ...MyStorage[this.starterString],
                            split_data: this.split_data
                        }
                        console.log("Data transfer finished.")
                    }
                }
            }
        });

        if (this.gameSelection == 'FireRed and LeafGreen') {
            this.mapper.properties.screen.hall_of_fame_4.change(async (newProp, oldProp) => {
                if (newProp.value == 0 && oldProp.value == 255 && this.mapper.properties.overworld.mapName.value == "POKEMON_LEAGUE - HALL_OF_FAME") {
                    this.autosplitter_process('HALL_OF_FAME')
    
                    let trainer = this.opponent
                    let id = this.opponentId
                    let gameName = this.game.gameName == 'Emerald' ? 'E' : this.game.gameName == 'Ruby & Sapphire' ? 'RS' : this.game.gameName == 'FireRed and LeafGreen' ? 'FRLG' : this.game.gameName;
                    let gameName_path = this.game.gameName;
                    const splitFileName = this.getSplitFileName();
    
                    //write full split data
                    logData(gameName, gameName_path, this.full_data_str, this.attempt_number, splitFileName, "Full", this.testRun, this.scott_mode, this.evolution, this.evolution_splits_label)
                    //write deprecated split data
                    logData(gameName, gameName_path, this.deprecated_data_str, this.attempt_number, splitFileName, "Deprecated", this.testRun, this.scott_mode, this.evolution, this.evolution_splits_label)
                    
                    //write simple split data
                    //use then so that logCopy doesn't touch any files until logData finishes
                    logData(gameName, gameName_path, this.simple_data_str, this.attempt_number, splitFileName, "Simple", this.testRun, this.scott_mode, this.evolution, this.evolution_splits_label)
                    .then(() => {
                            console.log("Run complete - moving attempt files to finished folder.")
                            logCopy(gameName, gameName_path, this.attempt_number, splitFileName, this.finished_run_count, this.evolution, this.evolution_splits_label);
                        })
                        .catch(error => {
                            console.error("Error:", error);
                        });
                    this.split_data.push(this.simple_data)
                    MyStorage["split_data"] = this.split_data
                    MyStorage[this.starterString] = {
                        ...MyStorage[this.starterString],
                        split_data: this.split_data
                    }
                    console.log("Data transfer finished.")
                }
            });
        }

        //EXP BAR ANIMATION FUNCTION
        var species = this.mapper.properties.player.team[0].species.value ?? this.starterString;
        if (species == 'Backport') {
            species = this.starterString;
        }
        if (this.dexData[species]==null) { return; }
        var growthRate = this.dexData[species].growth_rate
        var expStats = this.calcExpStats(growthRate, this.mapper.properties.player.team[0].expPoints.value);
        if (this.$refs.expBar) {

            this.$refs.expBar.style.width = (expStats.percent * 100) + "%";
        }
        this.prevSpecies = species

        this.mapper.properties.player.team[0].expPoints.change(async (newProp, oldProp) => {
            if (this.expBarAnimation == true) {
                if(!this.mapper.properties.player.team[0].species){
                    return;
                }
                const currSpecies = this.mapper.properties.player.team[0].species.value;
                const growthRate = this.dexData[currSpecies]?.growth_rate ?? this.dexData[this.starterString].growth_rate
                const oldExpStats = this.calcExpStats(growthRate, oldProp.value);
                const newExpStats = this.calcExpStats(growthRate, newProp.value);
                const animationMaxDuration = 650

                if (oldProp.value == newProp.value) { return }
                // did we switch out?
                // there is still a bug here. what if we changed to the same species?
                if (this.g3stateVariable == `Overworld` || this.g3stateVariable == "Base Stats") {
                    this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                    // console.log((newExpStats.percent * 100) + "%")
                }
                else if (this.prevSpecies != currSpecies) {
                    // update prevSpecies

                    this.prevSpecies = currSpecies; 
                    // dont animate, just set newExpStats.percent
                    this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                }
                // same pokemon but exp changed
                else {
                    if (oldExpStats.level == newExpStats.level) {
                        // animate width to newExpStats.percent
                        this.$refs.expBar.style.transition = 'width 200ms ease-in-out';
                        this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                        await this.sleep(250);
                    } else {
                        // animate width to 100%
                        this.$refs.expBar.style.transition = 'width 200ms ease-in';
                        this.$refs.expBar.style.width = "100%";
                        await this.sleep(250);
                        // dont animate, set width to 0%
                        this.$refs.expBar.style.transition = null;
                        this.$refs.expBar.style.width = "0%";
                        // await this.sleep(50);
                        // // animate width from 0% to newExpStats.percent
                        // this.$refs.expBar.style.transition = 'width 100ms ease-out';
                        // this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                        // await this.sleep(150);
                    }
                }
                this.$refs.expBar.style.transition = null;
            }
        })
        if(this.game.gameName== "FireRed and LeafGreen") {
            this.trashCans();
        }

        //keybinds
        keyhook.registerShortCut('F22', async () => { // Show IVs
            console.log("Key: F22 pressed: IVs displayed.")
            this.stats = "IVs";
        });
        keyhook.registerShortCut('F21', async () => { // Show EVs
            console.log("Key: F21 pressed: EVs displayed.")
            if (this.stats == "EVs") { 
                this.stats = "Detailed EVs"
                return
            };
            this.stats = "EVs";
        });
        keyhook.registerShortCut('F20', async () => { // Show Base Stats
            console.log("Key: F20 pressed. Base Stats displayed.")
            this.stats = "Base Stats";
        });
        keyhook.registerShortCut('F20', async () => { // Automatic
            console.log("Key: F20 pressed. Stats are displaying automatically now.")
            if (this.stats == "Automatic") { 
                this.stats = "Badge Boosts"
                return
            };
            this.stats = "Automatic";
        });

        keyhook.registerShortCut('F17', async () => { // Inventory
            if (this.disable_right_hotkeys) { return }
            console.log("Key: F17 pressed. Automatic battle graphics will be displayed.")
            this.right_panel = "Battle Graphic";
        });
        keyhook.registerShortCut('F18', async () => { // Trainer Graphic during Battle
            if (this.disable_right_hotkeys) { return }
            console.log("Key: F18 pressed. Inventory displayed.")
            this.right_panel = "Inventory";
        });
        keyhook.registerShortCut('F19', async () => { // Trainer Graphic during Battle
            if (this.disable_right_hotkeys) { return }
            console.log("Key: F19 pressed. Movepool displayed.")
            this.right_panel = "Movepool";
        });

        keyhook.registerShortCut('F23', async () => { // Clear Timer and Metrics
            this.newRun()
        });
        keyhook.registerShortCut('F24', async () => { // Pause
            this.timer.pauseUnpauseTime();
        });

        // Cleanup on page reload/unload to prevent emulator crashes
        window.addEventListener('beforeunload', async () => {
            // Cleanup RetroArchHook UDP socket
            if (retro) {
                retro.cleanup();
            }
            // Cleanup GameHookMapperClient SignalR connection
            if (this.mapper) {
                await this.mapper.disconnect();
            }
        });
    },
}).mount('#app')