const MyStorage = new Proxy({}, {
    set: (_, prop, value) => {
        if (value === undefined || value === null)
            localStorage.removeItem(prop);
        else
            localStorage.setItem(prop, JSON.stringify(value));
    },
    get: (_, prop) => {
        if (prop === "clear")
            return () => localStorage.clear();
        if (prop === "entries")
            return () => Object.entries(localStorage);
        if (prop === "keys")
            return () => Object.keys(localStorage);
        if (prop === "has")
            return (key) => localStorage.getItem(key) == null;
        return JSON.parse(localStorage.getItem(prop));
    }
});

// Open the folder ./splits/ in the file explorer with node.js
function openFolder(folderName) {
    require('child_process').exec(`start .\\${folderName}\\`);
}

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
        this.process.on("spawn", () => console.log("Keyboard hook started!"));
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
const path = require("path");
const { finished } = require('stream');
function logData(gameName, str, file_name, starter, log_type, testStatus, toggle) {
        return new Promise((resolve, reject) => {
        const dirPath = `./splits/${app.game.gameName}/${starter}/attempts/`;
        const testStatusText = testStatus ? "test_run_" : "";
        let filePath = path.join(dirPath, `${testStatusText}${starter}-${file_name}-simple.csv`);
        let header = "player_name" +
                    "pokemon" +
                    "trainer_name" +
                    "real_time_hmmss" +
                    "resets" +
                    "blackouts" +
                    "failures" +
                    "level" +
                    "game_time" +
                    "battle_duration" +
                    "move1" +
                    "move2" +
                    "move3" +
                    "move4,\n"
        if (log_type == "Deprecated" && toggle == true) {
            filePath = path.join(dirPath, `${testStatusText}${starter}-${file_name}-deprecated.csv`);
            header = "ROM" +
                "Species" +
                "Trainer" +
                "Start Time" +
                "Real Time" +
                "Game Time" +
                "Level" +
                "Resets" +
                "RTHours" +
                "RTMinutes" +
                "RTSeconds" +
                "RTMilliseconds" +
                "Move 1" +
                "Move 2" +
                "Move 3" +
                "Move 4" +
                "Attack" +
                "Defense" +
                "Sp. Attack" +
                "Sp. Defense" +
                "Speed" +
                "Attack Stage" +
                "Defense Stage" +
                "Sp. Attack Stage" +
                "Sp. Defense Stage" +
                "Speed Stage" +
                "Accuracy Stage" +
                "Evasion Stage" +
                "Battle Attack" +
                "Battle Defense" +
                "Battle Sp. Attack" +
                "Battle Sp. Defense" +
                "Battle Speed" +
                "Frame Count" +
                "Overworld Frame Count" +
                "Battle Frame Count" +
                "Menu Frame Count" +
                "Intro Frame Count" +
                "Save Count" +
                "Reload Count" +
                "Clock Reset Count" +
                "Steps Count" +
                "Steps Count Walk" +
                "Steps Count Bike" +
                "Steps Count Surf" +
                "Bonks" +
                "Battles" +
                "Trainer Battles" +
                "Wild Battles" +
                "Battles Fled" +
                "Failed Runs" +
                "Total Damage Dealt" +
                "Actual Damage Dealt" +
                "Total Damage Taken" +
                "Actual Damage Taken" +
                "Own Moves Hit" +
                "Own Moves Missed" +
                "Enemy Moves Hit" +
                "Enemy Moves Missed" +
                "Own Moves Super Effective" +
                "Own Moves Not Very Effective" +
                "Enemy Moves Super Effective" +
                "Enemy Moves Not Very Effective" +
                "Criticals Dealt" +
                "OHKOs Dealt" +
                "Criticals Taken" +
                "OHKOs Taken" +
                "Was Confused" +
                "Enemy Became Confused" +
                "Was Paralyzed" +
                "Enemy Was Paralyzed" +
                "Was Burned" +
                "Enemy Was Burned" +
                "Was Frozen" +
                "Enemy Was Frozen" +
                "Was Poisoned" +
                "Enemy Was Poisoned" +
                "Was Badly Poisoned" +
                "Enemy Was Badly Poisoned" +
                "Fell Asleep" +
                "Enemy Fell Asleep" +
                "Player Turns Confused" +
                "Player Turns Confused Hit Self" +
                "Player Turns Paralyzed" +
                "Player Turns Paralyzed Fully" +
                "Enemy Turns Confused" +
                "Enemy Turns Confused Hit Self" +
                "Enemy Turns Paralyzed" +
                "Enemy Turns Paralyzed Fully" +
                "Player HP Healed" +
                "Enemy HP Healed" +
                "Player Pokemon Fainted" +
                "Enemy Pokemon Fainted" +
                "Experience Gained" +
                "Switchouts" +
                "Money Made" +
                "Money Spent" +
                "Money Lost" +
                "Items Picked Up" +
                "Items Bought" +
                "Items Sold" +
                "Balls Thrown" +
                "Pokemon Caught In Balls" +
                "Moves Learnt" +
                //new properties" +
                "Blackouts" +
                "Attempt Number" +
                "Failures" +
                "Rival's Team\n"
        }
        if (log_type == "Full" && toggle == true) {
            filePath = path.join(dirPath, `${testStatusText}${starter}-${file_name}-full.csv`);
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

function logCopy(gameName, file_name, starterName, finished_run_count) {
    var dirPathAttempts = `./splits/${gameName}/${starterName}/attempts/`;
    var dirPathFinishes = `./splits/${gameName}/${starterName}/finishes/`;
    fs.mkdir(dirPathFinishes, { recursive: true }, (err) => {
        fs.copyFile(
            path.join(dirPathAttempts, `${starterName}-${file_name}-simple.csv`), 
            path.join(dirPathFinishes, `${starterName}-${finished_run_count}-simple.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.copyFile(
            path.join(dirPathAttempts, `${starterName}-${file_name}-full.csv`), 
            path.join(dirPathFinishes, `${starterName}-${finished_run_count}-full.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.copyFile(
            path.join(dirPathAttempts, `${starterName}-${file_name}-deprecated.csv`), 
            path.join(dirPathFinishes, `${starterName}-${finished_run_count}-deprecated.csv`), (err) => {
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
    data() {
        return {
            ready: false,
            mapper: null,
            scott_mode: true,
            gameVariables: null,
            // game: null,
            // POKEMON CONFIG (components) ---------------------------------------------------------------------//
            starterString: "Beedrill",
            pkmnNature: "Adamant",
            pkmn_ability: "Pressure", // false = ability 1, true = ability 2
            hidden_power_type: "Electric",
            pkmn_gender: "Female",
            gameSelection: "FireRed and LeafGreen",
            
            // USER CONFIG (components) ------------------------------------------------------------------------// 
            graphicOverlay: MyStorage['graphicOverlay'] ?? true, //places a single image as the overlay  //MVP
            frame:          MyStorage['frame']          ?? false, //shows overlay frame
            gameArea:       MyStorage['gameArea']       ?? false, //shows green box to place game in
            pokeballFloor:  MyStorage['pokeballFloor']  ?? false, //shows floor for Pokemon to stand on
            dynamicOverlay: MyStorage['dynamicOverlay'] ?? false, //dynamically picks overlay graphics based on team slot 1
            gametime:       MyStorage['gametime']       ?? false, //shows gametime
            pick:           MyStorage['pick']           ?? true,
            typeCalcs:      MyStorage['typeCalcs']      ?? true, //turns on type effectiveness calculations
            moveset:        MyStorage['moveset']        ?? true, //includes the moveset area and dynamic PP  //MVP
            dynamicPower:   MyStorage['dynamicPower']   ?? false, //dynamically calculates power based on type effectiveness
            resets:         MyStorage['resets']         ?? false, //includes the resets graphics
            stats:          MyStorage['stats']          ?? true, //includes the dynamic stats  //MVP
            movepool:       MyStorage['movepool']       ?? false, //includes the movepool graphic
            inventory:      MyStorage['inventory']      ?? false, //includes the inventory graphic when in marts
            battleStats:    MyStorage['battleStats']    ?? false, //calculates stats with stage modifiers  //MVP
            battleInfo:     MyStorage['battleInfo']     ?? false, //includes rightBar battle graphic
            conditions:     MyStorage['conditions']     ?? false, //shows status conditions as pop ups
            expBar:         MyStorage['expBar']         ?? false, //includes a dynamic exp bar
            splits:         MyStorage['splits']         ?? false, //shows splits when a major battle is complete
            tooltips:       MyStorage['tooltips']       ?? false, //displays move tooltips when a new move is learned
            btcInfo:        MyStorage['btcInfo']        ?? false, //shows behind the scenes info in the game area
            returnPower:    MyStorage['returnPower']    ?? true, //dynamically calculates the power of Return
            gamestate:      MyStorage['gamestate']      ?? true, //shows the current gamestate in the place of the timer
            labels:         MyStorage['labels']         ?? true, //shows the current gamestate in the place of the timer
            tutor_moves:    MyStorage['tutor_moves']    ?? false,
            testStatus:     MyStorage['testStatus']     ?? false,
            autosplitter_toggle:         MyStorage["autosplitter_toggle"]        ?? true,
            showSpecialTrainerGraphics:  MyStorage['showSpecialTrainerGraphics'] ?? true, 

            badges: ["badge1", "badge2", "badge3", "badge4", "badge5", "badge6", "badge7", "badge8"],
            badgeBoosts: ["badge1", "badge3", "badge5", "badge7"],
            pkmnMoves: ["move1", "move2", "move3", "move4"],

            //CSS styling values
            statLabelOpacityValue: 0, //used when a stage modifier is applied

            //DATA ---------------------------------------------------------------------------------------------//
            gen3data:                   gen3data,
            gen3moves:                  gen3moves,
            gen3abilities:              gen3abilities,
            stageModifiersData:         stageModifiersData,
            natures:                    natures,
            typeData:                   typeData,
            typeBoostingItems:          typeBoostingItems,
            dexDataRubySapphireEmerald: dexDataRubySapphireEmerald,
            emeraldTrainers:            emeraldTrainers,
            g3MoveData:                 g3MoveData,
            g3tmhmMapping:              g3tmhmMapping,
            g3hiddenPowerTypeSelector:  g3hiddenPowerTypeSelector,
            textures:                   textures,
            default_colors:             default_colors,
            hp_ivs:                     hp_ivs,
            autosplitter:               autosplitter,
            trainerLists: {
                "emeraldTrainers" : emeraldTrainers,
                "remakeTrainers" : remakeTrainers,  
            },
            genders: {
                "false": "Male",
                "true": "Female",
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
                0 : "Fighting",
                1 : "Flying",
                2 : "Poison",
                3 : "Ground",
                4 : "Rock",
                5 : "Bug",
                6 : "Ghost",
                7 : "Steel",
                8 : "Fire",
                9 : "Water",
                10 : "Grass",
                11 : "Electric",
                12 : "Psychic",
                13 : "Ice",
                14 : "Dragon",
                15 : "Dark",
            },

            //LOOPS
            pkmnSlots: [0, 1, 2, 3, 4, 5],

            //STATE MANAGEMENT ---------------------------------------------------------------------------------//
            gamestateLogging: false,
            gameStarted:  true, //tracks if the player has a save game or not
            currentGameStateNew: "",
            playerID: 999,
            g3stateVariable: "Base Stats",
            prevSpecies: undefined,
            prevExpPoints: 0,
            expDebounceTimeoutId: -1,
            expBarAnimation: true,
            slotTimingFix: false,
            showAllTrainers: true,
            enemyModColour: ["0", "background: #d84444;"],
            enemyState: "Pokemon",
            field_array: ["Reflect", 0],
            last_initiated_field_effect: "Reflect",

            //Pokemon settings for local storage
            overlay_color: MyStorage["overlay_color"] ?? "#000000",
            imageXOffset:  MyStorage["imageXOffset"] ?? 0,
            imageYOffset:  MyStorage["imageYOffset"] ?? 0,
            imageScale:    MyStorage["imageScale"] ?? 1,
            imageFlip:     MyStorage["imageFlip"] ?? false,
            imageSat:      MyStorage["imageSat"] ?? 100,
            imageRotation: MyStorage["imageRotation"] ?? 0,

            //background texture settings
            backgroundBlur:        MyStorage["backgroundBlur"] ?? 0,
            backgroundScale:       MyStorage["backgroundScale"] ?? 100,
            backgroundUrl:         MyStorage["backgroundUrl"] ?? "",
            backgroundFlip:        MyStorage["backgroundFlip"] ?? false,
            use_custom_background: MyStorage["use_custom_background"] ?? false,
            backgroundXOffset:     MyStorage["backgroundXOffset"] ?? 0,
            backgroundYOffset:     MyStorage["backgroundYOffset"] ?? 0,
            backgroundTexture:     MyStorage["backgroundTexture"] ?? 'Bug 1',
            backgroundBrightness:  MyStorage["backgroundBrightness"] ?? 100,
            backgroundContrast:    MyStorage["backgroundContrast"] ?? 100,
            backgroundSaturation:  MyStorage["backgroundSaturation"] ?? 100,

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
                "pkmnNature",
                "pkmn_ability",
                "hidden_power_type",
                "pkmn_gender",
                "finished_run_count",
            ],
            //timer variables
            timer_startTime:      MyStorage["timer_startTime"]      ?? 0,
            timer_pause:          MyStorage["timer_pause"]          ?? true,
            timer_formatted_time: MyStorage["timer_formatted_time"] ?? ["0", ".00"],
            timer_pause_time:     MyStorage["timer_pause_time"]     ?? 0,
            time_h:               MyStorage['time_h']               ?? 0,
            time_m:               MyStorage['time_m']               ?? 0,
            time_s:               MyStorage['time_s']               ?? 0,
            time_ms:              MyStorage['time_ms']              ?? 0,
            time_split_start:     MyStorage['time_split_start']     ?? "00:00:00:00",
            battle_start:         MyStorage['battle_start']         ?? 0,

            //resets
            playerId: MyStorage["playerId"] ?? 0,
            playerName: "",
            resetCatcher: "NINTEN",
            playerResets: MyStorage["playerResets"] ?? 0,
            blackout_counter: MyStorage["blackout_counter"] ?? 0,
            resetCounter: true,
            game_over: false,
            hallOfFameReset: false,
            finished_logs: false,
            pb_time: "None",
            split_logStr: "",
            attempt_number:     0,
            finished_run_count: 0,
            split_data: MyStorage["split_data"] ?? [],
            simple_data_str:     MyStorage["simple_data_str"]     ?? "",
            full_data_str:       MyStorage["full_data_str"]       ?? "",
            deprecated_data_str: MyStorage["deprecated_data_str"] ?? "",
            simple_data:         MyStorage["simple_data"]         ?? "",
            testRun:             MyStorage['testRun']             ?? false,

            //movepool starting parameters. set to -1 if not initialized
            movepoolDefaultFontSize:        -1,
            movepoolDefaultLineHeight:      -1,
            movepoolDefaultContainerHeight: -1,

            //encounters
            route_101: MyStorage['route_101'] ?? true,
            route_102: MyStorage['route_102'] ?? true,
            route_103: MyStorage['route_103'] ?? true,
            hm_102_zigzagoon: MyStorage['hm_102_zigzagoon'] ?? true,
            hm_104_marill:    MyStorage['hm_104_marill']    ?? true,
            hm_104_taillow:    MyStorage['hm_104_taillow']    ?? true,

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
                "stats",
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
                "route_101",
                "route_102",
                "route_103",
                "testRun",
                "simple_data_str",
                "full_data_str",
                "deprecated_data_str",
                "simple_data",
                "timer_startTime",
                "timer_pause",
                "timer_formatted_time",
                "timer_pause_time",
                "time_h",
                "time_m",
                "time_s",
                "time_ms",
                "time_split_start",
                "battle_start",
                "testStatus",
                "autosplitter_toggle",
            ],
        }
    },
    created() {
        import('../lib/gameVariables.js').then((gameVariables) => {
            this.gameVariables = gameVariables.default;
            
            // Bind the newGame function to the Vue component
            // this.gameVariables.newGame = this.gameVariables.newGame.bind(this);
        })
        if (MyStorage[this.starterString]) {
            this.overlay_color = MyStorage[this.starterString].overlay_color ?? this.default_colors[dexDataRubySapphireEmerald[this.starterString].type_1];
            this.imageXOffset = MyStorage[this.starterString].imageXOffset ?? 0;
            this.imageYOffset = MyStorage[this.starterString].imageYOffset ?? 0;
            this.imageScale = MyStorage[this.starterString].imageScale ?? 1;
            this.imageFlip = MyStorage[this.starterString].imageFlip ?? false;
            this.imageSat = MyStorage[this.starterString].imageSat ?? 100
            this.imageRotation = MyStorage[this.starterString].imageRotation ?? 0
            this.backgroundBlur = MyStorage[this.starterString].backgroundBlur ?? 0
            this.backgroundScale = MyStorage[this.starterString].backgroundScale ?? 100
            this.backgroundUrl = MyStorage[this.starterString].backgroundUrl ?? ""
            this.use_custom_background = MyStorage[this.starterString].use_custom_background ?? false
            this.backgroundXOffset = MyStorage[this.starterString].backgroundXOffset ?? 0
            this.backgroundYOffset = MyStorage[this.starterString].backgroundYOffset ?? 0
            this.backgroundTexture = MyStorage[this.starterString].backgroundTexture ?? `${this.dexData[this.starterString].type_1}`
            this.pkmn_ability = MyStorage[this.starterString]?.pkmn_ability ?? dexDataRubySapphireEmerald[this.starterString].abilities[0]
            this.attempt_number = MyStorage[this.starterString]?.attempt_number ?? 0
            this.finished_run_count = MyStorage[this.starterString]?.finished_run_count ?? 0
        }

        for (let i = 0; i < this.pokemon_settings.length; i++) {
            let propName = this.pokemon_settings[i];
            this.$watch(
                () => this[propName],
                (newValue) => {
                    // Ensure that MyStorage[this.starterString] is an object
                    if (!MyStorage[this.starterString]) {
                        MyStorage[this.starterString] = {};
                    }

                    // Set the new value
                    MyStorage[this.starterString] = {
                            ...MyStorage[this.starterString],
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
        

    },
    watch: {
        //*Autosplitter
        //log the start of a battle
        g3stateVariable(newProp) {
            // console.log(newProp)
            try {
                var logStr = `Autosplitter - Battle Started: ${this.batt.trainer[this.game.opponent].value} started at ${this.timer_formatted_time[0]}${this.timer_formatted_time[1]} (Gametime: ${this.gametimeSplit})`
            }
            catch {
                
            }
            var log_start = (x) => console.log(logStr)
            // console.log("checking - newprop: "+ newProp)
            // console.log("this.mapper.properties.battle.type.trainer: "+this.mapper.properties.battle.type.trainer)
            if (newProp == "Battle" && this.mapper.properties.battle.type.trainer) {
                this.split_logStr = logStr
                this.battle_start = Date.now()
                this.time_split_start = this.padTime(this.time_h) + ":" + this.padTime(this.time_m) + ":" + this.padTime(this.time_s) + "." + this.padTime(this.time_ms)
                log_start()
            }
        },
        route_101(newValue) {
            if (this.mapper.properties.overworld.mapName.value == "ROUTE 101") {
                switch (newValue) {
                    case true:
                        this.mapper.properties.overworld.disabledEncounters.set(0, false)
                        break;
                    case false:
                        this.mapper.properties.overworld.disabledEncounters.set(1, false)
                        break;
                }
            }
        },
        route_102(newValue) {
            if (this.mapper.properties.overworld.mapName.value == "ROUTE 102") {
                switch (newValue) {
                    case true:
                        this.mapper.properties.overworld.disabledEncounters.set(0, false)
                        break;
                    case false:
                        this.mapper.properties.overworld.disabledEncounters.set(1, false)
                        break;
                }
            }
        },
        route_103(newValue) {
            if (this.mapper.properties.overworld.mapName.value == "ROUTE 103") {
                switch (newValue) {
                    case true:
                        this.mapper.properties.overworld.disabledEncounters.set(0, false)
                        break;
                    case false:
                        this.mapper.properties.overworld.disabledEncounters.set(1, false)
                        break;
                }
            }
        },
        hm_102_zigzagoon(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.encounter?.zigzagoon?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.encounter?.zigzagoon?.set(true, false)
            }
            MyStorage['hm_102_zigzagoon'] = newValue
        },
        hm_104_marill(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.encounter?.marill?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.encounter?.marill?.set(true, false)
            }
            MyStorage['hm_104_marill'] = newValue
        },
        hm_104_taillow(newValue) {
            if (newValue == false) {
                this.mapper.properties.overworld.encounter?.taillow?.set(false, false)
            }
            if (newValue == true) {
                this.mapper.properties.overworld.encounter.taillow.set(true, false)
            }
            MyStorage['hm_104_taillow'] = newValue
        },
        starterString(newValue, oldValue) {
            //background texture settings
            this.overlay_color =         MyStorage[`${newValue}`]?.overlay_color ?? this.default_colors[dexDataRubySapphireEmerald[newValue].type_1]
            this.backgroundTexture =     MyStorage[`${newValue}`]?.backgroundTexture ?? `${this.dexData[newValue].type_1}`
            this.backgroundBlur =        MyStorage[`${newValue}`]?.backgroundBlur ?? 0,
            this.backgroundScale =       MyStorage[`${newValue}`]?.backgroundScale ?? 100,
            this.backgroundUrl =         MyStorage[`${newValue}`]?.backgroundUrl ?? "",
            this.backgroundFlip =        MyStorage[`${newValue}`]?.backgroundFlip ?? false,
            this.use_custom_background = MyStorage[`${newValue}`]?.use_custom_background ?? false,
            this.backgroundXOffset =     MyStorage[`${newValue}`]?.backgroundXOffset ?? 0,
            this.backgroundYOffset =     MyStorage[`${newValue}`]?.backgroundYOffset ?? 0,
            this.backgroundBrightness =  MyStorage[`${newValue}`]?.backgroundBrightness ?? 100,
            this.backgroundContrast =    MyStorage[`${newValue}`]?.backgroundContrast ?? 100,
            this.backgroundSaturation =  MyStorage[`${newValue}`]?.backgroundSaturation ?? 100,
            //Attempts and finishes
            this.attempt_number =        MyStorage[`${newValue}`]?.attempt_number ?? 0,
            this.finished_run_count =    MyStorage[`${newValue}`]?.finished_run_count ?? 0,
            //main pokemon settings
            MyStorage['starterString'] = newValue
            this.pkmnNature =            MyStorage[`${newValue}`]?.pkmnNature ?? "Hardy",
            this.pkmn_ability =          MyStorage[`${newValue}`]?.pkmn_ability ?? dexDataRubySapphireEmerald[newValue].abilities[0],
            this.hidden_power_type =     MyStorage[`${newValue}`]?.hidden_power_type ?? "Dark",
            this.pkmn_gender =           MyStorage[`${newValue}`]?.pkmn_gender ?? "Female"
            this.movepoolResize();
        },
        playerId(newValue) {
            MyStorage["playerId"] = newValue
            this.game_over = false;
            MyStorage["playerResets"] = 0
            this.playerResets = 0;
            this.finished_logs == false;
            MyStorage["blackout_counter"] = 0
            this.blackout_counter = 0;
        },    
        overlay_color(newColor) {
            document.documentElement.style.setProperty('--overlay-color', newColor);
        }, 
        playerResets(newProp) {
            if (newProp.toString().length == 1) {
                document.getElementById("reset_counter").style.fontSize = "68px"
            }
            if (newProp.toString().length == 3) {
                document.getElementById("reset_counter").style.fontSize = "54px"
            }
            if (newProp.toString().length == 4) {
                document.getElementById("reset_counter").style.fontSize = "40px"
            }
            
            if (this.playerResets < 0) {
                this.playerResets = 0;
            }
            // this.blackout == false
            MyStorage["playerResets"] = this.playerResets
        },
        blackout_counter(newProp) {
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
        }
    },
    computed: {
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
            // if(this.g3stateVariable=="Battle") {
            //     let ability = this.pascalCaseSpace(this.mapper.properties.battle.yourPokemon.ability?.value.toLowerCase());
            //     if(ability=="Natural Care") {
            //         return "Natural Cure"; //typo in mapper
            //     }
            //     return ability;
            // }
            // else {

                return this.pkmn_ability;
            // }
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
            if (this.g3stateVariable == `Battle`) {
                return this.mapper?.properties?.battle?.yourPokemon
            }
            else {
                return this.mapper?.properties?.player?.team[0]
            }
        },
        s1dynamicReset() {
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
            if (this.zigzagoon_check == `Base Stats`) { return this.dexData[this.starterString]?.type_2}
            if (this.g3stateVariable == `Battle`) { return this.mapper.properties.battle.yourPokemon.type2.value }
            if (this.g3stateVariable == `Overworld` && this.mapper.properties.player.team[0].species.value == null) { return this.dexData[this.starterString]?.type_2 }
            if (this.g3stateVariable == `Overworld`) { return this.dexData[this.mapper.properties.player.team[0].species.value]?.type_2 }
            if (this.g3stateVariable == `Base Stats`) { return this.dexData[this.starterString]?.type_2}
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
            // console.log("game")
            // console.log(this.mapper)
            // console.log(this.mapper.meta.gameName)
            return this.gameVariables[this.gameSelection];
            // return this.gameVariables[this.mapper?.properties?.meta?.gameName];
        // return "FireRed and LeafGreen";
            // return(this.mapper?.properties.meta.gameName);
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
        }
    },

    methods: { 
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
            this.imageXOffset = MyStorage[pokemon_species]?.imageXOffset ?? 0
            this.imageYOffset = MyStorage[pokemon_species]?.imageYOffset ?? 0
            this.imageScale = MyStorage[pokemon_species]?.imageScale ?? 1
            this.imageFlip = MyStorage[pokemon_species]?.imageFlip ?? false
            this.imageSat = MyStorage[pokemon_species]?.imageSat ?? 100
            this.backgroundBlur = MyStorage[pokemon_species]?.backgroundBlur ?? 0
            this.backgroundScale = MyStorage[pokemon_species]?.backgroundScale ?? 100
            this.backgroundUrl = MyStorage[pokemon_species]?.backgroundUrl ?? false
        },
        keys_function(object) {
            return Object.keys(object)
        },
        values_function(object) {
            return Object.values(object)
        },
        //*timer methods
        //start the timer
        startTime() {
            this.timer_startTime = Date.now()
            this.timer_pause = false
            this.updateTime()
        },
        //stop the timer
        stopTime() {
            this.timer_pause_time = Date.now()
            this.timer_pause = true
        },
        padTime(time) {
            return time.toString().padStart(2, "0")
        },
        //animate the timer
        updateTime() {
            var time = Date.now() - this.timer_startTime
            if (this.timer_pause == true) {
                time = this.timer_pause_time - this.timer_startTime
            }
            var f = (x) => x.toString().padStart(2, "0")
            var c = (Math.floor(time / 10) % 100)
            var s = (Math.floor(time / 1000) % 60)
            var m = (Math.floor(time / 60000) % 60)
            var h = (Math.floor(time / 3600000))
            this.time_h = h
            this.time_m = m
            this.time_s = s
            this.time_ms = c
            if (h != 0) {
                this.timer_formatted_time = [ h + ":" + f(m) + ":" + f(s), "." + f(c), h + "h" + m + "m" + s + "s", ]
            }
            else if (m != 0) {
                this.timer_formatted_time = [ m + ":" + f(s), "." + f(c), h + "h" + m + "m" + s + "s", ]
            }
            else {
                this.timer_formatted_time = [ s, "." + f(c), h + "h" + m + "m" + s + "s", ]
            }
            if (this.timer_pause == false) {
                requestAnimationFrame(this.updateTime)
            }
        },
        //pause the timer
        pauseUnpauseTime() {
            if (this.timer_pause == true) {
                this.timer_pause = false
                this.timer_startTime += Date.now() - this.timer_pause_time
                this.updateTime()
                retro.resume()
            }
            else {
                this.timer_pause = true
                this.timer_pause_time = Date.now()
                retro.pause()
            }
        },
        // resetTime() {
        //     this.timer_pause = true
        //     this.timer_startTime = 0
        //     this.timer_pause_time = 0
        //     this.timer_formatted_time = [ "0", ".00" ]
        // },
        newRun() {
            this.timer_pause = true
            this.timer_startTime = 0
            this.timer_pause_time = 0
            this.timer_formatted_time = [ "0", ".00" ]
            this.playerResets = 0
            this.finished_logs = false
            this.finished_run_count = 0
            this.blackout_counter = 0
            this.playerId = 0
            // this.playerName = "NINTEN"
        },
        load_all_settings() {
            this.starterString = MyStorage["starterString"] ?? "Rayquaza"

            this.graphicOverlay =             MyStorage['graphicOverlay']             ?? true
            this.frame =                      MyStorage['frame']                      ?? false
            this.gameArea =                   MyStorage['gameArea']                   ?? false
            this.pokeballFloor =              MyStorage['pokeballFloor']              ?? false
            this.dynamicOverlay =             MyStorage['dynamicOverlay']             ?? false
            this.gametime =                   MyStorage['gametime']                   ?? false
            this.pick =                       MyStorage['pick']                       ?? true
            this.typeCalcs =                  MyStorage['typeCalcs']                  ?? true
            this.moveset =                    MyStorage['moveset']                    ?? true
            this.dynamicPower =               MyStorage['dynamicPower']               ?? false
            this.resets =                     MyStorage['resets']                     ?? false
            this.stats =                      MyStorage['stats']                      ?? true
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
            this.testRun =                    MyStorage['testRun']                    ?? false
            this.simple_data_str =            MyStorage['simple_data_str']            ?? ""
            this.full_data_str =              MyStorage['full_data_str']              ?? ""
            this.deprecated_data_str =        MyStorage['deprecated_data_str']        ?? ""
            this.simple_data =                MyStorage['simple_data']                ?? ""
            this.timer_startTime =            MyStorage['timer_startTime']            ?? 0
            this.timer_pause =                MyStorage['timer_pause']                ?? true
            this.timer_formatted_time =       MyStorage['timer_formatted_time']       ?? ["0", ".00"]
            this.timer_pause_time =           MyStorage['timer_pause_time']           ?? 0
            this.time_h =                     MyStorage['time_h']                     ?? 0
            this.time_m =                     MyStorage['time_m']                     ?? 0
            this.time_s =                     MyStorage['time_s']                     ?? 0
            this.time_ms =                    MyStorage['time_ms']                    ?? 0
            this.time_split_start =           MyStorage['time_split_start']           ?? "00:00:00:00"
            this.battle_start =               MyStorage['battle_start']               ?? 0

            //Pokemon settings for local storage
            this.overlay_color = MyStorage[this.starterString]?.overlay_color ?? this.default_colors[`${dexDataRubySapphireEmerald[this.starterString].type_1}`]
            this.imageXOffset =  MyStorage[this.starterString]?.imageXOffset ?? 0
            this.imageYOffset =  MyStorage[this.starterString]?.imageYOffset ?? 0
            this.imageScale =    MyStorage[this.starterString]?.imageScale ?? 1
            this.imageFlip =     MyStorage[this.starterString]?.imageFlip ?? false
            this.imageSat =      MyStorage[this.starterString]?.imageSat ?? 100
            this.imageRotation = MyStorage[this.starterString]?.imageRotation ?? 0

            //background texture settings
            this.backgroundBlur =        MyStorage[this.starterString]?.backgroundBlur ?? 0
            this.backgroundScale =       MyStorage[this.starterString]?.backgroundScale ?? 100
            this.backgroundUrl =         MyStorage[this.starterString]?.backgroundUrl ?? ""
            this.backgroundFlip =        MyStorage[this.starterString]?.backgroundFlip ?? false
            this.use_custom_background = MyStorage[this.starterString]?.use_custom_background ?? false
            this.backgroundXOffset =     MyStorage[this.starterString]?.backgroundXOffset ?? 0
            this.backgroundYOffset =     MyStorage[this.starterString]?.backgroundYOffset ?? 0
            this.backgroundTexture =     MyStorage[this.starterString]?.backgroundTexture ?? `${this.dexData[this.starterString].type_1}`
            this.backgroundBrightness =  MyStorage[this.starterString]?.backgroundBrightness ?? 100
            this.backgroundContrast =    MyStorage[this.starterString]?.backgroundContrast ?? 100
            this.backgroundSaturation =  MyStorage[this.starterString]?.backgroundSaturation ?? 100
        },
        reset() {
            this.backgroundBlur =        0,
            this.backgroundScale =       100,
            this.backgroundUrl =         "",
            this.use_custom_background = false,
            this.backgroundXOffset =     0,
            this.backgroundYOffset =     0,
            this.backgroundTexture =     this.dexData[this.starterString]?.type_1?.toLowerCase(),
            this.backgroundBrightness =  100,
            this.backgroundContrast =    100,
            this.backgroundSaturation =  100
        },
        resetPokemon() {
            this.imageXOffset =  0
            this.imageYOffset =  0
            this.imageScale =    1
            this.imageFlip =     false
            this.imageSat =      100
            this.imageRotation = 0
        },
        increment(property) {
            this[property]++;
        },
        decrement(property) {
            if (this[property] == 0) {
                return 0
            }
            this[property]--;
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
            MyStorage[this.starterString] = {
                ...MyStorage[this.starterString],
                [property_name]: value,
            }
        },
        move_name(move_string) { //converts move strings so that they are formatted correctly
            if (move_string != undefined) {
                if (move_string.toLowerCase() == "vicegrip")     { return "ViceGrip" }
                if (move_string.toLowerCase() == "vice grip")     { return "ViceGrip" }
                if (move_string.toLowerCase() == "doubleslap")   { return "DoubleSlap" }
                if (move_string.toLowerCase() == "double slap")   { return "DoubleSlap" }
                if (move_string.toLowerCase() == "double-edge")  { return "Double-Edge" }
                if (move_string.toLowerCase() == "double edge")  { return "Double-Edge" }
                if (move_string.toLowerCase() == "solarbeam")    { return "SolarBeam" }
                if (move_string.toLowerCase() == "extremespeed") { return "ExtremeSpeed" }
                if (move_string.toLowerCase() == "extreme speed") { return "ExtremeSpeed" }
                if (move_string.toLowerCase() == "dynamicpunch") { return "DynamicPunch" }
                if (move_string.toLowerCase() == "thunderpunch") { return "ThunderPunch" }
                if (move_string.toLowerCase() == "bubblebeam")   { return "BubbleBeam" }
                if (move_string.toLowerCase() == "grasswhistle") { return "GrassWhistle" }
                if (move_string.toLowerCase() == "grass whistle") { return "GrassWhistle" }
                if (move_string.toLowerCase() == "softboiled")   { return "Softboiled" }
                if (move_string.toLowerCase() == "soft boiled")   { return "Softboiled" }
                if (move_string.toLowerCase() == "sand-attack")  { return "Sand-Attack" }
                if (move_string.toLowerCase() == "mud-slap")     { return "Mud-Slap" }
                if (move_string.toLowerCase() == "featherdance") { return "FeatherDance" }
                if (move_string.toLowerCase() == "poisonpowder") { return "PoisonPowder" }
                if (move_string.toLowerCase() == "dragonbreath") { return "DragonBreath" }
                if (move_string.toLowerCase() == "ancientpower") { return "AncientPower" }
                if (move_string.toLowerCase() == "smellingsalt") { return "SmellingSalt" }
                if (move_string.toLowerCase() == "selfdestruct") { return "Selfdestruct" }
                if (move_string.toLowerCase() == "smokescreen")  { return "SmokeScreen" }
                if (move_string.toLowerCase() == "sonicboom")    { return "SonicBoom" }
                if (move_string.toLowerCase() == "lock on")    { return "Lock-on" }
                if (move_string.toLowerCase() == "lock-on")    { return "Lock-on" }
                if (move_string.toLowerCase() == "will o wisp")  { return "Will-O-Wisp" }


                else { return move_string }
            }
            else { return move_string }
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
        formatDuration(x) {
            if (x.startsWith("00:")) {
                x = x.substring(3)
            }
            if (x.startsWith(0)) {
                x = x.substring(1)
            }
            x = x.substring(0, x.length-4)
            return x
        },
        split(splitName, splits) {
            console.log(splits)
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
            let obj = {
                level: pkmn.levelup_moveset.map(x => {
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
            //********The next few lines were dynamic to support different css sizes */
            //********This is useful if you want to reuse the code in other overlays */
            //********However it had bugs with resizing after battles, so I'm commenting it for now */
            // var moveElement = document.querySelector('.movepoolDemo');
            // if (!moveElement) {
            //     console.log("nope")
            //     return;
            // }
            //store the default sizes so we can access them after overwriting them
            //var computedStyle = window.getComputedStyle(moveElement);
            //if(this.movepoolDefaultFontSize==-1) {
                this.movepoolDefaultFontSize = 15;//parseInt(computedStyle.getPropertyValue('font-size'),10);
                this.movepoolDefaultLineHeight = 18;//parseInt(computedStyle.getPropertyValue('line-height'),10);
                this.movepoolDefaultContainerHeight = 1001-(this.movepoolDefaultLineHeight+0);// parseInt(computedStyle.getPropertyValue('height'),10)-this.movepoolDefaultLineHeight+1;
            //}
            //calculate new sizes
            let currentStarter = this.s1dynamicReset.name;
            if(currentStarter == undefined || currentStarter == null) {
                if(this.mapper.properties.player.team[0].species) {
                    currentStarter = this.mapper.properties.player.team[0].species.value;
                }
                else {
                    currentStarter = this.starterString;
                }
            }
            let movepoolSize = this.dexData[currentStarter].tm_hm_learnset.length + this.dexData[currentStarter].levelup_moveset.length;
            if (this.tutor_moves) {
                movepoolSize = movepoolSize + this.dexData[currentStarter].tutor_learnset.length;
            }
            let maxSize = this.movepoolDefaultContainerHeight / this.movepoolDefaultLineHeight;
            let correctedLineHeight = this.movepoolDefaultContainerHeight / movepoolSize;
            let correctedFontSize = this.movepoolDefaultFontSize * Math.sqrt(correctedLineHeight / this.movepoolDefaultLineHeight);
            if(movepoolSize > (maxSize)){
                return "line-height: " + correctedLineHeight + "px; font-size: "+correctedFontSize+"px;";
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
            var stageModsAcc = this.stageModifiersData.find(x => x.modType === "accuracy")
            var stageModsEva = this.stageModifiersData.find(x => x.modType === "evasion")
            var currentModStageAcc = this.batt.yourPokemon.modStageAccuracy.value
            var currentModStageEva = this.batt.enemyPokemon.modStageEvasion.value
            var abilityMod = 1
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
                var accuracy = moveAccuracy * abilityMod
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
        enemyPkmnText(pkmnData) {
            if (this.g3stateVariable != `Battle` && this.g3stateVariable != `From Battle`) { return "opacity: 1" }
            if (pkmnData.hp == 0 || this.g3stateVariable == `From Battle`) {
                return "opacity: .3"
            }
            else {
                return "opacity: 1"
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
            if (pkmnData.status1.value == "Burned" && statLabel == "attack")   { status_burn = .25 }      // sets modifier for burn if the Pokemon is burned

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
                console.log("Gamestate: "+"("+number+") "+state)
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


        //BADGE BOOSTS
        bbAttack(x) {
            if (this.mapper.properties.player.badges.badge1.value == true) {
                statValue = Math.floor(x * 1.1)
                if (statValue > 999) {
                    return 999
                }
                else {
                    return statValue
                }
            }
            else
                return x
        },
        bbSpeed(x) {
            if (this.mapper.properties.player.badges.badge3.value == true) {
                statValue = Math.floor(x * 1.1)
                if (statValue > 999) {
                    return 999
                }
                else {
                    return statValue
                }
            }
            else
                return x
        },
        bbDefense(x) {
            if (this.mapper.properties.player.badges.badge5.value == true) {
                statValue = Math.floor(x * 1.1)
                if (statValue > 999) {
                    return 999
                }
                else {
                    return statValue
                }
            }
            else
                return x
        },
        bbSpecialAttack(x) {
            if (this.mapper.properties.player.badges.badge7.value == true) {
                statValue = Math.floor(x * 1.1)
                if (statValue > 999) {
                    return 999
                }
                else {
                    return statValue
                }
            }
            else
                return x
        },
        bbSpecialDefense(x) {
            if (this.mapper.properties.player.badges.badge7.value == true) {
                statValue = Math.floor(x * 1.1)
                if (statValue > 999) {
                    return 999
                }
                else {
                    return statValue
                }
            }
            else
                return x
        },

        //REMOVES CAPITALIZATION (TACKLE -> Tackle) OR (Tail Whip -> Tail whip)
        camelCase: function (str) {
            if (!str || !str.toString()) { return '' }
            return str.toString().replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                return index == 0 ? word.toUpperCase() : word.toLowerCase();
            })
        },
        pascalCaseSpace(str) {
            let words = str.split(' ');
            for (let char of words) {
                words[words.indexOf(char)] = char.charAt(0).toUpperCase() + char.slice(1);
            }
            return words.join(' ');
        },
        pascalCaseDot(str) {
            let words = str.split('.');
            for (let char of words) {
                words[words.indexOf(char)] = char.charAt(0).toUpperCase() + char.slice(1);
            }
            return words.join(' ');
        },
        titleCaseNoUnderscores(str) { //VIRIDIAN_FOREST -> Viridian Forest
            let formattedStr = str.replace(/_/g, ' ');
            return formattedStr.charAt(0).toUpperCase() + formattedStr.substr(1).toLowerCase();
        },
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
            if (this.pick == true)
                var type = this.dexData[this.starterString].type_1
                return `images/elements/types/${type}.png`.toLowerCase();
        },
        getStarterType2() {
            if (this.pick == true)
                var type = this.dexData[this.starterString].type_2
                return `images/elements/types/${type}.png`.toLowerCase();
        },
        
        //GAMETIME
        gameTimeHM(h, m) {
            if (m < 10) m = "0" + m.toString();
            return `${h}:`+m;
        },
        gameTimeM(m) {
            if (m < 10) 
                m = "0" + m.toString();
            return m
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
        
        //GAMETIME FUNCTIONS
        gameTimeHM(h, m) {
            if (h <= 0) return m;
            if (m < 10) 
                m = "0" + m.toString();
            return `${h}:${m}`;
        },
        gameTimeHMS(h, m) {
            if (h <= 0) {
                if (m <= 0) return `${s}`;
                if (s < 10) s = "0" + s.toString();
                return `${m}:${s}`;
            }
            if (s < 10) s = "0" + s.toString();
            if (m < 10) m = "0" + m.toString();
            return `${h}:${m}:${s}`;
        },
        leadZero(y) {
            if (y < 10) return "0" + y.toString();
            return y;
        },
        
        //INVENTORY FUNCTIONS
        itemCheck(y) {
            if (y == "--End of list--") return " ";
            return y;
        },
        ifZero(y) {
            if (y != 0) return y;
            return " ";
        },
        nullToNone(y) {
            if (y == 0) 
                return "None"
            return y
        },
        nullToSpace(y) {
            if (y == 0) 
                return " "
            return y
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
        expPercent(x) {
            return this.expPercentMediumFast(x)
        },
        calcExpStats(growthRate, exp) {
            const expTable = {
                "GROWTH_ERRATIC":     [0,15,52,122,237,406,637,942,1326,1800,2369,3041,3822,4719,5737,6881,8155,9564,11111,12800,14632,16610,18737,21012,23437,26012,28737,31610,34632,37800,41111,44564,48155,51881,55737,59719,63822,68041,72369,76800,81326,85942,90637,95406,100237,105122,110052,115015,120001,125000,131324,137795,144410,151165,158056,165079,172229,179503,186894,194400,202013,209728,217540,225443,233431,241496,249633,257834,267406,276458,286328,296358,305767,316074,326531,336255,346965,357812,367807,378880,390077,400293,411686,423190,433572,445239,457001,467489,479378,491346,501878,513934,526049,536557,548720,560922,571333,583539,591882,600000],
                "GROWTH_FAST":        [0,6,21,51,100,172,274,409,583,800,1064,1382,1757,2195,2700,3276,3930,4665,5487,6400,7408,8518,9733,11059,12500,14060,15746,17561,19511,21600,23832,26214,28749,31443,34300,37324,40522,43897,47455,51200,55136,59270,63605,68147,72900,77868,83058,88473,94119,100000,106120,112486,119101,125971,133100,140492,148154,156089,164303,172800,181584,190662,200037,209715,219700,229996,240610,251545,262807,274400,286328,298598,311213,324179,337500,351180,365226,379641,394431,409600,425152,441094,457429,474163,491300,508844,526802,545177,563975,583200,602856,622950,643485,664467,685900,707788,730138,752953,776239,800000],
                "GROWTH_MEDIUM_FAST": [0,8,27,64,125,216,343,512,729,1000,1331,1728,2197,2744,3375,4096,4913,5832,6859,8000,9261,10648,12167,13824,15625,17576,19683,21952,24389,27000,29791,32768,35937,39304,42875,46656,50653,54872,59319,64000,68921,74088,79507,85184,91125,97336,103823,110592,117649,125000,132651,140608,148877,157464,166375,175616,185193,195112,205379,216000,226981,238328,250047,262144,274625,287496,300763,314432,328509,343000,357911,373248,389017,405224,421875,438976,456533,474552,493039,512000,531441,551368,571787,592704,614125,636056,658503,681472,704969,729000,753571,778688,804357,830584,857375,884736,912673,941192,970299,1000000],
                "GROWTH_MEDIUM_SLOW": [0,9,57,96,135,179,236,314,419,560,742,973,1261,1612,2035,2535,3120,3798,4575,5460,6458,7577,8825,10208,11735,13411,15244,17242,19411,21760,24294,27021,29949,33084,36435,40007,43808,47846,52127,56660,61450,66505,71833,77440,83335,89523,96012,102810,109923,117360,125126,133229,141677,150476,159635,169159,179056,189334,199999,211060,222522,234393,246681,259392,272535,286115,300140,314618,329555,344960,360838,377197,394045,411388,429235,447591,466464,485862,505791,526260,547274,568841,590969,613664,636935,660787,685228,710266,735907,762160,789030,816525,844653,873420,902835,932903,963632,995030,1027103,1059860],
                "GROWTH_SLOW":        [0,10,33,80,156,270,428,640,911,1250,1663,2160,2746,3430,4218,5120,6141,7290,8573,10000,11576,13310,15208,17280,19531,21970,24603,27440,30486,33750,37238,40960,44921,49130,53593,58320,63316,68590,74148,80000,86151,92610,99383,106480,113906,121670,129778,138240,147061,156250,165813,175760,186096,196830,207968,219520,231491,243890,256723,270000,283726,297910,312558,327680,343281,359370,375953,393040,410636,428750,447388,466560,486271,506530,527343,548720,570666,593190,616298,640000,664301,689210,714733,740880,767656,795070,823128,851840,881211,911250,941963,973360,1005446,1038230,1071718,1105920,1140841,1176490,1212873,1250000],
                "GROWTH_FLUCTUATING": [0,4,13,32,65,112,178,276,393,540,745,967,1230,1591,1957,2457,3046,3732,4526,5440,6482,7666,9003,10506,12187,14060,16140,18439,20974,23760,26811,30146,33780,37731,42017,46656,50653,55969,60505,66560,71677,78533,84277,91998,98415,107069,114205,123863,131766,142500,151222,163105,172697,185807,196322,210739,222231,238036,250562,267840,281456,300293,315059,335544,351520,373744,390991,415050,433631,459620,479600,507617,529063,559209,582187,614566,639146,673863,700115,737280,765275,804997,834809,877201,908905,954084,987754,1035837,1071552,1122660,1160499,1214753,1254796,1312322,1354652,1415577,1460276,1524731,1571884,1640000]
            };

            // makes searching a bit easiser
            expTable["GROWTH_ERRATIC"][100]     = expTable["GROWTH_ERRATIC"][99] + 1;
            expTable["GROWTH_FAST"][100]        = expTable["GROWTH_FAST"][99] + 1;
            expTable["GROWTH_MEDIUM_FAST"][100] = expTable["GROWTH_MEDIUM_FAST"][99] + 1;
            expTable["GROWTH_MEDIUM_SLOW"][100] = expTable["GROWTH_MEDIUM_SLOW"][99] + 1;
            expTable["GROWTH_SLOW"][100]        = expTable["GROWTH_SLOW"][99] + 1;
            expTable["GROWTH_FLUCTUATING"][100] = expTable["GROWTH_FLUCTUATING"][99] + 1;
        
            const index = expTable[growthRate].findIndex(x => x > exp);
            const currLvlExp = expTable[growthRate][index - 1];
            const nextLvlExp = expTable[growthRate][index];
            return {
                level: index,
                percent: (exp - currLvlExp) / (nextLvlExp - currLvlExp),
            };
        }, 
        expPercentFast(x) {
            expBar = ((x.expPoints.value) - ((4 * (Math.pow(x.level.value, 3))) / 5)) / (((4 * (Math.pow(x.level.value + 1, 3))) / 5) - ((4 * (Math.pow(x.level.value, 3))) / 5)) // errors could lurk here
            if (expBar > 1)
                return 100
            else if (expBar < 0)
                return 0
            else
                return expBar * 100
        },
        expPercentMediumFast(x) {
            expBar = (((x.expPoints.value) - (Math.pow(x.level.value, 3))) / ((Math.pow(x.level.value + 1, 3)) - (Math.pow(x.level.value, 3))))
            if (expBar > 1)
                return 100
            else if (expBar < 0)
                return 0
            else
                return expBar * 100
        },
        expPercentMediumSlow(x) { //this formula may be incorrect
            expBar = (((x.expPoints.value) - (((6 / 5) * (Math.pow(x, 3))) - (15 * (Math.pow(x, 2))) + (100 * x) - 140)) / ((((6 / 5) * (Math.pow(x.level.value + 1, 3))) - (15 * (Math.pow(x.level.value, 2))) + (100 * (x.level.value + 1)) - 140) - (Math.pow(x.level.value, 3)))) // errors could lurk here
            if (expBar > 1)
                return 100
            else if (expBar < 0)
                return 0
            else
                return expBar * 100
        },
        expPercentSlow(x) {
            expBar = (((x.expPoints.value) - (Math.floor((5 * (Math.pow(x.level.value, 3))) / 4))) / ((Math.floor((5 * (Math.pow(x.level.value + 1, 3))) / 4)) - (Math.floor((5 * (Math.pow(x.level.value, 3))) / 4)))) // errors could lurk here
            if (expBar > 100)
                return 100
            else if (expBar < 0)
                return 0
            else
                return expBar * 100
        },
        
        // MOVE MANAGEMENT
        movePower(y) { //y = move1.value
            if (y) { y = y.toUpperCase() }
            if (y) {
                var move = this.gen3moves.find(x => x.Move.toLowerCase() === this.move_name(y).toLowerCase())
                if (y == "RETURN") {
                    if (this.mapper.properties.player.team[0].friendship.value < 2.5)
                        var friendshipValue = 2.5 
                    else 
                        var friendshipValue = this.mapper.properties.player.team[0].friendship.value
                    var specialMovePower = Math.floor(friendshipValue/2.5)
                    return specialMovePower
                }
                else if (y == "FLAIL" || y == "REVERSAL") {
                    var hpPercentage = this.mapper.properties.player.team[0].hp.value / this.mapper.properties.player.team[0].maxHp.value
                    if (hpPercentage >= .6875) { return 20 }
                    else if (hpPercentage >= .3542 && hpPercentage < .6875) { return 40 }
                    else if (hpPercentage >= .2083 && hpPercentage < .3542) { return 80 }
                    else if (hpPercentage >= .1042 && hpPercentage < .2083) { return 100 }
                    else if (hpPercentage >= .0417 && hpPercentage < .1042) { return 150 }
                    else if (hpPercentage < .0417) { return 200 }
                }
                else if (y == "WATER SPOUT" || y == "ERUPTION") {
                    var power = (150 * this.mapper.properties.player.team[0].hp.value) / this.mapper.properties.player.team[0].maxHp.value
                    if (power < 1) {
                        return 1
                    }
                    return Math.floor(power)
                }
                else if (y == "FRUSTRATION") {
                    if (this.mapper.properties.player.team[0].friendship.value > 252.5)
                        var friendshipValue = 252.5 
                    else 
                        var friendshipValue = this.mapper.properties.player.team[0].friendship.value
                    var specialMovePower = Math.floor((255-friendshipValue)/2.5)
                    return specialMovePower
                }
                else if (y == "LOW KICK") {
                    if (this.dexData[this.batt.enemyPokemon.species.value]?.weight < 10) { return 20 }
                    if (this.dexData[this.batt.enemyPokemon.species.value]?.weight < 25) { return 40 }
                    if (this.dexData[this.batt.enemyPokemon.species.value]?.weight < 50) { return 60 }
                    if (this.dexData[this.batt.enemyPokemon.species.value]?.weight < 100) { return 80 }
                    if (this.dexData[this.batt.enemyPokemon.species.value]?.weight < 200) { return 100 }
                    if (this.dexData[this.batt.enemyPokemon.species.value]?.weight >= 200) { return 120 }
                }
                else if (y.toUpperCase() == "HIDDEN POWER") {
                    return this.hiddenPowerPowerCalc(this.mapper.properties.player.team[0])
                }
                else if (y == "FACADE" && (this.s1.statusCondition.value == "Paralyzed" || this.s1.statusCondition.value == "Poisoned" || this.s1.statusCondition.value == "Burned")) {
                    return move.Power * 2
                }
                else
                    if (move) return move.Power
            }
            return null
        },
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
        g3ReturnPowerCalc(slotNumber) {
            if (slotNumber.friendship.value < 2.5) { var friendshipValue = 2.5 }
            else { var friendshipValue = slotNumber.friendship.value }
            var specialMovePower = Math.floor(friendshipValue/2.5)
            return specialMovePower
        },
        g3FrustrationPowerCalc(slotNumber) {
            var friendshipValue = slotNumber.friendship.value
            var specialMovePower = Math.floor((255 - friendshipValue)/2.5)
            if (specialMovePower == 0) {
                specialMovePower = 1
            }
            return specialMovePower
        },
        weatherModifier(weather, move, moveType) {
            if(this.weatherDenial) {
                return 1;
            }
            if (weather == "Sun" && moveType == "Water") {
                return .5
            }
            else if (weather == "Sun" && moveType == "Fire") {
                return 1.5
            }
            else if (weather == "Rain" && moveType == "Water") {
                return 1.5
            }
            else if (weather == "Rain" && moveType == "Fire") {
                return .5
            }
            else if (weather == "Rain" && move == "SOLARBEAM") {
                return .5
            }
            else if (weather == "Sandstorm") {
                return 1
            }
            else {
                return 1
            }
        },
        moveType(y) { //y = move1.value
            if (y.toUpperCase() == "HIDDEN POWER") {
                var move = this.hiddenPowerTypeCalc(this.mapper.properties.player.team[0])
                return move
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

        //y = mod stage, x = stat value
        stageMultiplier(y,x) { 
            // if (this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && y != 0 && y != null && y != undefined && this.mapper.properties.battle.yourPokemon.species != null) {
            if (this.g3stateVariable == "Battle") {
                var multiplier = this.stageModifiersData.find(x => x.modType === "stat")
                var statValue = Math.floor(x * multiplier[y.toString()])
                if (statValue > 999) {
                    return 999
                }
                else
                    return statValue
            }
            else
                return x
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
        hiddenPowerTypeCalc(x) { //x = slot number
            ivHpBit = x.ivHp % 2
            ivAtkBit = x.ivAttack % 2
            ivDefBit = x.ivDefense % 2
            ivSpdBit = x.ivSpeed % 2
            ivSpcABit = x.ivSpecialAttack % 2
            ivSpcDBit = x.ivSpecialDefense % 2
            type = this.hiddenPowerTypes[(Math.floor(((ivHpBit + (2 * ivAtkBit) + (4 * ivDefBit) + (8 * ivSpdBit) + (16 * ivSpcABit) + (32 * ivSpcDBit)) * 5)/21))]
            return type
        },
        hiddenPowerPowerCalc(x) { //x = slot number
            if (this.mapper.properties.player.teamCount.value == 0) { return 70 }
            ivHpBit = ((x.ivHp & 2) >> 1)
            ivAtkBit = ((x.ivAttack & 2) >> 1)
            ivDefBit = ((x.ivDefense & 2) >> 1)
            ivSpdBit = ((x.ivSpeed & 2) >> 1)
            ivSpcABit = ((x.ivSpecialAttack & 2) >> 1)
            ivSpcDBit = ((x.ivSpecialDefense & 2) >> 1)
            return Math.floor((((ivHpBit + (2 * ivAtkBit) + (4 * ivDefBit) + (8 * ivSpdBit) + (16 * ivSpcABit) + (32 * ivSpcDBit)) * 40)/63) + 30 )
        },
        determineSTAB(x) { //x = move1.value
            // var pkmnType1 = this.mapper.properties.battle.yourPokemon.type1.value
            // var pkmnType2 = this.mapper.properties.battle.yourPokemon.type2.value
            var pkmnType1 = this.dexData[this.starterString].type_1
            var pkmnType2 = this.dexData[this.starterString].type_2
            if (pkmnType1 == this.moveType(x) || pkmnType2 == this.moveType(x)) {
                return 1.5
            }
            else { 
                return 1 
            }
        }, 
        determineItemBoost(x) { //x - move1.value
            var heldItemValue = this.mapper.properties.player.team[0].itemHeld.value
            var itemType = this.typeBoostingItems[heldItemValue]
            if (itemType == this.moveType(x)) {
                return 1.1
            }
            else   
                return 1
        },
        abilityModifier(ability, attackingType) {
            var healthPercentage = this.s1.hp.value / this.s1.maxHp.value
            if (healthPercentage <= .3) {
                if (ability == `Torrent` && attackingType == `Water`) {
                    return 1.5
                }
                else if (ability == `Blaze` && attackingType == `Fire`) {
                    return 1.5
                }
                else if (ability == `Overgrow` && attackingType == `Grass`) {
                    return 1.5
                }
                else if (ability == `Swarm` && attackingType == `Bug`) {
                    return 1.5
                }
                else {
                    return 1
                }
            }
            else {
                return 1
            }
        },
        burnModifier(x) {
            var attackingType = this.moveType(x)
            if (this.s1.statusCondition.value == `Burned` && this.pkmn_ability != `Guts`) {
                if (attackingType == "Ground" || attackingType == "Rock" || attackingType == "Fighting" || attackingType == "Bug" || attackingType == "Ghost" ||
                attackingType == "Normal" || attackingType == "Steel" || attackingType == "Flying" || attackingType == "Poison") {
                    return 0.5
                }
                else {
                    return 1
                }
            }
            else {
                return 1
            }
        },


        typeEffectiveness(x) { //x = move1.value
            var attackingType = this.moveType(x)
            var power = this.movePower(x)
            var defendingTypeMono = this.mapper.properties.battle.enemyPokemon.type1.value
            var defendingType1 = this.mapper.properties.battle.enemyPokemon.type1.value
            var defendingType2 = this.mapper.properties.battle.enemyPokemon.type2.value
            var multipliers = this.typeData.find(x => x.moveType === attackingType)
            var stabModifier = this.determineSTAB(x)
            var ability = this.abilityModifier(this.pkmn_ability, attackingType)
            var itemBoost = this.determineItemBoost(x)
            var weatherBoost = this.weatherModifier(this.mapper.properties.battle.turnInfo.battleWeather.value, x, this.moveType(x))
            var burnModifier = this.burnModifier(x)
            if (x == "FUTURE SIGHT") { return 80 }
            //IN BATTLE
            try{ 
                if (this.batt.trainer[this.game.opponent].value == `LEADER_TATE_AND_LIZA_1` || this.batt.trainer[this.game.opponent].value == `MAGMA_LEADER_MAXIE_MOSSDEEP`) {
                    return power
                }
            }
            catch {
                // console.log("null opponent, no double battle power")
            }
            
            if (this.typeCalcs == true && this.g3stateVariable == "Battle") {
                let abilityImmunities = {
                    "LEVITATE" : "Ground",
                    "VOLT ABSORB" : "Electric",
                    "WATER ABSORB" : "Water",
                    "FLASH FIRE" : "Fire" 
                }
                let soundProofMoves = ["HYPER VOICE", "SNORE", "UPROAR"];
                if(this.mapper.properties.battle.enemyPokemon.ability.value == "SOUNDPROOF" && soundProofMoves.includes(x)) {
                    return 0;
                }
                //STATUS MOVE
                if (power == "-") { return power }
                //LEVITATE INTERACTION
                
                else if (abilityImmunities[this.mapper.properties.battle.enemyPokemon.ability.value]?.[1] == attackingType) {
                    return 0;
                }
                //NO ENEMY DATA (HAVEN'T BATTLED SINCE RELOADING ROM OR SAVE)
                else if (this.mapper.properties.battle.enemyPokemon.type1 == null) {
                    return Math.floor(power * stabModifier * itemBoost * ability * burnModifier)
                }
                //ATTACKING A MONO-TYPE POKEMON
                else if (this.mapper.properties.battle.enemyPokemon.type1.value === this.mapper.properties.battle.enemyPokemon.type2.value) {
                    var multiplier1 = multipliers[defendingTypeMono]
                    var thickFat = 1
                    if (this.mapper.properties.battle.enemyPokemon.ability.value == "THICK FAT" && attackingType == "Ice" || this.mapper.properties.battle.enemyPokemon.ability.value == "THICK FAT" && attackingType == "Fire") {
                        thickFat = .5 
                    }
                    return Math.floor(power * multiplier1 * stabModifier * itemBoost * weatherBoost * ability * burnModifier * thickFat)
                }
                //ATTACKING A DUAL-TYPE POKEMON
                else if (this.mapper.properties.battle.enemyPokemon.type1 != this.mapper.properties.battle.enemyPokemon.type2) {
                    var multipliers = this.typeData.find(x => x.moveType == attackingType)
                    var multiplier1 = multipliers[defendingType1]
                    var multiplier2 = multipliers[defendingType2]
                    return Math.floor(power * multiplier1 * multiplier2 * stabModifier * itemBoost * weatherBoost * ability * burnModifier)
                }
                //RETURN THE MOVES POWER IF NOTHING ELSE WORKS
                else {
                    return Math.floor(power * stabModifier * burnModifier)
                }
            }
            //NOT IN BATTLE
            else   
                if (power == "-") { return power }
                else { return Math.floor(power * stabModifier * itemBoost * ability * burnModifier) }
        },

        ////This needs to be updated
        type_effectiveness(pkmnData, moveNumber, enemyData) { //pkmnData = team[0] etc
            if (this.typeCalcs == true) {
                var move_name          = pkmnData["move" + moveNumber].value
                if (move_name == null) { return "" } //stop the function if there is no move in that slot
                
                var move_type          = this.g2MoveData[move_name].Type
                var move_info          = this.typeData.find(x => x.moveType === move_type)
                var move_power         = this.movePower(move_name)
                var move_category      = "Status"
                var attacker_type1     = pkmnData.type1.value
                var attacker_type2     = pkmnData.type2.value
                var defender_type1     = enemyData.type1.value
                var defender_type2     = enemyData.type2.value
                var multiplier_stab    = 1
                var multiplier_type1   = move_info[defender_type1]
                var multiplier_type2   = 1
                var screen_reflect     = 1
                var screen_lightscreen = 1
                var held_item          = this.determineItemBoost(move_name)
                var field_weather      = this.weatherModifier(this.mapper.properties.battle.weather.weatherType.value, move_name, this.moveType(move_name))
                var type_boost         = this.badgeBoostType(move_name)
                
                //update variables
                if (move_type == attacker_type1 || move_type == attacker_type2)                { multiplier_stab = 1.5 }
                if (defender_type1 != defender_type2)                                          { multiplier_type2 = this.typeData.find(x => x.moveType === move_type)[defender_type2] }
                if (move_type == "Normal" || move_type == "Fighting" || move_type == "Flying" || move_type == "Bug" || move_type == "Poison" || move_type == "Ghost" || move_type == "Ground" || move_type == "Rock" || move_type == "Steel") {
                    move_category = "Physical" }
                if (move_type == "Fire" || move_type == "Water" || move_type == "Grass" || move_type == "Electric" || move_type == "Psychic" || move_type == "Ice" || move_type == "Dragon" || move_type == "Dark") {
                    move_category = "Special" }
                if (enemyData.effects.reflect.value == true && move_category == "Physical")    { screen_reflect = 0.5 }
                if (enemyData.effects.lightScreen.value == true && move_category == "Special") { screen_lightscreen = 0.5 }

                //return if further updates aren't required
                if (move_power == "-")                { return move_power } //returns "-" if the move has no power
                if (this.g1stateVariable != `Battle`) { return Math.floor(move_power * multiplier_stab * held_item * type_boost) } //returns the move's base power if not in battle

                //calculate the move's effective power
                return Math.floor(move_power * multiplier_stab * multiplier_type1 * multiplier_type2 * screen_reflect * screen_lightscreen * held_item * field_weather * type_boost)
            }
            else { return this.movePower(pkmnData[moveNumber].value) }
        },


        //BADGE BOOSTS
        //  x = badge required
        //  y = stat to be boosted
        badgeBoost(x, y) {
            if (x == true)
                return Math.floor(y * 1.1)
            else
                return y
        },

        battlePokemonCrop() {
            let len = this.enemyTrainerList?.[this.opponentId]?.pokemon?.length;
            if (len == 1) {
                return "height: 234px;"
            }
            else if (len == 2) {
                return "height: 402px;"
            }
            else if (len == 3) {
                return "height: 566px;"
            }
            else if (len == 4) {
                return "height: 736px;"
            }
            else if (len == 5) {
                return "height: 902px;"
            }
            else if (len == 6) {
                return "height: 1080px;"
            }
        },
        newGame() {
            // console.log("watching for new game")
            // console.log(this.mapper.properties[this.game.newGameFlagContainer][this.game.newGameFlag])
            this.mapper.properties[this.game.newGameFlagContainer][this.game.newGameFlag].change((newProp, oldProp) => {
                // console.log("new game? new: "+newProp + " old: "+oldProp)
                if(this.game.newGameValueNew.includes(newProp.value) && this.game.newGameValueOld.includes(oldProp.value)){
                    console.log("new game started")
                    if (!this.testRun) { this.attempt_number++ }
                    this.newRun();
                    this.startTime();
                }
            })
        },
        freezeEncounters() {
            this.mapper.properties.overworld.mapName.change((newProp) => {
                // if (this.mapper.properties.player.badges.badge1.value == false && this.route_101 == false && newProp.value == "ROUTE 101") {
                //     this.mapper.properties.overworld.disabledEncounters.set(true,false);
                // }
                // if (this.mapper.properties.player.badges.badge1.value == false && this.route_102 == false && newProp.value == "ROUTE 102") {
                //     this.mapper.properties.overworld.disabledEncounters.set(true,false);
                // }
                // if (this.mapper.properties.player.badges.badge1.value == false && this.game.encountersMap["ROUTE 103"] == false && newProp.value == "ROUTE 103") {
                //     this.mapper.properties.overworld.disabledEncounters.set(true,false);
                // }
                /*else*/ if (this.mapper.properties.player.badges.badge1.value && this.hm_102_zigzagoon == true && newProp.value == "ROUTE 102" && this.game.encountersMap["ROUTE 102"] == false && this.mapper.properties.player.team[1].species.value != "Zigzagoon") {
                    this.mapper.properties.player.team[1].species.change((newerProp) => {
                        if(newerProp = "Zigzagoon" && this.hm_102_zigzagoon == true && newProp.value == "ROUTE 102" && this.game.encountersMap["ROUTE 102"] == false) {
                            this.mapper.properties.overworld.disabledEncounters.set(true,false);
                        }
                    });
                }
                else {
                    // console.log(this.game.encountersMap[newProp]);
                    if(this.game.encountersMap[newProp]==false) {
                        this.mapper.properties.overworld.disabledEncounters.set(true,false);
                    }
                    else {
                        this.mapper.properties.overworld.disabledEncounters.set(false,false);
                    }
                }
            });
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
                        await this.mapper.properties.events.trashCanPuzzle.set(true, false), 
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
            console.log("checkbox " + route,this.game.encountersMap[route])
            if(this.mapper.properties.overworld.mapName.value == route) {
                this.mapper.properties.overworld.disabledEncounters.set(this.game.encountersMap[route],false);
            }
        }
    },
    

//--------- PROGRAM MOUNTED ---------------------------------------------------------------------------------------------------------------//
    mounted: async function () {
        const that = this
        this.mapper = new GameHookMapperClient()
        this.mapper.onConnected = (x) => this.ready = true
        this.mapper.onDisconnected = (x) => this.ready = false
        await this.mapper.connect()
        console.log("mapper set")
        this.updateTime()
        this.load_all_settings()
        for (var species of Object.keys(dexDataRubySapphireEmerald)) {
            var image = new Image();
            image.src = `images/pokemon/${species}.png`;
        }

        this.newGame();
        //GAMESTATE MANAGEMENT
        // set initial gamestate value when the layout is loaded

        if (this.mapper.properties.player.team[0].level.value == 0) 
            this.g3stateVariable = "Base Stats"
        else if (this.mapper.properties.pointers.callback1.value == 0 || this.mapper.properties.pointers.callback1.value == null)
            this.g3stateVariable = "Base Stats"
        else if (this.game.callback1.overworld.includes(this.mapper.properties.pointers.callback1.value))
            this.g3stateVariable = "Overworld"
        else if (this.game.callback1.toBattle.includes(this.mapper.properties.pointers.callback1.value)) {
            if (this.game.callback2.toBattle.includes(this.mapper.properties.pointers.callback2.value)) {
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
            if (this.game.callback1.overworld.includes(prop.value)) {
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
            if (prop.value == "WON") { this.g3stateVariable = "From Battle"}
            if (prop.value == "LOST") { this.g3stateVariable = "From Battle"}
            if (prop.value == "DRAW") { this.g3stateVariable = "From Battle"}
            if (prop.value == "RAN") { this.g3stateVariable = "From Battle"}
            if (prop.value == "CAUGHT") { this.g3stateVariable = "From Battle"}
            if (prop.value == "PLAYER_TELEPORTED") { this.g3stateVariable = "From Battle"}
            if (prop.value == "POKEMON_FLED") { this.g3stateVariable = "From Battle"}
            if (prop.value == "NO_SAFARI_BALLS") { this.g3stateVariable = "From Battle"}
            if (prop.value == "FORFEITED") { this.g3stateVariable = "From Battle"}
            if (prop.value == "POKEMON_TELEPORTED") { this.g3stateVariable = "From Battle"}
        });

        this.mapper.properties.pointers.callback2.change((prop) => {
            if (this.game.callback2.baseStats.includes(prop.value)) { 
                this.g3stateVariable = "Base Stats"
            }
            else if (this.game.callback2.toBattle.includes(prop.value)) { 
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
        this.mapper.properties.pointers.callback2.change((newProp, oldProp) => {
            if (this.hallOfFameReset == true) {
                this.hallOfFameReset = false;
            }
            else if(newProp.value == 0 && oldProp.value > 0) {
                this.playerResets++;
            }
        });

        //ENEMY STATE
        //ENEMY STATE MANAGER
        //"Pokemon", "Fainted"
        // this.mapper.properties.battle.enemyPokemon.partyPos.change(async (newProp, oldProp) => {
        //     await this.sleep(100)
        //     this.enemyState = "Pokemon"
        // })
        if (this.mapper.properties.player.team[0].level.value == 0) 
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
            if (prop.value == 134442925) { 
                this.enemyState = "Battle Starting"
            }
        });
        this.mapper.properties.battle.turnInfo.battleDialogue.change((prop) => {
            if (prop.value == `Player Control` && this.enemyState == "Battle Starting") {
                this.enemyState = "Pokemon";
            }
        });
        this.mapper.properties.battle.enemyPokemon.hp.change(async (newProp, oldProp) => {
            if (newProp == 0 && this.enemyState == "Pokemon") {
                this.enemyState = "Fainting"
                await this.sleep(200)
                this.enemyState = "Fainted"
            }
            if (newProp > 0 && this.enemyState == "Fainted") {
                this.enemyState = "Pokemon"
            }
        });
        // this.mapper.properties.screen.tiles.column1.tile7.change((prop) => {
        //     if (prop == 127 && 
        //         this.mapper.properties.screen.tiles.column1.tile6 == 127 && 
        //         this.mapper.properties.screen.tiles.column1.tile5 == 127 && 
        //         this.mapper.properties.screen.tiles.column1.tile4 == 127 && 
        //         this.mapper.properties.screen.tiles.column1.tile3 == 127 && 
        //         this.mapper.properties.screen.tiles.column1.tile2 == 127 && 
        //         this.mapper.properties.screen.tiles.column1.tile1 == 127 &&
        //         this.enemyState == "Fainting") {
        //             this.enemyState = "Fainted"
        //         }
        // });
        this.mapper.properties.battle.outcome.change(async (prop) => {
            if (prop.value != null) {
                this.enemyState = "Battle Finished"
            }
        });


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
            if (this.mapper.properties.player.team[0].personalityValue?.value == 0 || this.mapper.properties.player.team[0].personalityValue?.value == null) //battle is cleared
                await Promise.all([
                    await this.mapper.properties.battle.yourPokemon.modStageAttack.setBytes([noMod], false), //resets ram to no mod
                    await this.mapper.properties.battle.yourPokemon.modStageDefense.setBytes([noMod], false), //resets ram to no mod
                    await this.mapper.properties.battle.yourPokemon.modStageSpeed.setBytes([noMod], false), //resets ram to no mod
                    await this.mapper.properties.battle.yourPokemon.modStageSpecialAttack.setBytes([noMod], false), //resets ram to no mod
                    await this.mapper.properties.battle.yourPokemon.modStageSpecialDefense.setBytes([noMod], false), //resets ram to no mod
                ])
        }
        await onLoad()
        
        const stageMods = async () => {
            const noMod = 0x06 //0x06 - no modifier
            if (this.mapper.properties.battle.turnInfo.battleOutcome.bytes > 0) { //checks to see if the player is current in the overworld
                await Promise.all([
                    await this.mapper.properties.battle.yourPokemon.modStageAttack.setBytes([noMod], false), //resets ram to no mod
                    await this.mapper.properties.battle.yourPokemon.modStageDefense.setBytes([noMod], false), //resets ram to no mod
                    await this.mapper.properties.battle.yourPokemon.modStageSpeed.setBytes([noMod], false), //resets ram to no mod
                    await this.mapper.properties.battle.yourPokemon.modStageSpecialAttack.setBytes([noMod], false), //resets ram to no mod
                    await this.mapper.properties.battle.yourPokemon.modStageSpecialDefense.setBytes([noMod], false), //resets ram to no mod
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
            const personalityValue = this.natures[this.pkmnNature][`personality_value_${this.pkmn_gender.toLowerCase()}`]
            var iv_block = this.g3hiddenPowerTypeSelector[this.hidden_power_type]
            console.log("Ability: " +this.pkmn_ability)
            if (this.pkmn_ability == this.game.dexData[this.starterString].abilities[1]) {
                iv_block = iv_block -2147483648;
            }

            // only recalculate stats when IVs when your starter is received
            if (this.mapper.properties.overworld.mapName.value == this.game.starterLocation && this.mapper.properties.player.team[0].level.value == 5) {
                await Promise.all([
                    await this.mapper.properties.player.team[0].personalityValue.set(personalityValue, false), 
                    await this.mapper.properties.player.team[0].ivEggAbilityBlock.set(iv_block, false), 
                ])
            }
        }
        
        const setStartingStats = async () => {
            const pkmnData = this.dexData[this.starterString]
            const level = 5
            const natures = this.natures[this.pkmnNature]
            const species = this.mapper.properties.player.team[0].species.value

            var ivHp = this.mapper.properties.player.team[0].ivHp.value
            var ivAtk = this.mapper.properties.player.team[0].ivAttack.value
            var ivDef = this.mapper.properties.player.team[0].ivDefense.value
            var ivSpA = this.mapper.properties.player.team[0].ivSpecialAttack.value
            var ivSpD = this.mapper.properties.player.team[0].ivSpecialDefense.value
            var ivSpe = this.mapper.properties.player.team[0].ivSpeed.value

            //calculates the Pokemon's starting stats with the desired DVs
            var hitpoints = Math.floor((((2 * pkmnData.base_hp + ivHp + 0) * level)/100) + level + 10)
            var attack = Math.floor(Math.floor(((((2 * pkmnData.base_atk + ivAtk + 0) * level)/100) + 5)) * natures["nature_attack"])
            var defense = Math.floor(Math.floor(((((2 * pkmnData.base_def + ivDef + 0) * level)/100) + 5)) * natures["nature_defense"])
            var specialAttack = Math.floor(Math.floor(((((2 * pkmnData.base_spc_atk + ivSpA + 0) * level)/100) + 5)) * natures["nature_specialAttack"])
            var specialDefense = Math.floor(Math.floor(((((2 * pkmnData.base_spc_def + ivSpD + 0) * level)/100) + 5)) * natures["nature_specialDefense"])
            var speed = Math.floor(Math.floor(((((2 * pkmnData.base_spd + ivSpe + 0) * level)/100) + 5)) * natures["nature_speed"])

            // only recalculate stats when IVs when your starter is received
            if (this.mapper.properties.overworld.mapName.value == this.game.starterLocation && this.mapper.properties.player.team[0].level.value == 5) {
                await Promise.all([
                    await this.mapper.properties.player.team[0].hp.set(hitpoints, false), 
                    await this.mapper.properties.player.team[0].maxHp.set(hitpoints, false), 
                    await this.mapper.properties.player.team[0].attack.set(attack, false), 
                    await this.mapper.properties.player.team[0].defense.set(defense, false), 
                    await this.mapper.properties.player.team[0].specialAttack.set(specialAttack, false), 
                    await this.mapper.properties.player.team[0].specialDefense.set(specialDefense, false), 
                    await this.mapper.properties.player.team[0].speed.set(speed, false), 
                ])
                if (species == 'Regirock' || species == 'Regice' || species == 'Registeel') {
                    await Promise.all([
                        await this.mapper.properties.player.team[0].move1pp.set(0, false),
                    ])
                }
            }
        }
        this.mapper.properties.player.team[0].move1pp.change(async (newProp) => {
            const species = this.mapper.properties.player.team[0].species.value
            const pp = newProp.value
            const move1 = this.mapper.properties.player.team[0].move1.value
            const move2 = this.mapper.properties.player.team[0].move2.value
            if (species == 'Regirock' || species == 'Regice' || species == 'Registeel') {
                if (move1 == 'EXPLOSION' && move2 == null) {
                    await Promise.all([
                        await this.mapper.properties.player.team[0].move1pp.set(0, false),
                    ])
                }   
            }
        });
        this.mapper.properties.player.team[0].level.change(async (newProp) => {
            if (newProp == 5 && this.mapper.properties.overworld.mapName.value == this.game.starterLocation) {
                await setStartingAttributes()
            }
        });
        this.mapper.properties.battle.type.first_battle.change(async (newProp, oldProp) => {
            if (newProp.value == true && oldProp.value == false && this.mapper.properties.overworld.mapName.value == this.game.starterLocation && this.mapper.properties.player.team[0].level.value == 5) {
                await setStartingStats()
            }
        });

        this.freezeEncounters();

        
        //SET OPTIONS
        //! ERROR: THIS IS NOT WORKING
        // this.mapper.properties.overworld.mapName.change(async (prop) => {
        //     console.log("Check " + (this.mapper.properties.options.textSpeed.address-this.mapper.properties.pointers.dma2.value));
        //     if((this.mapper.properties.options.textSpeed.address-this.mapper.properties.pointers.dma2.value)!= 20) {
        //         return;
        //     }
        //     this.mapper.properties.options.textSpeed.set(2, false)
        //     this.mapper.properties.options.battleAnim.set(true, false)
        //     await this.sleep(100)
        //     this.mapper.properties.options.battleStyle.set(true, false)
        // })
        // this.mapper.properties.pointers.callback2.change(async (newProp, oldProp) => {
        //     if (newProp.value == `Main Menu`) {
        //         this.mapper.properties.options.textSpeed.set(2, false)
        //         this.mapper.properties.options.battleAnim.set(true, false)
        //         await this.sleep(100)
        //         this.mapper.properties.options.battleStyle.set(true, false)
        //     }
        // })
        // console.log(this.game.newGameFlag)
        // console.log(this.mapper.properties)
        // console.log(this.mapper.properties[this.game.newGameFlagContainer])
        // console.log(this.mapper.properties["pointers"])
        // console.log(this.game["newGameFlagContainer"])
        // this.mapper.properties[this.game.newGameFlagContainer][this.game.newGameFlag].change(async (newProp, oldProp) => {
        //     if (newProp.value == `MAIN MENU` || newProp.value == `NEW GAME`) {
        //         //forcefully update the adresses to match dmaB, since the mapper seems to be doing this incorrectly sometimes
        //         //no dma updates on the main menu or new game screens, so this is safe
        //         let dmaB = this.mapper.properties.pointers.dma2.value; 
        //         this.mapper.properties.options.textSpeed.address = dmaB + 20;
        //         //speed and frame style share a byte. The frame style increments the byte by multiples of 8 depending on the user's pick
        //         //this line takes the nearest multiple of 8 and adds 2 to ensure fast text with the chosen frame
        //         let speedWithFrame = Math.floor(this.mapper.properties.options.textSpeed.bytes[0]/8)*8+2;
        //         this.mapper.properties.options.textSpeed.set(speedWithFrame, false)
        //         this.mapper.properties.options.battleAnim.address = dmaB + 21;
        //         this.mapper.properties.options.battleAnim.setBytes([0x06],false)
        //     }
        // })
        //FIX OF ENEMY BATTLE STATS
        this.mapper.properties.battle.enemyPokemon.partyPos.change(async (newProp) => {
            if (newProp == 0 || newProp == 255) { return }
            this.slotTimingFix = true    
            await this.sleep(100)
            this.slotTimingFix = false
        })

        //*Autosplitter
        
        const log_split = (x) => console.log(`Autosplitter - Battle Ended: Split: ${this.opponent} at ${this.timer_formatted_time[0]}${this.timer_formatted_time[1]} (Gametime: ${this.gametimeSplit})`)
        const autosplitter_process = () => {
            console.log("Checking if autosplitter is on...")
            if (this.autosplitter_toggle == true) {
                console.log("Began Autosplitter Process")
                d = new Date()
                battle_end = Date.now()
                //values
                let gameTimeH = this.mapper.properties.gameTime?.hours?.value
                let gameTimeM = this.mapper.properties.gameTime?.minutes?.value
                let gameTimeS = this.mapper.properties.gameTime?.seconds?.value
                let gameTimeF = this.mapper.properties.gameTime?.frames?.value
                
                //data to be collected with the autosplitter
                let date_string = (d.getMonth() + 1) + "-" + d.getDate().toString().padStart(2, "0")
                let time_string = d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0")
                let player_name = this.mapper.properties.player.name.value
                let pokemon = this.starterString
                console.log("opponent info: "+ this.opponent)
                let trainer_name = this.opponent
                // let trainer_name = this.format_trainer_name(this.mapper.properties.battle.trainer.class.value, this.mapper.properties.battle.trainer.number.value)
                let trainer_id = this.opponentId
                let location = this.mapper.properties.overworld.mapName.value
                let total_pokemon = this.mapper.properties.battle.trainer.totalPokemon
                let real_time_total = this.timer_formatted_time[0] + this.timer_formatted_time[1]
                let real_time_hmmss = this.timer_formatted_time[0]
                let real_time_file_label = this.timer_formatted_time[2]
                let resets = this.playerResets.toString()
                let blackouts = this.blackout_counter.toString()
                let failures = this.playerResets + this.blackout_counter
                let level = this.mapper.properties.player.team[0].level.value.toString()
                let game_time = this.gametimeSplit.toString()
                let battle_duration = (battle_end - this.battle_start)/1000 
                let move1 = this.mapper.properties.player.team[0].move1.value
                let move2 = this.mapper.properties.player.team[0].move2.value
                let move3 = this.mapper.properties.player.team[0].move3.value
                let move4 = this.mapper.properties.player.team[0].move4.value
                let move1pp = this.mapper.properties.player.team[0].move1pp.value
                let move2pp = this.mapper.properties.player.team[0].move2pp.value
                let move3pp = this.mapper.properties.player.team[0].move3pp.value
                let move4pp = this.mapper.properties.player.team[0].move4pp.value
                let move1ppUp = this.mapper.properties.player.team[0].move1ppUp.value
                let move2ppUp = this.mapper.properties.player.team[0].move2ppUp.value
                let move3ppUp = this.mapper.properties.player.team[0].move3ppUp.value
                let move4ppUp = this.mapper.properties.player.team[0].move4ppUp.value
                let saves = 0
                let steps = 0
                let bonks = 0
                let trainerBattles = 0
                let wildBattles = 0
                let battleTurns = 0
                let playerTurns = 0
                let enemyTurns = 0
                let itemsInBag = 0
                let money = 0
                let rivalTeam = 0
                let statusCondition = this.mapper.properties.player.team[0].statusCondition.value
                let type1 = this.dexData[this.starterString].type_1
                let type2 = this.dexData[this.starterString].type_2
                let experience = this.mapper.properties.player.team[0].expPoints.value
                
                //deprecated properties
                let runIdentifier = this.starterString.toString() + this.attempt_number.toString()
                let trainerName = this.opponent
                let RTHours = this.time_h
                let RTMinutes = this.time_m
                let RTSeconds = this.time_s
                let RTMilliseconds = this.time_ms
                let startTime = this.time_split_start
                let realTime = this.padTime(this.time_h) + ":" + this.padTime(this.time_m) + ":" + this.padTime(this.time_s) + "." + this.padTime(this.time_ms)
                let gameTime = this.padTime(gameTimeH) + ":" + this.padTime(gameTimeM) + ":" + this.padTime(gameTimeS) + "." + this.padTime(gameTimeF)
                let hp = this.mapper.properties.player.team[0].hp.value
                let maxHp = this.mapper.properties.player.team[0].maxHp.value
                let atk = this.mapper.properties.player.team[0].attack.value
                let def = this.mapper.properties.player.team[0].defense.value
                let spA = this.mapper.properties.player.team[0].specialAttack.value
                let spD = this.mapper.properties.player.team[0].specialDefense.value
                let spe = this.mapper.properties.player.team[0].speed.value
                let statExp_hp = this.mapper.properties.player.team[0].ivHp.value
                let statExp_atk = this.mapper.properties.player.team[0].ivAttack.value
                let statExp_def = this.mapper.properties.player.team[0].ivDefense.value
                let statExp_spA = this.mapper.properties.player.team[0].ivSpecialAttack.value
                let statExp_spD = this.mapper.properties.player.team[0].ivSpecialDefense.value
                let statExp_spe = this.mapper.properties.player.team[0].ivSpeed.value
                let dvAttack = this.mapper.properties.player.team[0].ivAttack.value
                let dvDefense = this.mapper.properties.player.team[0].ivDefense.value
                let dvSpeed = this.mapper.properties.player.team[0].ivSpeed.value
                let dvSpecial = this.mapper.properties.player.team[0].ivSpecialAttack.value
                let mod_atk = this.mapper.properties.battle.yourPokemon.modStageAttack.value
                let mod_def = this.mapper.properties.battle.yourPokemon.modStageDefense.value
                let mod_spA = this.mapper.properties.battle.yourPokemon.modStageSpecialAttack.value
                let mod_spD = this.mapper.properties.battle.yourPokemon.modStageSpecialDefense.value
                let mod_spe = this.mapper.properties.battle.yourPokemon.modStageSpeed.value
                let mod_acc = this.mapper.properties.battle.yourPokemon.modStageAccuracy.value
                let mod_eva = this.mapper.properties.battle.yourPokemon.modStageEvasion.value
                let battle_atk = this.mapper.properties.battle.yourPokemon.attack.value
                let battle_def = this.mapper.properties.battle.yourPokemon.defense.value
                let battle_spA = this.mapper.properties.battle.yourPokemon.specialAttack.value
                let battle_spD = this.mapper.properties.battle.yourPokemon.specialDefense.value
                let battle_spe = this.mapper.properties.battle.yourPokemon.speed.value
                
                //patch properties
                let patch_frameCount = 0
                let patch_oWFrameCount = 0
                let patch_battleFrameCount = 0
                let patch_menuFrameCount = 0
                let patch_introsFrameCount = 0
                let patch_saveCount = 0
                let patch_reloadCount = 0
                let patch_clockResetCount = 0
                let patch_stepsCount = 0
                let patch_stepsCountWalk = 0
                let patch_stepsCountBike = 0
                let patch_stepsCountSurf = 0
                let patch_bonks = 0
                let patch_battles = 0
                let patch_trainerBattles = 0
                let patch_wildBattles = 0
                let patch_battlesFled = 0
                let patch_failedRuns = 0
                let patch_totalDamageDealt = 0
                let patch_actualDamageDealt = 0
                let patch_totalDamageTaken = 0
                let patch_actualDamageTaken = 0
                let patch_ownMovesHit = 0
                let patch_ownMovesMissed = 0
                let patch_enemyMovesHit = 0
                let patch_enemyMovesMissed = 0
                let patch_ownMovesSE = 0
                let patch_ownMovesNVE = 0
                let patch_enemyMovesSE = 0
                let patch_enemyMovesNVE = 0
                let patch_criticalsDealt = 0
                let patch_oHKOsDealt = 0
                let patch_criticalsTaken = 0
                let patch_oHKOsTaken = 0
                let patch_wasConfused = 0
                let patch_enemyBecameConfused = 0
                let patch_wasParalyzed = 0
                let patch_enemyWasParalyzed = 0
                let patch_wasBurned = 0
                let patch_enemyWasBurned = 0
                let patch_wasFrozen = 0
                let patch_enemyWasFrozen = 0
                let patch_wasPoisoned = 0
                let patch_enemyWasPoisoned = 0
                let patch_wasPoisonedBadly = 0
                let patch_enemyWasPoisonedBadly = 0
                let patch_fellAsleep = 0
                let patch_enemyFellAsleep = 0
                let patch_playerTurnsConfused = 0
                let patch_enemyTurnsConfused = 0
                let patch_playerTurnsConfusedHitSelf = 0
                let patch_enemyTurnsConfusedHitSelf = 0
                let patch_playerTurnsParalyzed = 0
                let patch_enemyTurnsParalyzed = 0
                let patch_playerTurnsParalyzedFully = 0
                let patch_enemyTurnsParalyzedFully = 0
                let patch_PlayerTurnsAsleep = 0
                let patch_EnemyTurnsAsleep = 0
                let patch_playerHpHealed = 0
                let patch_enemyHpHealed = 0
                let patch_playerPokemonFainted = 0
                let patch_enemyPokemonFainted = 0
                let patch_experienceGained = 0
                let patch_switchout = 0
                let patch_moneyMade = 0
                let patch_moneySpent = 0
                let patch_moneyLost = 0
                let patch_itemsPickedUp = 0
                let patch_itemsBought = 0
                let patch_itemsSold = 0
                let patch_ballsThrown = 0
                let patch_pokemonCaughtInBalls = 0
                let patch_movesLearnt = 0

                //definitions for what split data is logged to file
                let simple_data = [
                    player_name, pokemon, trainer_name, real_time_hmmss, 
                    resets, blackouts, level, game_time, battle_duration, 
                    move1, move2, move3, move4
                ]
                let full_data = simple_data
                if (this.scott_mode == true) {
                    full_data = [
                        date_string, time_string, player_name, pokemon, trainer_name, 
                        trainer_id, location, total_pokemon, real_time_total, 
                        real_time_hmmss, real_time_file_label, resets, blackouts, failures, 
                        level, game_time, battle_duration, move1, move2, move3, move4, 
                        saves, steps, bonks, trainerBattles, wildBattles, battleTurns, 
                        playerTurns, enemyTurns, itemsInBag, money, rivalTeam,
                        statusCondition, type1, type2, experience,
                        runIdentifier, this.starter, trainerName,
                        startTime, realTime, gameTime, level, this.playerResets,
                        RTHours, RTMinutes, RTSeconds, RTMilliseconds,
                        move1, move2, move3, move4, move1pp, move2pp, move3pp, move4pp, move1ppUp, move2ppUp, move3ppUp, move4ppUp,
                        hp, maxHp, atk, def, spA, spD, spe,
                        statExp_hp, statExp_atk, statExp_def, statExp_spA, statExp_spD, statExp_spe,
                        dvAttack, dvDefense, dvSpeed, dvSpecial,
                        mod_atk, mod_def, mod_spA, mod_spD, mod_spe, mod_acc, mod_eva,
                        battle_atk, battle_def, battle_spA, battle_spD, battle_spe,
                        patch_frameCount, patch_oWFrameCount, patch_battleFrameCount, patch_menuFrameCount, patch_introsFrameCount,
                        patch_saveCount, patch_reloadCount, patch_clockResetCount,
                        patch_stepsCount, patch_stepsCountWalk, patch_stepsCountBike, patch_stepsCountSurf, patch_bonks,
                        patch_battles, patch_trainerBattles, patch_wildBattles, patch_battlesFled, patch_failedRuns,
                        patch_totalDamageDealt, patch_actualDamageDealt, patch_totalDamageTaken, patch_actualDamageTaken,
                        patch_ownMovesHit, patch_ownMovesMissed, patch_enemyMovesHit, patch_enemyMovesMissed, 
                        patch_ownMovesSE, patch_ownMovesNVE, patch_enemyMovesSE, patch_enemyMovesNVE, 
                        patch_criticalsDealt, patch_oHKOsDealt, patch_criticalsTaken, patch_oHKOsTaken,
                        patch_wasConfused, patch_enemyBecameConfused, patch_wasParalyzed, patch_enemyWasParalyzed, 
                        patch_wasBurned, patch_enemyWasBurned, patch_wasFrozen, patch_enemyWasFrozen,
                        patch_wasPoisoned, patch_enemyWasPoisoned, patch_wasPoisonedBadly, patch_enemyWasPoisonedBadly,
                        patch_fellAsleep, patch_enemyFellAsleep, patch_playerTurnsConfused, patch_playerTurnsConfusedHitSelf, 
                        patch_playerTurnsParalyzed, patch_playerTurnsParalyzedFully, patch_enemyTurnsConfused, patch_enemyTurnsConfusedHitSelf, 
                        patch_enemyTurnsParalyzed, patch_enemyTurnsParalyzedFully, patch_PlayerTurnsAsleep, patch_EnemyTurnsAsleep,
                        patch_playerHpHealed, patch_enemyHpHealed, 
                        patch_playerPokemonFainted, patch_enemyPokemonFainted, patch_experienceGained, patch_switchout,
                        patch_moneyMade, patch_moneySpent, patch_moneyLost,
                        patch_itemsPickedUp, patch_itemsBought, patch_itemsSold,
                        patch_ballsThrown, patch_pokemonCaughtInBalls,
                        patch_movesLearnt,
                        //new properties
                        blackouts, this.attempt_number, failures, rivalTeam
                    ]
                }

                let deprecated_data = []
                if (this.scott_mode == true) {
                    deprecated_data = [
                        runIdentifier, this.starter, trainerName,
                        startTime, realTime, gameTime, level, this.playerResets,
                        RTHours, RTMinutes, RTSeconds, RTMilliseconds,
                        move1, move2, move3, move4,
                        atk, def, spA, spD, spe,
                        mod_atk, mod_def, mod_spA, mod_spD, mod_spe, mod_acc, mod_eva,
                        battle_atk, battle_def, battle_spA, battle_spD, battle_spe,
                        patch_frameCount, patch_oWFrameCount, patch_battleFrameCount, patch_menuFrameCount, patch_introsFrameCount,
                        patch_saveCount, patch_reloadCount, patch_clockResetCount,
                        patch_stepsCount, patch_stepsCountWalk, patch_stepsCountBike, patch_stepsCountSurf, patch_bonks,
                        patch_battles, patch_trainerBattles, patch_wildBattles, patch_battlesFled, patch_failedRuns,
                        patch_totalDamageDealt, patch_actualDamageDealt, patch_totalDamageTaken, patch_actualDamageTaken,
                        patch_ownMovesHit, patch_ownMovesMissed, patch_enemyMovesHit, patch_enemyMovesMissed, 
                        patch_ownMovesSE, patch_ownMovesNVE, patch_enemyMovesSE, patch_enemyMovesNVE, 
                        patch_criticalsDealt, patch_oHKOsDealt, patch_criticalsTaken, patch_oHKOsTaken,
                        patch_wasConfused, patch_enemyBecameConfused, patch_wasParalyzed, patch_enemyWasParalyzed, 
                        patch_wasBurned, patch_enemyWasBurned, patch_wasFrozen, patch_enemyWasFrozen,
                        patch_wasPoisoned, patch_enemyWasPoisoned, patch_wasPoisonedBadly, patch_enemyWasPoisonedBadly,
                        patch_fellAsleep, patch_enemyFellAsleep, patch_playerTurnsConfused, patch_playerTurnsConfusedHitSelf, 
                        patch_playerTurnsParalyzed, patch_playerTurnsParalyzedFully, patch_enemyTurnsConfused, patch_enemyTurnsConfusedHitSelf, 
                        patch_enemyTurnsParalyzed, patch_enemyTurnsParalyzedFully,
                        patch_playerHpHealed, patch_enemyHpHealed, 
                        patch_playerPokemonFainted, patch_enemyPokemonFainted, patch_experienceGained, patch_switchout,
                        patch_moneyMade, patch_moneySpent, patch_moneyLost,
                        patch_itemsPickedUp, patch_itemsBought, patch_itemsSold,
                        patch_ballsThrown, patch_pokemonCaughtInBalls,
                        patch_movesLearnt,
                        //new properties
                        blackouts, this.attempt_number, failures, rivalTeam
                    ]
                }
                
                let simple_data_str = simple_data.join(",") + "\n";
                let full_data_str = full_data.join(",") + "\n";
                let deprecated_data_str = deprecated_data.join(",") + "\n";
                MyStorage["simple_data_str"] = simple_data_str
                MyStorage["full_data_str"] = full_data_str
                MyStorage["simple_data"] = simple_data
                MyStorage["deprecated_data_str"] = deprecated_data_str
                this.simple_data_str = simple_data_str
                this.full_data_str = full_data_str
                this.simple_data = simple_data
                this.deprecated_data_str = deprecated_data_str
            }
        }

        //write to file at the end of a key battle
        this.mapper.properties.battle.turnInfo.battleOutcome.change(async (prop) => {
            console.log('Battle Outcome Changed')
            autosplitter_process()
            console.log('Autosplitter Attempted to Run by Battle Outcome Change')
            if (prop.value == "WON") {
                console.log('Starting log process')
                let trainer = this.opponent
                let id = this.opponentId
                let gameName = this.game.gameName;
                
                //write full split data
                logData(gameName, this.full_data_str, this.attempt_number, this.starterString, "Full", this.testRun, this.scott_mode)
                
                //write deprecated split data
                if (this.autosplitter[this.game.gameName][trainer]) {
                    logData(gameName, this.deprecated_data_str, this.attempt_number, this.starterString, "Deprecated", this.testRun, this.scott_mode)
                }
                
                //write simple split data
                const simpleSplit = () => {
                    log_split()
                    logData(gameName, this.simple_data_str, this.attempt_number, this.starterString, "Simple", this.testRun, this.scott_mode)
                    this.split_data.push(this.simple_data)
                    MyStorage["split_data"] = this.split_data
                    MyStorage[this.starterString] = {
                        ...MyStorage[this.starterString],
                        split_data: this.split_data
                    }
                }
                if(this.game.splits.includes(trainer)&& !this.game.finalBattle.includes(trainer)) {
                    simpleSplit();
                }
           
                if (this.game.champion.includes(trainer)) {
                    this.hallOfFameReset = true;
                }

                //stop timer
                if (this.game.finalBattle.includes(trainer)) {
                    this.stopTime()
                    if (this.testRun == false) {
                        this.finished_run_count++
                    };
                    log_split();
                    
                    //use then so that logCopy doesn't touch any files until logData finishes
                    logData(gameName, this.simple_data_str, this.attempt_number, this.starterString, "Simple", this.testRun, this.scott_mode)
                    .then(() => {
                            console.log("Run complete - moving attempt files to finished folder.")
                            logCopy(gameName, this.attempt_number, this.starterString, this.finished_run_count);
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
        });

        //EXP BAR ANIMATION FUNCTION
        var species = this.mapper.properties.player.team[0].species.value??this.starterString;
        if(this.dexData[species]==null){
            return;
        }
        var growthRate = this.dexData[species].growth_rate
        var expStats = this.calcExpStats(growthRate, this.mapper.properties.player.team[0].expPoints.value);
        this.$refs.expBar.style.width = (expStats.percent * 100) + "%";
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
        // keybinds
        keyhook.registerShortCut('F23', async () => {
            this.newRun()
        });
        keyhook.registerShortCut('F12', async () => {
            this.pauseUnpauseTime()
        });
        keyhook.registerShortCut('F24', async () => {
            this.pauseUnpauseTime()
        });
        if(this.game.gameName== "FireRed and LeafGreen") {
            this.trashCans();
        }
    },
}).mount('#app')