methods: { 
        
        
    /// STATES TO TRACK ///
    // TODO (1) "New Game"
    // TODO (2) "No Pokemon"
    // TODO (3) "Reset"
    // TODO (4) "Reset Overworld"
    // TODO (5) "Overworld"
    // TODO (6) "To Battle"
    // TODO (7) "Battle"
    // TODO (8) "From Battle"
    // ! Currently not tracking resets well
    // tracking battle well
    // tracking reset well

    
    //GAMESTATE TRACKING 
    //(GEN 3 GAMES; EMERALD TESTED; FIRERED&LEAFGREEN UNTESTED; RUBY&SAPPHIRE UNTESTED;)
    gen3Gamestate() {
        if (this.mapper.properties.battle.turnInfo.battleDialogue.bytes == 18) {
            this.currentGameState = "Battle"
            this.gameStarted = true
            this.bufferAbility = this.mapper.properties.battle.yourPokemon.ability.value
            this.bufferNature = this.mapper.properties.player.team[0].personalityValue.value
            this.bufferHeldItem = this.mapper.properties.player.team[0].itemHeld.value
            this.bufferLevel = this.mapper.properties.player.team[0].level.value
            console.log(this.bufferNature)
            console.log(this.bufferAbility)
            console.log(this.bufferHeldItem)
            console.log(this.bufferLevel)
            console.log(this.gameStarted)
            return "Battle"
        }
        else if (
            this.gameStarted == false && 
            this.mapper.properties?.player?.teamCount == 0 
            ) 
            {
            this.currentGameState = "New Game"
            console.log("Gamestate: (0) New Game")
            console.log(this.bufferNature)
            console.log(this.bufferAbility)
            console.log(this.bufferHeldItem)
            console.log(this.bufferLevel)
            console.log(this.gameStarted)
            return "New Game"
        }
        else if (
            this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
            this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value == 0 &&
            this.mapper.properties?.player?.teamCount == 0 &&
            this.gameStarted == true
            ) 
            {
            this.currentGameState = "Reset"
            console.log("Gamestate: (1) Initialization")
            console.log(this.bufferNature)
            console.log(this.bufferAbility)
            console.log(this.bufferHeldItem)
            console.log(this.bufferLevel)
            return "Reset"
        }
        // else if (
        //     this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
        //     this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
        //     this.currentGameState == "New Game"
        //     )
        //     {
        //     console.log("Pokemon Obtained!")

        //     return "To Battle"    
        //     }
        else if (
            this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
            this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            this.currentGameState == "Initialization"
            ||
            this.mapper.properties.battle.turnInfo.battleOutcome.bytes > 0 && 
            this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            this.currentGameState == "Overworld"
            ||
            this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
            this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            this.currentGameState == "Overworld"
            )
            {
            this.fixMove1 = this.camelCase(this.mapper.properties.player.team[0].move1.value)
            this.fixMove1pp = this.mapper.properties.player.team[0].move1pp
            this.fixMove1effectiveness = this.typeEffectiveness(this.mapper.properties.player.team[0].move1.value)
            this.fixMove1icon = this.moveTypeIcon(this.mapper.properties.player.team[0].move1.value)

            this.currentGameState == "To Battle"
            console.log("Gamestate: (3) End of Battle")
            return "To Battle"    
            }
        else if (
            this.mapper.properties.battle.turnInfo.battleOutcome.bytes > 0 && 
            this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            this.currentGameState == "Battle"
            )
            {
            console.log("Gamestate: (3) End of Battle")
            return "From Battle"    
            }
        else if (
            this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && 
            this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value > 0 &&
            this.currentGameState == "Battle"
            ) 
            {
            console.log("Gamestate: (2) Battle")
            return "Battle"
        }
        else if (
            this.mapper.properties.battle.turnInfo.battleOutcome.bytes > 0 && 
            this.mapper.properties.battle.turnInfo.battleBackgroundTiles.value == 0
            ) 
            {
            this.currentGameState = "Overworld"
            console.log("Gamestate: (3) Overworld")
            return "Overworld"
        }
        else if (
            this.mapper.properties?.player?.teamCount > 0
            ) 
            {
            this.currentGameState = "Overworld"
            console.log("Gamestate: (3) Overworld - Error")
            return "Overworld"
        }
        else {
            console.log("Gamestate: (5) Unknown Gamestate (ERROR)")
            return "ERROR"
        }
    },