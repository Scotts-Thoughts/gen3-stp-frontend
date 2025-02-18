function movePower(y) { //y = move1.value
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
            if (this.g3stateVariable != "Battle") { return "-" }
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
}

// Edge case moves
function hiddenPowerTypeCalc(x) { //x = slot number
    ivHpBit = x.ivHp % 2
    ivAtkBit = x.ivAttack % 2
    ivDefBit = x.ivDefense % 2
    ivSpdBit = x.ivSpeed % 2
    ivSpcABit = x.ivSpecialAttack % 2
    ivSpcDBit = x.ivSpecialDefense % 2
    type = this.hiddenPowerTypes[(Math.floor(((ivHpBit + (2 * ivAtkBit) + (4 * ivDefBit) + (8 * ivSpdBit) + (16 * ivSpcABit) + (32 * ivSpcDBit)) * 5)/21))]
    return type
}
function hiddenPowerPowerCalc(x) { //x = slot number
    if (this.mapper.properties.player.teamCount.value == 0) { return 70 }
    ivHpBit = ((x.ivHp & 2) >> 1)
    ivAtkBit = ((x.ivAttack & 2) >> 1)
    ivDefBit = ((x.ivDefense & 2) >> 1)
    ivSpdBit = ((x.ivSpeed & 2) >> 1)
    ivSpcABit = ((x.ivSpecialAttack & 2) >> 1)
    ivSpcDBit = ((x.ivSpecialDefense & 2) >> 1)
    return Math.floor((((ivHpBit + (2 * ivAtkBit) + (4 * ivDefBit) + (8 * ivSpdBit) + (16 * ivSpcABit) + (32 * ivSpcDBit)) * 40)/63) + 30 )
}
function weatherBallTypeCalc() {
    if(this.g3stateVariable!="Battle") {
        return "Normal";
    }
    let weatherType = {
        "Sun" : "Fire",
        "Hail" : "Ice",
        "Rain" : "Water",
        "Sandstorm" : "Rock",
        "" : "Normal",
        null : "Normal",
        undefined : "Normal",
    }
    var moveType = weatherType[this.mapper.properties.battle.turnInfo.battleWeather.value];
    return moveType;
}
function g3ReturnPowerCalc(slotNumber) {
    if (slotNumber.friendship.value < 2.5) { var friendshipValue = 2.5 }
    else { var friendshipValue = slotNumber.friendship.value }
    var specialMovePower = Math.floor(friendshipValue/2.5)
    return specialMovePower
}
function g3FrustrationPowerCalc(slotNumber) {
    var friendshipValue = slotNumber.friendship.value
    var specialMovePower = Math.floor((255 - friendshipValue)/2.5)
    if (specialMovePower == 0) {
        specialMovePower = 1
    }
    return specialMovePower
}