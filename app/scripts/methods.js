export function bbAttack(x) {
    if (this.boostAttack == true) {
        return Math.floor(x * 1.1)
    }
    else
        return x
}
export function bbSpeed(x) {
    if (this.boostSpeed == true) {
        return Math.floor(x * 1.1)
    }
    else
        return x
}
export function bbDefense(x) {
    if (this.boostDefense == true) {
        return Math.floor(x * 1.1)
    }
    else
        return x
}
export function bbSpecialAttack(x) {
    if (this.boostSpecial == true) {
        return Math.floor(x * 1.1)
    }
    else
        return x
}
export function bbSpecialDefense(x) {
    if (this.boostSpecial == true) {
        return Math.floor(x * 1.1)
    }
    else
        return x
}
//REMOVES CAPITALIZATION (TACKLE -> Tackle) OR (Tail Whip -> Tail whip)
export function camelCase(str) {
    if (!str || !str.toString()) { return '' }
    return str.toString().replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toUpperCase() : word.toLowerCase();
    })
}
export function getPokemonImageUrl(x) {
    if (x != null)
        return `images/overlay/${x.pokedexNumber}.png`
}
export function getStarterArt() {
    return `images/pokemon/${this.starter}.png`
}
getStarterImageUrl() {
    return `images/overlay/${this.starter}.png`
}
export function getStarterTypeTexture() {
    if (this.pick == true) {
        var type = this.gen3data.find(y => y.dexNumber === this.starter)
        return `images/elements/textures/${type.type1.toLowerCase()}.png`
    }
    else
        return `images/elements/textures/normal.png`
}

//TYPE ICONS FOR THE STARTER SELECTION
export function starterTypeCheck() {
    if (this.pick == true)
        var starterType1 = this.gen3data.find(y => y.dexNumber === this.starter)
        var starterType2 = this.gen3data.find(y => y.dexNumber === this.starter)
        if (starterType2.type2 == null)
            return true
        else   
            return false
}
export function getStarterType1() {
    if (this.pick == true)
        var type = this.gen1data.find(y => y.dexNumber === this.starter)
        return `images/elements/types/${type.type1}.png`
}
export function getStarterType2() {
    if (this.pick == true)
        var type = this.gen1data.find(y => y.dexNumber === this.starter)
        return `images/elements/types/${type.type2}.png`
}

//GAMETIME
export function gameTimeHM(h, m) {
    if (h <= 0) return m;
    if (m < 10) m = "0" + m.toString();
    return `${h}:${m}`;
}

//BADGE GRAPHIC RECALL
export function badgeGraphic(x) {
    if (x.value == true) {
        var badge = x.path.toString().substring(14)
        return `images/badges/${badge}.png`
    }
    else if (x.value == false) {   
        return null
    }
}

//STATUS CONDITION FUNCTIONS
export function statusHealedFix(y) { //this function fixes the status so that when " " is returned it says "cured"
    if (y == " " || y == null || y == undefined)
        return "Cured"
    else
        return y
}
export function statusCheck(y) {
    if (y == null || y == undefined)
        return " "
    else
        return y
}

//GENERAL FUNCTIONS
export function nullCheck(y) {
    if (y != null || y != undefined)
        return y
    else
        return " "
    }
export function pokemon(y, x) {
    if (y != null)
        var pkmnData = this.gen3data.find(x => x.dexNumber === y.toString())
        return pkmnData[x]
}
export function stageModifiers(y) {
    if (y === null) {
        return " "
    }
    else
        if (y > 0) {
            return "+" + y.toString()
        }
        else
            if (y < 0) {
                return y.toString()
            }
            else
                return " "
}
export function species(x) {
    if (x != null && x.value != null)
        return x.value.name
    else
        return null
}
export function natureCalculation(x) {
    var natureKey = (x % 25).toString()
    return this.camelCase(this.natures[natureKey])
}
export function abilityDescription(y) {
    return gen3abilities[y]
}

//BATTLE STATE
export function currentBattleState() {
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
}

//DAMAGE CALCULATIONS
export function damageRange(x, y, z) {
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
}

//GAMETIME FUNCTIONS
export function gameTimeHM(h, m) {
    if (h <= 0) return m;
    if (m < 10) m = "0" + m.toString();
    return `${h}:${m}`;
}
export function gameTimeHMS(h, m, s) {
    if (h <= 0) {
        if (m <= 0) return `${s}`;
        if (s < 10) s = "0" + s.toString();
        return `${m}:${s}`;
    }
    if (s < 10) s = "0" + s.toString();
    if (m < 10) m = "0" + m.toString();
    return `${h}:${m}:${s}`;
}
export function leadZero(y) {
    if (y < 10) return "0" + y.toString();
    return y;
}

//INVENTORY FUNCTIONS
export function itemCheck(y) {
    if (y == "--End of list--") return " ";
    return y;
}
export function ifZero(y) {
    if (y != 0) return y;
    return " ";
}
export function nullToNone(y) {
    if (y == 0) 
        return "None"
    return y
}

//EXPERIENCE FUNCTIONS
export function expPercent(x) {
    return this.expPercentMediumFast(x)
}
export function expPercentFast(x) {
    expBar = ((x.expPoints.value) - ((4 * (Math.pow(x.level.value, 3))) / 5)) / (((4 * (Math.pow(x.level.value + 1, 3))) / 5) - ((4 * (Math.pow(x.level.value, 3))) / 5)) // errors could lurk here
    if (expBar > 1)
        return 100
    else if (expBar < 0)
        return 0
    else
        return expBar * 100
}
export function expPercentMediumFast(x) {
    expBar = (((x.expPoints.value) - (Math.pow(x.level.value, 3))) / ((Math.pow(x.level.value + 1, 3)) - (Math.pow(x.level.value, 3))))
    if (expBar > 1)
        return 100
    else if (expBar < 0)
        return 0
    else
        return expBar * 100
}
export function expPercentMediumSlow(x) { //this formula may be incorrect
    expBar = (((x.expPoints.value) - (((6 / 5) * (Math.pow(x, 3))) - (15 * (Math.pow(x, 2))) + (100 * x) - 140)) / ((((6 / 5) * (Math.pow(x.level.value + 1, 3))) - (15 * (Math.pow(x.level.value, 2))) + (100 * (x.level.value + 1)) - 140) - (Math.pow(x.level.value, 3)))) // errors could lurk here
    if (expBar > 1)
        return 100
    else if (expBar < 0)
        return 0
    else
        return expBar * 100
}
export function expPercentSlow(x) {
    expBar = (((x.expPoints.value) - (Math.floor((5 * (Math.pow(x.level.value, 3))) / 4))) / ((Math.floor((5 * (Math.pow(x.level.value + 1, 3))) / 4)) - (Math.floor((5 * (Math.pow(x.level.value, 3))) / 4)))) // errors could lurk here
    if (expBar > 100)
        return 100
    else if (expBar < 0)
        return 0
    else
        return expBar * 100
}

// MOVE MANAGEMENT
export function movePower(y) { //y = move1.value
    if (y) {
        var move = this.gen3moves.find(x => x.Move.toUpperCase() === y)
        if (y == "RETURN") {
            if (this.mapper.properties.player.team[0].friendship.value < 2.5)
                var friendshipValue = 2.5 
            else 
                var friendshipValue = this.mapper.properties.player.team[0].friendship.value
            var specialMovePower = Math.floor(friendshipValue/2.5)
            return specialMovePower
        }
        else if (y == "FRUSTRATION") {
            if (this.mapper.properties.player.team[0].friendship.value > 252.5)
                var friendshipValue = 252.5 
            else 
                var friendshipValue = this.mapper.properties.player.team[0].friendship.value
            var frustrationPower = Math.floor(255-friendshipValue/2.5)
            return specialMovePower
        }
        else
            if (move) return move.Power
    }
    return null
}
export function moveType(y) { //y = move1.value
    if (y) {
        var move = this.gen3moves.find(x => x.Move.toUpperCase() === y)
        if (move) return move.Type
    }
    return null
}
export function moveTypeIcon(y) { //y = move1.value
    if (y != null && y != undefined) {
        var move = this.gen3moves.find(x => x.Move.toUpperCase() === y)
        var moveType = move[`Type`].toLowerCase()
        return `images/elements/type-icons/${moveType}.png`
    }
    return null
}
// TYPE EFFECTIVENESS
export function checkTypes(x, y) { //x = type1.value, y = type2.value
    if (x.value == y.value)
        return true
    else
        return false
}

//y = mod stage, x = stat value
export function stageMultiplier(y,x) { 
    if (this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0 && y != 0 && y != null && y != undefined) {
        var multiplier = this.stageModifiersData.find(x => x.modType === "stat")
        return Math.floor(x * multiplier[y.toString()])
    }
    else   
        return x
}

//x = stat modifier property (not the value of the property. [ex. battle.modStageAttack])
export function statLabelOpacity(x) {
    if (this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0)
        if (x.bytes != 6)
            return this.statLabelOpacityValue
        else
            return 1
    else
        return 1
}
export function typeEffectiveness(x) { //x = move1.value
    if (this.typeCalcs == true && this.mapper.properties.battle.turnInfo.battleOutcome.bytes == 0) { //calculates effective power when in battle
        var attackingType = this.moveType(x)
            var defendingTypeMono = this.mapper.properties.battle.enemyPokemon.type1.value
            var defendingType1 = this.mapper.properties.battle.enemyPokemon.type1.value
            var defendingType2 = this.mapper.properties.battle.enemyPokemon.type2.value
            var multipliers = this.typeData.find(x => x.moveType === attackingType)
            var movePowerForCalculation = this.movePower(x)
            //NO MOVE POWER (STATUS MOVE)
            if (this.movePower(x) == "-")
                return this.movePower(x)
            //LEVITATE INTERACTION
            else if (this.mapper.properties.battle.enemyPokemon.ability.value == "LEVITATE" && attackingType == "Ground") {
                return 0
            }
            //NO ENEMY DATA (HAVEN'T BATTLED SINCE RELOADING ROM OR SAVE)
            else if (this.mapper.properties.battle.enemyPokemon.type1 == null) {
                return this.movePower(x) 
            }
            //ATTACKING A MONO-TYPE POKEMON
            else if (this.mapper.properties.battle.enemyPokemon.type1.value === this.mapper.properties.battle.enemyPokemon.type2.value) {
                var multiplier1 = multipliers[defendingTypeMono]
                return Math.round(this.movePower(x)*multiplier1)
            }
            //ATTACKING A DUAL-TYPE POKEMON
            else if (this.mapper.properties.battle.enemyPokemon.type1 != this.mapper.properties.battle.enemyPokemon.type2) {
                var multipliers = this.typeData.find(x => x.moveType === attackingType)
                var multiplier1 = multipliers[defendingType1]
                var multiplier2 = multipliers[defendingType2]
                return Math.round(this.movePower(x)*multiplier1*multiplier2)
            }
            //RETURN THE MOVES POWER IF NOTHING ELSE WORKS
            else
                return this.movePower(x)
    }
    //RETURN THE MOVES POWER IF NOT IN BATTLE
    else   
        return this.movePower(x) //returns the move's base power if not in battle
}

//BADGE BOOSTS
//  x = badge required
//  y = stat to be boosted
export function badgeBoost(x, y) {
    if (x == true)
        return Math.floor(y * 1.1)
    else
        return y
    }