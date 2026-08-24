function determineSTAB(x) { //x = move1.value
    var species = (this.evolution && this.selected_evolution_species) ? this.selected_evolution_species : this.starterString;
    var pkmnType1 = this.dexData[species].type_1
    var pkmnType2 = this.dexData[species].type_2
    if (this.g3stateVariable == `Battle`) {
        //suport transform or conversion
        var pkmnType1 = this.mapper.properties.battle.yourPokemon.type1.value
        var pkmnType2 = this.mapper.properties.battle.yourPokemon.type2.value
    }

    if (pkmnType1 == this.moveType(x) || pkmnType2 == this.moveType(x)) {
        return 1.5
    }
    else { 
        return 1 
    }
}
function determineItemBoost(x) { //x - move1.value
    var heldItemValue = this.mapper.properties.player.team[0].itemHeld.value
    var itemType = this.typeBoostingItems[heldItemValue]
    if (itemType == this.moveType(x)) {
        return 1.1
    }
    else   
        return 1
}
function abilityModifier(ability, attackingType, controller) {
    var healthPercentage = 0
    switch (controller) {
        case "player": healthPercentage = this.s1.hp.value / this.s1.maxHp.value; break;
        case "opponent": healthPercentage = this.mapper.properties.battle.enemyPokemon.hp.value / this.mapper.properties.battle.enemyPokemon.maxHp.value; break;
    }
    if (healthPercentage <= 1/3) {
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
}
function burnModifier(x) {
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
}
//y = mod stage, x = stat value
function stageMultiplier(y,x) { 
    // if (this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && y != 0 && y != null && y != undefined && this.mapper.properties.battle.yourPokemon.species != null) {
    if (this.g3stateVariable == "Battle") {
        var multiplier = this.stageModifiersData.find(x => x.modType === "stat")
        var statValue = Math.floor(x * multiplier[y.toString()])
        return statValue
    }
    else
        return x
}
function weatherModifier(weather, move, moveType) {
    let mod = 1;
    // console.log(weather, move, moveType);
    // Move names reach this function in two spellings: the raw mapper value ("WEATHER BALL")
    // and the display-formatted name from move_name/camelCase ("Weather Ball"). Normalize so
    // the checks below match either one.
    const move_key = move == null ? "" : move.toString().toUpperCase().replace(/[\s-]/g, "")
    if(this.weatherDenial) {
        return mod;
    }
    if(move_key == "WEATHERBALL" && !(weather == null || weather =="" || weather == undefined)) {
        mod *= 2;
    }
    if (weather == "Sun" && moveType == "Water") {
        return mod * 0.5;
    }
    else if (weather == "Sun" && moveType == "Fire") {
        return mod * 1.5
    }
    else if (weather == "Rain" && moveType == "Water") {
        return mod * 1.5
    }
    else if (weather == "Rain" && moveType == "Fire") {
        return mod * 0.5
    }
    else if (weather == "Rain" && move_key == "SOLARBEAM") {
        return mod * 0.5
    }
    else if (weather == "Sandstorm") {
        return mod * 1
    }
    else {
        return mod * 1
    }
}