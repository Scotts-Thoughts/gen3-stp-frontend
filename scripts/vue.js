// 2023-02-09
// !BUG - EXP bar doesn't animate correctly when it maxes out and the Pkmn lvls up
// !BUG - Beginning of battle pop in
    // ! - currently affects exp bar, moveset, held item
    // ! - lilely caused by the fact that Gamehook looses the properties (either DMA, or slow decryption)
// TODO - Time Experience Bar on the overlay with the experience bar in game
// TODO - 

const app = Vue.createApp({
    data() {
        return {
            ready: false,
            mapper: null,

            // POKEMON CONFIG (components) ---------------------------------------------------------------------//
            starter:        357, //select starter (1-386)
            starterString: "Tropius",
            pkmnNature: "Hardy",
            pkmnAbility: "Chlorophyll",
            pkmnGrowthRate: "Slow",
            // hpTypeChoice:   "hpDark", //select hidden power type in hp + type. (ie. hpFire, hpDark, hpIce, hpDragon)
            // natureChoice:   "Rash", //select Pokemon nature
            
            // SET BADGE
            useBadgeOverride: false,
            badge1set: false,
            badge2set: false,
            badge3set: false,
            badge4set: false,
            badge5set: false,
            badge6set: false,
            badge7set: false,
            badge8set: false,


            // USER CONFIG (components) ------------------------------------------------------------------------// 
            graphicOverlay: true, //places a single image as the overlay  //MVP
            staticOverlay:  false, //assembles an overlay based on starter selection
            texture:        false, //shows background texture
            frame:          false, //shows overlay frame
            gameArea:       false, //shows green box to place game in
            pokeballFloor:  false, //shows floor for Pokemon to stand on
            dynamicOverlay: false, //dynamically picks overlay graphics based on team slot 1
            gametime:       false, //shows gametime
            typeIcons:      true, //includes dynamic type icons
            pick:           true,
            typeCalcs:      true, //turns on type effectiveness calculations
            moveset:        true, //includes the moveset area and dynamic PP  //MVP
            dynamicPower:   false, //dynamically calculates power based on type effectiveness
            resets:         false, //includes the resets graphics
            stats:          true, //includes the dynamic stats  //MVP
            movepool:       false, //includes the movepool graphic
            inventory:      false, //includes the inventory graphic when in marts
            badgeBar:       true, //includes the badge container (progress bar)
            badgeBoosts:    false, //calculates badges boosts  //MVP
            battleStats:    false, //calculates stats with stage modifiers  //MVP
            battleInfo:     false, //includes rightBar battle graphic
            conditions:     false, //shows status conditions as pop ups
            expBar:         false, //includes a dynamic exp bar
            splits:         false, //shows splits when a major battle is complete
            tooltips:       false, //displays move tooltips when a new move is learned
            btcInfo:        false, //shows behind the scenes info in the game area
            returnPower:    true, //dynamically calculates the power of Return
            gamestate:      true, //shows the current gamestate in the place of the timer
            labels:         true, //shows the current gamestate in the place of the timer

            badges: ["badge1", "badge2", "badge3", "badge4", "badge5", "badge6", "badge7", "badge8"],
            badgeBoosts: ["badge1", "badge3", "badge5", "badge7"],
            pkmnMoves: ["move1", "move2", "move3", "move4"],

            //CSS styling values
            statLabelOpacityValue: 0, //used when a stage modifier is applied

            //DATA ---------------------------------------------------------------------------------------------//
            gen3data: gen3data,
            gen3moves: gen3moves,
            gen3abilities: gen3abilities,
            stageModifiersData: stageModifiersData,
            natures: natures,
            typeData: typeData,
            typeBoostingItems: typeBoostingItems,
            dexDataRubySapphireEmerald: dexDataRubySapphireEmerald,
            emeraldTrainers: emeraldTrainers,
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
            
            //VARIABLES
            // pkmn1: this.mapper.properties.player.team[0],
            boostAttack:  false, //badge1 - Roxanne's badge - attack boosted by 10%
            boostSpeed:   false, //badge3 - Watson's badge - speed boosted by 10%
            boostDefense: false, //badge5 - Norman's badge - defense boosted by 10%
            boostSpecial: false, //badge7 - Tate & Liza's badge - special attack & defense boosted by 10%

            //VARIABLES THAT TRACK IN GAME PROGRESS ------------------------------------------------------------//
            playerId: -1,
            resets:   0,
            trainerBattles: 0,
            wildEncounters: 0,

            //LOOPS
            pkmnSlots: [0, 1, 2, 3, 4, 5],
            
            //DISPLAY BUFFER
            bufferNature: "",
            bufferAbility: "",
            bufferHeldItem: "",
            bufferLevel: "",
            bufferHp: "",
            bufferAtk: "",
            bufferDef: "",
            bufferSpcA: "",
            bufferSpcD: "",
            bufferSpd: "",
            bufferBadge1: "",
            bufferBadge2: "",
            bufferBadge3: "",
            bufferBadge4: "",
            bufferBadge5: "",
            bufferBadge6: "",
            bufferBadge7: "",
            bufferBadge8: "",

            //BUFFER
            buffer_move1: undefined,
            buffer_move2: undefined,
            buffer_move3: undefined,
            buffer_move4: undefined,
            buffer_power_move1: undefined,
            buffer_power_move2: undefined,
            buffer_power_move3: undefined,
            buffer_power_move4: undefined,
            buffer_move1pp: undefined,
            buffer_move2pp: undefined,
            buffer_move3pp: undefined,
            buffer_move4pp: undefined,
            buffer_exp: undefined,
            buffer_heldItem: undefined,

            //Reset buffer
            resetBufferNature: "",
            resetBufferAbility: "",
            resetBufferHeldItem: "",
            resetBufferLevel: "",
            resetBufferHp: "",
            resetBufferAtk: "",
            resetBufferDef: "",
            resetBufferSpcA: "",
            resetBufferSpcD: "",
            resetBufferSpd: "",

            //STATE MANAGEMENT ---------------------------------------------------------------------------------//
            gamestateLogging: false,
            currentGameState: "Initialization",
            simpleGameState: "Out of Game",
            currentGameStateNew: "Initialization",
            simpleGameStateNew: "Out of Game",
            gameStarted:  true, //tracks if the player has a save game or not
            playerID: 999,
            g3stateVariable: "Base Stats",
            prevSpecies: undefined,
            prevExpPoints: 0,
            expDebounceTimeoutId: -1,
            expBarAnimation: false,
        }
    },
    computed: {
        enemyTrainerName() {
            return this.emeraldTrainers[this.mapper.properties.battle.trainer.opponentAId.value]?.trainer_name
        },
        enemyTrainerPokemon() {
            return this.emeraldTrainers[this.mapper.properties.battle.trainer.opponentAId.value]?.pokemon
        },
        enemyTrainer() {
            return this.emeraldTrainers[this.mapper.properties.battle.trainer.opponentAId.value]
        },
    },

    methods: { 
        writeBufferDisplay() {
            this.bufferAbility = this.mapper.properties.battle.yourPokemon.ability.value
            this.bufferNature = this.mapper.properties.player.team[0].personalityValue.value
            this.bufferHeldItem = this.mapper.properties.player.team[0].itemHeld.value
            this.bufferLevel = this.mapper.properties.player.team[0].level.value
            this.bufferHp = this.mapper.properties.player.team[0].maxHp
            this.bufferAtk = this.mapper.properties.player.team[0].attack
            this.bufferDef = this.mapper.properties.player.team[0].defense
            this.bufferSpcA = this.mapper.properties.player.team[0].specialAttack
            this.bufferSpcD = this.mapper.properties.player.team[0].specialDefense
            this.bufferSpd = this.mapper.properties.player.team[0].speed
            this.bufferBadge1 = this.mapper.properties.player.badges.badge1.value
            this.bufferBadge2 = this.mapper.properties.player.badges.badge2.value
            this.bufferBadge3 = this.mapper.properties.player.badges.badge3.value
            this.bufferBadge4 = this.mapper.properties.player.badges.badge4.value
            this.bufferBadge5 = this.mapper.properties.player.badges.badge5.value
            this.bufferBadge6 = this.mapper.properties.player.badges.badge6.value
            this.bufferBadge7 = this.mapper.properties.player.badges.badge7.value
            this.bufferBadge8 = this.mapper.properties.player.badges.badge8.value
            if (gamestateLogging == true) {
                console.log(this.bufferNature)
                console.log(this.bufferAbility)
                console.log(this.bufferHeldItem)
                console.log(this.bufferLevel)
                console.log(this.bufferHp)
                console.log(this.bufferAtk)
                console.log(this.bufferDef)
                console.log(this.bufferSpcA)
                console.log(this.bufferSpcD)
                console.log(this.bufferSpd)
                console.log(this.bufferBadge1)
                console.log(this.bufferBadge2)
                console.log(this.bufferBadge3)
                console.log(this.bufferBadge4)
                console.log(this.bufferBadge5)
                console.log(this.bufferBadge6)
                console.log(this.bufferBadge7)
                console.log(this.bufferBadge8)
            }
        },
        writeBufferReset() {
            this.resetBufferAbility = this.mapper.properties.battle.yourPokemon.ability.value
            this.resetBufferNature = this.mapper.properties.player.team[0].personalityValue.value
            this.resetBufferHeldItem = this.mapper.properties.player.team[0].itemHeld.value
            this.resetBufferLevel = this.mapper.properties.player.team[0].level.value
            this.resetBufferHp = this.mapper.properties.player.team[0].maxHp
            this.resetBufferAtk = this.mapper.properties.player.team[0].attack
            this.resetBufferDef = this.mapper.properties.player.team[0].defense
            this.resetBufferSpcA = this.mapper.properties.player.team[0].specialAttack
            this.resetBufferSpcD = this.mapper.properties.player.team[0].specialDefense
            this.resetBufferSpd = this.mapper.properties.player.team[0].speed
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
            var growthRate = this.dexDataRubySapphireEmerald[this.starterString].growth_rate
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
                return this.dexDataRubySapphireEmerald[starterString].growth_rate
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
        getPokemonImageUrl: function (x) {
            if (x != null)
                return `images/overlay/${x.pokedexNumber}.png`
        },
        getStarterArt: function () {
            return `images/pokemon/${this.starter}.png`
        },
        getStarterImageUrl: function () {
            return `images/overlay/${this.starter}.png`
        },
        getStarterTypeTexture() {
            if (this.pick == true) {
                var type = this.gen3data.find(y => y.dexNumber === this.starter)
                return `images/elements/textures/${type.type1.toLowerCase()}.png`
            }
            else
                return `images/elements/textures/normal.png`
        },
        
        //TYPE ICONS FOR THE STARTER SELECTION
        starterTypeCheck() {
            if (this.pick == true)
                var starterType1 = this.gen3data.find(y => y.dexNumber === this.starter)
                var starterType2 = this.gen3data.find(y => y.dexNumber === this.starter)
                if (starterType2.type2 == null)
                    return true
                else   
                    return false
        },
        getStarterType1() {
            if (this.pick == true)
                var type = this.dexDataRubySapphireEmerald[this.starterString].type_1
                return `images/elements/types/${type}.png`
        },
        getStarterType2() {
            if (this.pick == true)
                var type = this.dexDataRubySapphireEmerald[this.starterString].type_2
                return `images/elements/types/${type}.png`
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
            else if (y == -6 && this.mapper.properties.battle.yourPokemon.species.value == null)
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
        
        //EXPERIENCE FUNCTIONS
        expPercent(x) {
            return this.expPercentSlow(x)
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
            if (y) {
                var move = this.gen3moves.find(x => x.Move.toUpperCase() === y)
                if (y == "RETURN") {
                    if (this.mapper.properties.player.team[0].friendship.value < 2.5)
                        var friendshipValue = 2.5 
                    else 
                        var friendshipValue = this.mapper.properties.player.team[0].friendship.value
                    var specialMovePower = Math.floor(friendshipValue/2.5)
                    // console.log("Return Power: "+specialMovePower)
                    return specialMovePower
                }
                else if (y == "FLAIL") {
                    var hpPercentage = this.mapper.properties.player.team[0].hp.value / this.mapper.properties.player.team[0].maxHp.value
                    if (hpPercentage >= .6875) { return 20 }
                    else if (hpPercentage >= .3542 && hpPercentage < .6875) { return 40 }
                    else if (hpPercentage >= .2083 && hpPercentage < .3542) { return 80 }
                    else if (hpPercentage >= .1042 && hpPercentage < .2083) { return 100 }
                    else if (hpPercentage >= .0417 && hpPercentage < .1042) { return 150 }
                    else if (hpPercentage < .0417) { return 200 }
                }
                else if (y == "FRUSTRATION") {
                    if (this.mapper.properties.player.team[0].friendship.value > 252.5)
                        var friendshipValue = 252.5 
                    else 
                        var friendshipValue = this.mapper.properties.player.team[0].friendship.value
                    var specialMovePower = Math.floor(255-friendshipValue/2.5)
                    return specialMovePower
                }
                else if (y == "HIDDEN POWER") {
                    return this.hiddenPowerPowerCalc(this.mapper.properties.player.team[0])
                }
                else
                    if (move) return move.Power
            }
            return null
        },
        weatherModifier(weather, move, moveType) {
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
            if (y == "HIDDEN POWER") {
                var move = this.hiddenPowerTypeCalc(this.mapper.properties.player.team[0])
                return move
            }
            else if (y) {
                var move = this.gen3moves.find(x => x.Move.toUpperCase() === y)
                if (move) return move.Type
            }
            return null
        },
        moveTypeIcon(y) { //y = move1.value
            if (y != null && y != undefined && y == "HIDDEN POWER") {
                return `images/elements/type-icons/${this.hiddenPowerTypeCalc(this.mapper.properties.player.team[0])}.png`
            }
            else if (y != null && y != undefined) {
                var move = this.gen3moves.find(x => x.Move.toUpperCase() === y)
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
            if (this.g3state() == "Battle") {
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
            if (this.mapper.properties.battle.yourPokemon.species.value == null)
                return 1
            else if (this.g3state() == "Battle")
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
            var pkmnType1 = this.dexDataRubySapphireEmerald[this.starterString].type_1
            var pkmnType2 = this.dexDataRubySapphireEmerald[this.starterString].type_2
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
        
        //STACK OVERFLOW ERROR CURRENTLY OCCURING WITH THIS FORMULA
        typeEffectiveness(x) { //x = move1.value
            if (this.typeCalcs == true && this.g3stateVariable == "Battle" && this.mapper.properties.battle.trainer.opponentA.value != "LEADER_TATE_AND_LIZA_1") { //calculates effective power when in battle
                // console.log("If statement for battle")
                var attackingType = this.moveType(x)
                var defendingTypeMono = this.mapper.properties.battle.enemyPokemon.type1.value
                var defendingType1 = this.mapper.properties.battle.enemyPokemon.type1.value
                var defendingType2 = this.mapper.properties.battle.enemyPokemon.type2.value
                var multipliers = this.typeData.find(x => x.moveType === attackingType)
                var weatherBoost = this.weatherModifier(this.mapper.properties.battle.turnInfo.battleWeather.value, x, this.moveType(x))
                var movePowerForCalculation = this.movePower(x)

                //ADDITIONAL MODIFIERS
                var stabModifier = this.determineSTAB(x) //on
                // var stabModifier = 1 //off
                var itemBoost = this.determineItemBoost(x) //on
                // var itemBoost = 1 //off

                //NO MOVE POWER (STATUS MOVE)
                if (this.movePower(x) == "-") {
                    // console.log("If no power")
                    return this.movePower(x)
                }
                //LEVITATE INTERACTION
                else if (this.mapper.properties.battle.enemyPokemon.ability.value == "LEVITATE" && attackingType == "Ground") {
                    // console.log("If levitate")
                    return 0
                }
                //NO ENEMY DATA (HAVEN'T BATTLED SINCE RELOADING ROM OR SAVE)
                else if (this.mapper.properties.battle.enemyPokemon.type1 == null) {
                    // console.log("If no enemy")
                    return Math.floor(this.movePower(x) * stabModifier * itemBoost)
                }
                //ATTACKING A MONO-TYPE POKEMON
                else if (this.mapper.properties.battle.enemyPokemon.type1.value === this.mapper.properties.battle.enemyPokemon.type2.value) {
                    // console.log("If mono type Pokemon")
                    var multiplier1 = multipliers[defendingTypeMono]
                    return Math.floor(this.movePower(x) * multiplier1 * stabModifier * itemBoost * weatherBoost)
                }
                //ATTACKING A DUAL-TYPE POKEMON
                else if (this.mapper.properties.battle.enemyPokemon.type1 != this.mapper.properties.battle.enemyPokemon.type2) {
                    // console.log("If dual type Pokemon")
                    var multipliers = this.typeData.find(x => x.moveType == attackingType)
                    var multiplier1 = multipliers[defendingType1]
                    var multiplier2 = multipliers[defendingType2]
                    return Math.floor(this.movePower(x) * multiplier1 * multiplier2 * stabModifier * itemBoost * weatherBoost)
                }
                //RETURN THE MOVES POWER IF NOTHING ELSE WORKS
                else {
                    // console.log("Else value")
                    return Math.floor(this.movePower(x) * this.determineSTAB(x))
                }
            }
            //RETURN THE MOVES POWER IF NOT IN BATTLE
            else {
                //ADDITIONAL MODIFIERS
                var stabModifier = this.determineSTAB(x) //on
                // var stabModifier = 1 //off
                var itemBoost = this.determineItemBoost(x) //on
                // var itemBoost = 1 //off
                
                if (this.movePower(x) == "-") {
                    return this.movePower(x)
                }
                return Math.floor(this.movePower(x) * this.determineSTAB(x) * itemBoost) //returns the move's base power if not in battle
            }   
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
            if (this.emeraldTrainers[this.mapper.properties.battle.trainer.opponentAId]["pokemon"].length == 1) {
                return "height: 234px;"
            }
            else if (this.emeraldTrainers[this.mapper.properties.battle.trainer.opponentAId]["pokemon"].length == 2) {
                return "height: 402px;"
            }
            else if (this.emeraldTrainers[this.mapper.properties.battle.trainer.opponentAId]["pokemon"].length == 3) {
                return "height: 566px;"
            }
            else if (this.emeraldTrainers[this.mapper.properties.battle.trainer.opponentAId]["pokemon"].length == 4) {
                return "height: 736px;"
            }
            else if (this.emeraldTrainers[this.mapper.properties.battle.trainer.opponentAId]["pokemon"].length == 5) {
                return "height: 902px;"
            }
            else if (this.emeraldTrainers[this.mapper.properties.battle.trainer.opponentAId]["pokemon"].length == 6) {
                return "height: 1080px;"
            }
        },
    },
    

//--------- PROGRAM MOUNTED ---------------------------------------------------------------------------------------------------------------//
    mounted: async function () {
        const that = this
        this.mapper = new GameHookMapperClient()
        this.mapper.onConnected = (x) => this.ready = true
        this.mapper.onDisconnected = (x) => this.ready = false
        await this.mapper.connect()

        //BUFFER ASSIGNMENT
        // this.mapper.properties.pointers.callback1.change(async (x) => {
        //     if (this.mapper.properties.pointers.callback1) {
        //         this.buffer_move1 = this.pascalCaseSpace(this.camelCase(this.mapper.properties.player.team[0].move1.value))
        //         this.buffer_move2 = this.pascalCaseSpace(this.camelCase(this.mapper.properties.player.team[0].move2.value))
        //         this.buffer_move3 = this.pascalCaseSpace(this.camelCase(this.mapper.properties.player.team[0].move3.value))
        //         this.buffer_move4 = this.pascalCaseSpace(this.camelCase(this.mapper.properties.player.team[0].move4.value))
        //         this.buffer_power_move1 = this.typeEffectiveness(this.mapper.properties.player.team[0].move1.value)
        //         this.buffer_power_move2 = this.typeEffectiveness(this.mapper.properties.player.team[0].move2.value)
        //         this.buffer_power_move3 = this.typeEffectiveness(this.mapper.properties.player.team[0].move3.value)
        //         this.buffer_power_move4 = this.typeEffectiveness(this.mapper.properties.player.team[0].move4.value)
        //         this.buffer_move1pp = this.mapper.properties.player.team[0].move1pp.value
        //         this.buffer_move2pp = this.mapper.properties.player.team[0].move2pp.value
        //         this.buffer_move3pp = this.mapper.properties.player.team[0].move3pp.value
        //         this.buffer_move4pp = this.mapper.properties.player.team[0].move4pp.value
        //         this.buffer_exp = this.mapper.properties.player.team[0]?.expPoints.value
        //         this.buffer_heldItem = this.mapper.properties.player.team[0].heldItem.value
        //     }
        // })

        //GAMESTATE MANAGEMENT
        // set initial gamestate value when the layout is loaded
        if (this.mapper.properties.player.team[0].level.value == 0) 
            this.g3stateVariable = "Base Stats"
        else if (this.mapper.properties.pointers.callback1.value == null)
            this.g3stateVariable = "Base Stats"
        else if (this.mapper.properties.pointers.callback1.value == "Overworld")
            this.g3stateVariable = "Overworld"
        else if (this.mapper.properties.pointers.callback1.value == "Battle") {
            if (this.mapper.properties.pointers.callback1.value == "Battle Animation") {
                this.g3stateVariable = "To Battle"
            }
            else if (this.mapper.properties.pointers.callback1.value == "Battle") {
                this.g3stateVariable = "Battle"
            }
        }
        else
            this.g3stateVariable = "Battle"

        // wait for events to change the state
        this.mapper.properties.pointers.callback1.change((prop) => {
            if (prop.value == "Overworld") { this.g3stateVariable = "Overworld" } 
        });

        this.mapper.properties.battle.turnInfo.battleDialogue.change((prop) => {
            if (prop.value == "Player Control") { this.g3stateVariable = "Battle"}
        })

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
            // if (prop.value == "WON") { this.g3stateVariable = "From Battle - Won"}
            // if (prop.value == "LOST") { this.g3stateVariable = "From Battle - Lost"}
            // if (prop.value == "DRAW") { this.g3stateVariable = "From Battle - Draw"}
            // if (prop.value == "RAN") { this.g3stateVariable = "From Battle - Ran"}
            // if (prop.value == "CAUGHT") { this.g3stateVariable = "From Battle - Caught"}
            // if (prop.value == "PLAYER_TELEPORTED") { this.g3stateVariable = "From Battle - Player_Teleported"}
            // if (prop.value == "POKEMON_FLED") { this.g3stateVariable = "From Battle - Fled"}
            // if (prop.value == "NO_SAFARI_BALLS") { this.g3stateVariable = "From Battle - No_Safari_Balls"}
            // if (prop.value == "FORFEITED") { this.g3stateVariable = "From Battle - Forfeited"}
            // if (prop.value == "POKEMON_TELEPORTED") { this.g3stateVariable = "From Battle - Teleported"}
        });9

        this.mapper.properties.pointers.callback2.change((prop) => {
            if (prop.value == "Owners") { 
                this.g3stateVariable = "Base Stats"
            }
            else if (prop.value == "Battle Animation") { 
                this.g3stateVariable = "To Battle"
            }
        });


        // TRACK VARIABLES HERE ------------------------------------------------------------------------------------------------//
        this.mapper.properties.gameTime.seconds.change(async (x) => {
            if (this.mapper.properties.battle.yourPokemon.species.value != null) {
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

        //THIS FUNCTION MANAGES BADGE BOOSTS
        const badgeBoostSwitch = async () => {
            if (this.mapper.properties.player.badges.badge1 == true) //check badges
                this.boostAttack = true //set badge boost
            if (this.mapper.properties.player.badges.badge3 == true) //check badges
                this.boostSpeed = true //set badge boost
            if (this.mapper.properties.player.badges.badge5 == true) //check badges
                this.boostDefense = true //set badge boost
            if (this.mapper.properties.player.badges.badge6 == true) //check badges
                this.boostSpecial = true //set badge boost
        }

        // ---------------------------------------------------------------------------------------------------------------------//
        // MODIFY GAMEHOOK PROPERTIES ------------------------------------------------------------------------------------------//
        // ---------------------------------------------------------------------------------------------------------------------//
        // this.currentGameState.change(async (x) => {
        //     await gamestateManagement()
        // })
        this.mapper.properties.battle.turnInfo.battleOutcome.change(async (x) => {
            await stageMods()
        })
        // this.mapper.properties.player.team[0].personalityValue.value.change(async (x) => {
        //     await onLoad()
        // })
        // this.mapper.properties.player.team[0].ivEggAbilityBlock.change(async (x) => {
        //     await setPokemon()
        // })
        this.mapper.properties.player.badges.badge1.change(async (x) => {
            await badgeBoostSwitch()
        })
        this.mapper.properties.player.badges.badge3.change(async (x) => {
            await badgeBoostSwitch()
        })
        this.mapper.properties.player.badges.badge5.change(async (x) => {
            await badgeBoostSwitch()
        })
        this.mapper.properties.player.badges.badge7.change(async (x) => {
            await badgeBoostSwitch()
        })
        this.mapper.properties.player.team[0].move1.change(async (x) => {
            if (x.value == null) {
                return
            }
            that.move1 = x
        })

        //EXP BAR ANIMATION FUNCTION
        var species = this.mapper.properties.player.team[0].species.value;
        var growthRate = this.dexDataRubySapphireEmerald[species].growth_rate
        var expStats = this.calcExpStats(growthRate, this.mapper.properties.player.team[0].expPoints.value);
        this.$refs.expBar.style.width = (expStats.percent * 100) + "%";
        this.prevSpecies = species

        this.mapper.properties.player.team[0].expPoints.change(async (newProp, oldProp) => {
            if (this.expBarAnimation == true) {
                const currSpecies = this.mapper.properties.player.team[0].species.value;
                const growthRate = this.dexDataRubySapphireEmerald[currSpecies].growth_rate
                const oldExpStats = this.calcExpStats(growthRate, oldProp.value);
                const newExpStats = this.calcExpStats(growthRate, newProp.value);
                console.log(oldExpStats, newExpStats, oldProp)
    
                if (oldProp.value == newProp.value) { return }
                // did we switch out?
                // there is still a bug here. what if we changed to the same species?
                if (this.g1stateVariable == `Overworld`) {
                    this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                }
                else if (this.prevSpecies != currSpecies) {
                    // update prevSpecies
                    console.log("prevSpecies != currSpecies")

                    this.prevSpecies = currSpecies; 
                    // dont animate, just set newExpStats.percent
                    this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                } 
                // same pokemon but exp changed
                else {
                    if (oldExpStats.level == newExpStats.level) {
                        console.log("If")
                        // animate width to newExpStats.percent
                        this.$refs.expBar.style.transition = 'width 200ms ease-in-out';
                        this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                        await this.sleep(250);
                    } else {
                        console.log("Else")
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
    },
}).mount('#app')