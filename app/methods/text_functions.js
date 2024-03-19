function move_name(move_string) { //converts move strings so that they are formatted correctly
    if (move_string != undefined) {
        if (move_string.toLowerCase() == "vicegrip")      { return "ViceGrip" }
        if (move_string.toLowerCase() == "vice grip")     { return "ViceGrip" }
        if (move_string.toLowerCase() == "doubleslap")    { return "DoubleSlap" }
        if (move_string.toLowerCase() == "double slap")   { return "DoubleSlap" }
        if (move_string.toLowerCase() == "double-edge")   { return "Double-Edge" }
        if (move_string.toLowerCase() == "double edge")   { return "Double-Edge" }
        if (move_string.toLowerCase() == "solarbeam")     { return "SolarBeam" }
        if (move_string.toLowerCase() == "extremespeed")  { return "ExtremeSpeed" }
        if (move_string.toLowerCase() == "extreme speed") { return "ExtremeSpeed" }
        if (move_string.toLowerCase() == "dynamicpunch")  { return "DynamicPunch" }
        if (move_string.toLowerCase() == "thunderpunch")  { return "ThunderPunch" }
        if (move_string.toLowerCase() == "bubblebeam")    { return "BubbleBeam" }
        if (move_string.toLowerCase() == "grasswhistle")  { return "GrassWhistle" }
        if (move_string.toLowerCase() == "grass whistle") { return "GrassWhistle" }
        if (move_string.toLowerCase() == "softboiled")    { return "Softboiled" }
        if (move_string.toLowerCase() == "soft boiled")   { return "Softboiled" }
        if (move_string.toLowerCase() == "sand-attack")   { return "Sand-Attack" }
        if (move_string.toLowerCase() == "mud-slap")      { return "Mud-Slap" }
        if (move_string.toLowerCase() == "featherdance")  { return "FeatherDance" }
        if (move_string.toLowerCase() == "poisonpowder")  { return "PoisonPowder" }
        if (move_string.toLowerCase() == "dragonbreath")  { return "DragonBreath" }
        if (move_string.toLowerCase() == "ancientpower")  { return "AncientPower" }
        if (move_string.toLowerCase() == "smellingsalt")  { return "SmellingSalt" }
        if (move_string.toLowerCase() == "selfdestruct")  { return "Selfdestruct" }
        if (move_string.toLowerCase() == "smokescreen")   { return "SmokeScreen" }
        if (move_string.toLowerCase() == "sonicboom")     { return "SonicBoom" }
        if (move_string.toLowerCase() == "lock on")       { return "Lock-on" }
        if (move_string.toLowerCase() == "lock-on")       { return "Lock-on" }
        if (move_string.toLowerCase() == "will o wisp")   { return "Will-O-Wisp" }

        else { return move_string }
    }
    else { return move_string }
}
function camelCase(str) {
    if (!str || !str.toString()) { return '' }
    return str.toString().replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toUpperCase() : word.toLowerCase();
    })
}
function capitalization_format(str) {
    if (str == null) { return "" }
    return str.toLowerCase().replace(/(^|\s|\-|\.)(\w)/g, function(match, p1, p2) {
        return p1 + p2.toUpperCase();
    });
}
function pascalCaseSpace(str) {
    let words = str.split(' ');
    for (let char of words) {
        words[words.indexOf(char)] = char.charAt(0).toUpperCase() + char.slice(1);
    }
    return words.join(' ');
}
function pascalCaseDot(str) {
    let words = str.split('.');
    for (let char of words) {
        words[words.indexOf(char)] = char.charAt(0).toUpperCase() + char.slice(1);
    }
    return words.join(' ');
}
function titleCaseNoUnderscores(str) { //VIRIDIAN_FOREST -> Viridian Forest
    let formattedStr = str.replace(/_/g, ' ');
    return formattedStr.charAt(0).toUpperCase() + formattedStr.substr(1).toLowerCase();
}
function itemCheck(y) {
    if (y == "--End of list--") return " ";
    return y;
}
function ifZero(y) {
    if (y != 0) return y;
    return " ";
}
function nullToNone(y) {
    if (y == 0) 
        return "None"
    return y
}
function nullToSpace(y) {
    if (y == 0) 
        return " "
    return y
}