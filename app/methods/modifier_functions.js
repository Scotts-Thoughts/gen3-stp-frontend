function determineSTAB(x) { //x = move1.value
    var pkmnType1 = this.dexData[this.starterString].type_1
    var pkmnType2 = this.dexData[this.starterString].type_2
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
    if(this.weatherDenial) {
        return mod;
    }
    if(move == "WEATHER BALL" && !(weather == null || weather =="" || weather == undefined)) {
        mod *= 2;
    }
    if (weather == "Sun" && moveType == "Water") {
        return mod * .5;
    }
    else if (weather == "Sun" && moveType == "Fire") {
        return mod * 1.5
    }
    else if (weather == "Rain" && moveType == "Water") {
        return mod * 1.5
    }
    else if (weather == "Rain" && moveType == "Fire") {
        return mod * .5
    }
    else if (weather == "Rain" && move == "SOLARBEAM") {
        return mod * .5
    }
    else if (weather == "Sandstorm") {
        return mod * 1
    }
    else {
        return mod * 1
    }
}