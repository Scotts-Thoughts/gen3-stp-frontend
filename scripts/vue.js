// import method1 from methods

// TODO Add type icon selection based on starter

const app = Vue.createApp({
            
    //DATA & DEFINITIONS
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
            gamestateLogging: true,
            currentGameState: "Initialization",
            simpleGameState: "Out of Game",
            currentGameStateNew: "Initialization",
            simpleGameStateNew: "Out of Game",
            gameStarted:  true, //tracks if the player has a save game or not
            playerID: 999,
            g3stateVariable: "Base Stats",
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
                console.log("Display State Error: there is not set display state for the current gamestate. Displaying the default display state as a result.")
                return "display-default"
        },

        versionCheck() {
            if (this.mapper.meta.gameName == "Pokemon Emerald")
                return "emerald"
            else if (this.mapper.meta.gameName == "Pokemon FireRed & LeafGreen")
                return "remakes-scaled"
            else return "Version Error"
        },

        /// STATES TO TRACK ///
        // TODO (1) "New Game"
        // TODO (2) "No Pokemon"
        // TODO (3) "Overworld"
        // TODO (4) "To Battle"
        // TODO (5) "Battle"
        // TODO (6) "Double-Battle"
        // TODO (7) "From Battle"
        // TODO (8) "Reset"
        // TODO (9) "Reset Overworld"
        // TODO (10) "Error"
        /// VARIABLES REQUIRED ///
        // TODO currentGameState
        // TODO playerID
        // TODO gameStarted
        // ! Currently not tracking resets well
        // tracking battle well
        // tracking reset well
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

        //GAMESTATE TRACKING 
        //(GEN 3 GAMES; EMERALD TESTED; FIRERED&LEAFGREEN UNTESTED; RUBY&SAPPHIRE UNTESTED;)
        // gen3Gamestate() {
        //     if (this.mapper.properties.battle.turnInfo.battleDialogue.bytes == 18) {
        //         this.currentGameState = "Battle"
        //         this.gameStarted = true
        //         this.bufferAbility = this.mapper.properties.battle.yourPokemon.ability.value
        //         this.bufferNature = this.mapper.properties.player.team[0].personalityValue.value
        //         this.bufferHeldItem = this.mapper.properties.player.team[0].itemHeld.value
        //         this.bufferLevel = this.mapper.properties.player.team[0].level.value
        //         console.log(this.bufferNature)
        //         console.log(this.bufferAbility)
        //         console.log(this.bufferHeldItem)
        //         console.log(this.bufferLevel)
        //         console.log(this.gameStarted)
        //         return "Battle"
        //     }
            // else if (
            //     this.gameStarted == false && 
            //     this.mapper.properties?.player?.teamCount == 0 
            //     ) 
            //     {
            //     this.currentGameState = "New Game"
            //     console.log("Gamestate: (0) New Game")
            //     console.log(this.bufferNature)
            //     console.log(this.bufferAbility)
            //     console.log(this.bufferHeldItem)
            //     console.log(this.bufferLevel)
            //     console.log(this.gameStarted)
            //     return "New Game"
            // }
            // else if (
            //     this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
            //     this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value == 0 &&
            //     this.mapper.properties?.player?.teamCount == 0 &&
            //     this.gameStarted == true
            //     ) 
            //     {
            //     this.currentGameState = "Reset"
            //     console.log("Gamestate: (1) Initialization")
            //     console.log(this.bufferNature)
            //     console.log(this.bufferAbility)
            //     console.log(this.bufferHeldItem)
            //     console.log(this.bufferLevel)
            //     return "Reset"
            // }
            // else if (
            //     this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
            //     this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            //     this.currentGameState == "New Game"
            //     )
            //     {
            //     console.log("Pokemon Obtained!")

            //     return "To Battle"    
            //     }
            // else if (
            //     this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
            //     this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            //     this.currentGameState == "Initialization"
            //     ||
            //     this.mapper.properties.battle.turnInfo.battleOutcome.bytes > 0 && 
            //     this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            //     this.currentGameState == "Overworld"
            //     ||
            //     this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
            //     this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            //     this.currentGameState == "Overworld"
            //     )
            //     {
            //     this.fixMove1 = this.camelCase(this.mapper.properties.player.team[0].move1.value)
            //     this.fixMove1pp = this.mapper.properties.player.team[0].move1pp
            //     this.fixMove1effectiveness = this.typeEffectiveness(this.mapper.properties.player.team[0].move1.value)
            //     this.fixMove1icon = this.moveTypeIcon(this.mapper.properties.player.team[0].move1.value)

            //     this.currentGameState == "To Battle"
            //     console.log("Gamestate: (3) End of Battle")
            //     return "To Battle"    
            //     }
            // else if (
            //     this.mapper.properties.battle.turnInfo.battleOutcome.bytes > 0 && 
            //     this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            //     this.currentGameState == "Battle"
            //     )
            //     {
            //     console.log("Gamestate: (3) End of Battle")
            //     return "From Battle"    
            //     }
            // else if (
            //     this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
            //     this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            //     this.currentGameState == "Battle"
            //     ) 
            //     {
            //     console.log("Gamestate: (2) Battle")
            //     return "Battle"
            // }
            // else if (
            //     this.mapper.properties.battle.turnInfo.battleOutcome.bytes > 0 && 
            //     this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value == 0
            //     ) 
            //     {
            //     this.currentGameState = "Overworld"
            //     console.log("Gamestate: (3) Overworld")
            //     return "Overworld"
            // }
            // else if (
            //     this.mapper.properties?.player?.teamCount > 0
            //     ) 
            //     {
            //     this.currentGameState = "Overworld"
            //     console.log("Gamestate: (3) Overworld - Error")
            //     return "Overworld"
            // }
        //     else {
        //         console.log("Gamestate: (5) Unknown Gamestate (ERROR)")
        //         return "ERROR"
        //     }
        // },

        growthRate() {
            console.log(this.dexDataRubySapphireEmerald)
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
        
        //EXPERIENCE FUNCTIONS
        expPercent(x) {
            return this.expPercentSlow(x)
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
            if (weather == "Sunny" && moveType == "Water") {
                return .5
            }
            else if (weather == "Sunny" && moveType == "Fire") {
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
                var moveType = move[`Type`].toLowerCase()
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
            if (this.typeCalcs == true && this.g3state() == "Battle" && this.mapper.properties.battle.trainer.opponentA.value != "LEADER_TATE_AND_LIZA_1") { //calculates effective power when in battle
                console.log("If statement for battle")
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
                    console.log("If no power")
                    return this.movePower(x)
                }
                //LEVITATE INTERACTION
                else if (this.mapper.properties.battle.enemyPokemon.ability.value == "LEVITATE" && attackingType == "Ground") {
                    console.log("If levitate")
                    return 0
                }
                //NO ENEMY DATA (HAVEN'T BATTLED SINCE RELOADING ROM OR SAVE)
                else if (this.mapper.properties.battle.enemyPokemon.type1 == null) {
                    console.log("If no enemy")
                    return Math.floor(this.movePower(x) * stabModifier * itemBoost)
                }
                //ATTACKING A MONO-TYPE POKEMON
                else if (this.mapper.properties.battle.enemyPokemon.type1.value === this.mapper.properties.battle.enemyPokemon.type2.value) {
                    console.log("If mono type Pokemon")
                    var multiplier1 = multipliers[defendingTypeMono]
                    return Math.floor(this.movePower(x) * multiplier1 * stabModifier * itemBoost * weatherBoost)
                }
                //ATTACKING A DUAL-TYPE POKEMON
                else if (this.mapper.properties.battle.enemyPokemon.type1 != this.mapper.properties.battle.enemyPokemon.type2) {
                    console.log("If dual type Pokemon")
                    var multipliers = this.typeData.find(x => x.moveType == attackingType)
                    var multiplier1 = multipliers[defendingType1]
                    var multiplier2 = multipliers[defendingType2]
                    return Math.floor(this.movePower(x) * multiplier1 * multiplier2 * stabModifier * itemBoost * weatherBoost)
                }
                //RETURN THE MOVES POWER IF NOTHING ELSE WORKS
                else {
                    console.log("Else value")
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

        //GAMESTATE MANAGEMENT
        // set initial gamestate value when the layout is loaded
        if (this.mapper.properties.player.team[0].level.value == 0) 
            this.g3stateVariable = "Base Stats";
        else if (this.mapper.properties.pointers.callback1.value == null)
            this.g3stateVariable = "Base Stats";
        else if (this.mapper.properties.pointers.callback1.value == "Overworld")
            this.g3stateVariable = "Overworld";
        else if (this.mapper.properties.pointers.callback1.value == "Battle") {
            if (this.mapper.properties.pointers.callback1.value == "Battle Animation") {
                this.g3stateVariable = "To Battle"
            }
            else if (this.mapper.properties.pointers.callback1.value == "Battle") {
                this.g3stateVariable = "Battle"
            }
        }
        else
            this.g3stateVariable = "Battle";

        // wait for events to change the state
        this.mapper.properties.pointers.callback1.change((prop) => {
            if (prop.value == "Overworld") { this.g3stateVariable = "Overworld"; } 
            else if (prop.value == "Reset") { this.g3stateVariable = "Overworld"; } 
            else if (prop.value == "Battle") { this.g3stateVariable = "To Battle"; } 
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
            if (prop.value == "Owners") { this.g3stateVariable = "Reset"}
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
    },
}).mount('#app')