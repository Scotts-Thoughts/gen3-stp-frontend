function enemy_move_power(move_name) {
    var move_power = this.generation_3_moves[move_name].power ?? 0
    if (move_power == 0) { return "—" }
    if (move_power == 1) { return "—" }
    else return move_power
}

function enemy_effective_power(move_name, enemy_mon, slot) {
    const state = this.g3stateVariable
    const enemy_state = this.enemyState
    if (state == 'To Battle' || state == 'Battle' || state == 'From Battle') { 
        const species = enemy_mon.species.value
        const move_data = this.generation_3_moves[move_name]
        if (move_data == undefined) { return }
        const move_type = move_data.type
        const move_base_power = this.enemy_move_power(move_name) ?? move_data.power
        const move_category = move_data.category
        const user_type_1 = this.game.dexData[species].type_1
        const user_type_2 = this.game.dexData[species].type_2
        const target_type_1 = this.mapper.properties.battle.yourPokemon.type1.value
        const target_type_2 = this.mapper.properties.battle.yourPokemon.type2.value
        if (move_base_power == "—" || move_base_power == "-") { return "—" }
        var move_effective_power = move_base_power
        var modifier_effectiveness_1 = this.typeData.find(x => x.moveType == move_type)[target_type_1]
        var modifier_effectiveness_2 = target_type_2 && move_type && (target_type_1 != target_type_2) ? this.typeData.find(x => x.moveType == move_type)[target_type_2]
            : 1
        var modifier_stab = move_type == user_type_1 ? 1.5 
            : move_type == user_type_2 ? 1.5 
            : 1
        var modifier_ability = this.abilityModifier(this.mapper.properties.battle.enemyPokemon, move_type, 'opponent')
        if (this.mapper.properties.battle.yourPokemon.ability.value == 'Levitate' && move_type == 'Ground') {
            modifier_ability = 0 
        }
        var modifier_item = 1
        var modifier_weather = this.weatherModifier(this.mapper.properties.battle.field.weather.value, move_name, move_type)
        var modifier_burn = 1
        if (move_category == "Physical" && enemy_mon.status_condition?.value == `Burned` && enemy_mon.ability?.value != `Guts`) {
            modifier_burn = 0.5
            }
        else {
            modifier_burn = 1
        }
        //Calculate effective power
        if (this.typeCalcs == true) { //Handles type effectiveness calculations in battle
            return Math.floor(move_base_power * modifier_stab * modifier_effectiveness_1 * modifier_effectiveness_2 * modifier_ability * modifier_item * modifier_weather * modifier_burn)
        }
    }
}

function typeEffectiveness(x) { //x = move1.value
    var attackingType = this.moveType(x)
    var power = this.movePower(x)
    const enemyPokemon = this.mapper.properties.battle.enemyPokemon;
    var defendingTypeMono = enemyPokemon.type1.value
    var defendingType1 = defendingTypeMono;
    var defendingType2 = enemyPokemon.type2.value
    var multipliers = this.typeData.find(x => x.moveType === attackingType)
    var stabModifier = this.determineSTAB(x)
    var ability = this.abilityModifier(this.pkmn_ability, attackingType, 'player')
    var defenseAbility = 1;
    var itemBoost = this.determineItemBoost(x)
    var weatherBoost = this.weatherModifier(this.mapper.properties.battle.turnInfo.battleWeather.value, x, this.moveType(x))
    var burnModifier = this.burnModifier(x)
    const enemyAbility = this.mapper.properties.battle.enemyPokemon.ability.value;
    if (x == "FUTURE SIGHT") { return 80 }
    //IN BATTLE
    // try{ 
    //     if (this.batt.trainer[this.game.opponent].value == `LEADER_TATE_AND_LIZA_1` || this.batt.trainer[this.game.opponent].value == `MAGMA_LEADER_MAXIE_MOSSDEEP`) {
    //         return power
    //     }
    // }
    // catch {
    //     // console.log("null opponent, no double battle power")
    // }

    //NOT IN BATTLE
    if(this.g3stateVariable != "Battle") {
        if (power == "-") { return power }
        return Math.floor(power * stabModifier * itemBoost * ability * burnModifier);
    }
    // console.log(multiplier1,multiplier2,attackingType,defendingType1,defendingType2)

    //Handle double battles
    if(this.g3stateVariable == "Battle" && this.batt.type?.double.value) {
        if (power == "-") { return power }
        return Math.floor(power * stabModifier * itemBoost * ability * burnModifier);
    }
    if (this.typeCalcs && this.g3stateVariable == "Battle") {
        let abilityImmunities = {
            "LEVITATE" : "Ground",
            "VOLT ABSORB" : "Electric",
            "WATER ABSORB" : "Water",
            "FLASH FIRE" : "Fire" 
        }
        let soundProofMoves = ["HYPER VOICE", "SNORE", "UPROAR"];
        if(enemyAbility == "SOUNDPROOF" && soundProofMoves.includes(x)) {
            return 0;
        }
        if (enemyAbility == "THICK FAT" && (attackingType == "Ice" || attackingType == "Fire")) {
            defenseAbility = .5;
        }

        //STATUS MOVE
        if (power == "-") { return power }
        //LEVITATE INTERACTION
        
        else if (abilityImmunities[enemyAbility] == attackingType) {
            return 0;
        }
        //NO ENEMY DATA (HAVEN'T BATTLED SINCE RELOADING ROM OR SAVE)
        else if (defendingType1 == null) {
            return Math.floor(power * stabModifier * itemBoost * ability * burnModifier)
        }
        //ATTACKING A MONO-TYPE POKEMON
        else if (defendingType1 === defendingType2) {
            var multiplier1 = multipliers[defendingTypeMono]
            return Math.floor(power * multiplier1 * stabModifier * itemBoost * weatherBoost * ability * burnModifier * defenseAbility)
        }
        //ATTACKING A DUAL-TYPE POKEMON
        else if (defendingType1 != defendingType2) {
            var multipliers = this.typeData.find(x => x.moveType == attackingType)
            var multiplier1 = multipliers[defendingType1]
            var multiplier2 = multipliers[defendingType2]
            // console.log(multiplier1,multiplier2,attackingType,defendingType1,defendingType2)
            return Math.floor(power * multiplier1 * multiplier2 * stabModifier * itemBoost * weatherBoost * ability * burnModifier * defenseAbility)
        }
        //RETURN THE MOVES POWER IF NOTHING ELSE WORKS
        else {
            return Math.floor(power * stabModifier * burnModifier)
        }
    }
        
}
////This needs to be updated
function type_effectiveness(pkmnData, moveNumber, enemyData) { //pkmnData = team[0] etc
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
}