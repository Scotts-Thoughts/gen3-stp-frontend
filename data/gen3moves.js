const gen3moves = [
  {
    Move: "Fury Cutter",
    Type: "Bug",
    PP: "20",
    Power: "10",
    Accuracy: "95",
    Description: "An attack that intensifies on each successive hit."
  },
  {
    Move: "Leech Life",
    Type: "Bug",
    PP: "15",
    Power: "20",
    Accuracy: "100",
    Description: "An attack that steals half the damage inflicted."
  },
  {
    Move: "Megahorn",
    Type: "Bug",
    PP: "10",
    Power: "120",
    Accuracy: "85",
    Description: "A brutal ramming attack using out-thrust horns."
  },
  {
    Move: "Pin Missile",
    Type: "Bug",
    PP: "20",
    Power: "14",
    Accuracy: "85",
    Description: "Sharp pins are fired to strike 2 to 5 times."
  },
  {
    Move: "Signal Beam",
    Type: "Bug",
    PP: "15",
    Power: "75",
    Accuracy: "100",
    Description: "A strange beam attack that may confuse the foe."
  },
  {
    Move: "Silver Wind",
    Type: "Bug",
    PP: "5",
    Power: "60",
    Accuracy: "100",
    Description: "A powdery attack that may raise abilities."
  },
  {
    Move: "Spider Web",
    Type: "Bug",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Ensnares the foe to stop it from fleeing or switching."
  },
  {
    Move: "String Shot",
    Type: "Bug",
    PP: "40",
    Power: "-",
    Accuracy: "95",
    Description: "Binds the foe with string to reduce its SPEED."
  },
  {
    Move: "Tail Glow",
    Type: "Bug",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Flashes a light that sharply raises SP. ATK."
  },
  {
    Move: "Twineedle",
    Type: "Bug",
    PP: "20",
    Power: "25",
    Accuracy: "100",
    Description: "Stingers on the forelegs jab the foe twice."
  },
  {
    Move: "Beat Up",
    Type: "Dark",
    PP: "10",
    Power: "10",
    Accuracy: "100",
    Description: "Summons party POK\ufffdMON to join in the attack."
  },
  {
    Move: "Bite",
    Type: "Dark",
    PP: "25",
    Power: "60",
    Accuracy: "100",
    Description: "Bites with vicious fangs. May cause flinching."
  },
  {
    Move: "Crunch",
    Type: "Dark",
    PP: "15",
    Power: "80",
    Accuracy: "100",
    Description: "Crunches with sharp fangs. May lower SP. DEF."
  },
  {
    Move: "Faint Attack",
    Type: "Dark",
    PP: "20",
    Power: "60",
    Accuracy: "-",
    Description: "Draws the foe close, then strikes without fail."
  },
  {
    Move: "Fake Tears",
    Type: "Dark",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Feigns crying to sharply lower the foe's SP. DEF."
  },
  {
    Move: "Flatter",
    Type: "Dark",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Confuses the foe, but raises its SP. ATK."
  },
  {
    Move: "Knock Off",
    Type: "Dark",
    PP: "20",
    Power: "20",
    Accuracy: "100",
    Description: "Knocks down the foe's held item to prevent its use."
  },
  {
    Move: "Memento",
    Type: "Dark",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "The user faints and lowers the foe's abilities."
  },
  {
    Move: "Pursuit",
    Type: "Dark",
    PP: "20",
    Power: "40",
    Accuracy: "100",
    Description: "Inflicts bad damage if used on a foe switching out."
  },
  {
    Move: "Snatch",
    Type: "Dark",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Steals the effects of the move the foe uses next."
  },
  {
    Move: "Taunt",
    Type: "Dark",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Taunts the foe into only using attack moves."
  },
  {
    Move: "Thief",
    Type: "Dark",
    PP: "10",
    Power: "40",
    Accuracy: "100",
    Description: "While attacking, it may steal the foe's held item."
  },
  {
    Move: "Torment",
    Type: "Dark",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Torments the foe and stops successive use of a move."
  },
  {
    Move: "Dragon Claw",
    Type: "Dragon",
    PP: "15",
    Power: "80",
    Accuracy: "100",
    Description: "Slashes the foe with sharp claws."
  },
  {
    Move: "Dragon Dance",
    Type: "Dragon",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "A mystical dance that ups ATTACK and SPEED."
  },
  {
    Move: "Dragon Rage",
    Type: "Dragon",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Launches shock waves that always inflict 40 HP damage."
  },
  {
    Move: "Dragonbreath",
    Type: "Dragon",
    PP: "20",
    Power: "60",
    Accuracy: "100",
    Description: "Strikes the foe with an incredible blast of breath."
  },
  {
    Move: "Meteoric Swarm",
    Type: "Dragon",
    PP: "5",
    Power: "140",
    Accuracy: "90",
    Description: "Allows a full-power attack, but sharply lowers SP. ATK."
  },
  {
    Move: "Outrage",
    Type: "Dragon",
    PP: "15",
    Power: "90",
    Accuracy: "100",
    Description: "A rampage of 2 to 3 turns that confuses the user."
  },
  {
    Move: "Twister",
    Type: "Dragon",
    PP: "20",
    Power: "40",
    Accuracy: "100",
    Description: "Whips up a vicious twister to tear at the foe."
  },
  {
    Move: "Charge",
    Type: "Electric",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Charges power to boost the electric move used next."
  },
  {
    Move: "Shock Wave",
    Type: "Electric",
    PP: "20",
    Power: "60",
    Accuracy: "-",
    Description: "A fast and unavoidable electric attack."
  },
  {
    Move: "Spark",
    Type: "Electric",
    PP: "20",
    Power: "65",
    Accuracy: "100",
    Description: "An electrified tackle that may paralyze the foe."
  },
  {
    Move: "Thunder",
    Type: "Electric",
    PP: "10",
    Power: "120",
    Accuracy: "70",
    Description: "A lightning attack that may cause paralysis."
  },
  {
    Move: "Thunder Wave",
    Type: "Electric",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "A weak jolt of electricity that paralyzes the foe."
  },
  {
    Move: "Thunderbolt",
    Type: "Electric",
    PP: "15",
    Power: "95",
    Accuracy: "100",
    Description: "A strong electrical attack that may paralyze the foe."
  },
  {
    Move: "ThunderPunch",
    Type: "Electric",
    PP: "15",
    Power: "75",
    Accuracy: "100",
    Description: "An electrified punch that may paralyze the foe."
  },
  {
    Move: "Thundershock",
    Type: "Electric",
    PP: "30",
    Power: "40",
    Accuracy: "100",
    Description: "An electrical attack that may paralyze the foe."
  },
  {
    Move: "Volt Tackle",
    Type: "Electric",
    PP: "15",
    Power: "120",
    Accuracy: "100",
    Description: "A life-risking tackle that slightly hurts the user."
  },
  {
    Move: "Zap Cannon",
    Type: "Electric",
    PP: "5",
    Power: "100",
    Accuracy: "50",
    Description: "Powerful and sure to cause paralysis, but inaccurate."
  },
  {
    Move: "Arm Thrust",
    Type: "Fighting",
    PP: "20",
    Power: "15",
    Accuracy: "100",
    Description: "Straight-arm punches that strike the foe 2 to 5 times."
  },
  {
    Move: "Brick Break",
    Type: "Fighting",
    PP: "15",
    Power: "75",
    Accuracy: "100",
    Description: "Destroys barriers such as REFLECT and causes damage."
  },
  {
    Move: "Bulk Up",
    Type: "Fighting",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "Bulks up the body to boost both ATTACK and DEFENSE."
  },
  {
    Move: "Counter",
    Type: "Fighting",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Retaliates any physical hit with double the power."
  },
  {
    Move: "Cross Chop",
    Type: "Fighting",
    PP: "5",
    Power: "100",
    Accuracy: "80",
    Description: "A double-chopping attack. High critical-hit ratio."
  },
  {
    Move: "Detect",
    Type: "Fighting",
    PP: "5",
    Power: "-",
    Accuracy: "-",
    Description: "Evades attack, but may fail if used in succession."
  },
  {
    Move: "Double Kick",
    Type: "Fighting",
    PP: "30",
    Power: "30",
    Accuracy: "100",
    Description: "A double-kicking attack that strikes the foe twice."
  },
  {
    Move: "DynamicPunch",
    Type: "Fighting",
    PP: "5",
    Power: "100",
    Accuracy: "50",
    Description: "Powerful and sure to cause confusion, but inaccurate."
  },
  {
    Move: "Focus Punch",
    Type: "Fighting",
    PP: "20",
    Power: "150",
    Accuracy: "100",
    Description: "A powerful loyalty attack. The user flinches if hit."
  },
  {
    Move: "Hi Jump Kick",
    Type: "Fighting",
    PP: "20",
    Power: "85",
    Accuracy: "90",
    Description: "A jumping knee kick. If it misses, the user is hurt."
  },
  {
    Move: "Jump Kick",
    Type: "Fighting",
    PP: "25",
    Power: "70",
    Accuracy: "95",
    Description: "A strong jumping kick. May miss and hurt the kicker."
  },
  {
    Move: "Karate Chop",
    Type: "Fighting",
    PP: "25",
    Power: "50",
    Accuracy: "100",
    Description: "A chopping attack with a high critical-hit ratio."
  },
  {
    Move: "Low Kick",
    Type: "Fighting",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "A kick that inflicts more damage on heavier foes."
  },
  {
    Move: "Mach Punch",
    Type: "Fighting",
    PP: "30",
    Power: "40",
    Accuracy: "100",
    Description: "A punch is thrown at wicked speed to strike first."
  },
  {
    Move: "Revenge",
    Type: "Fighting",
    PP: "10",
    Power: "60",
    Accuracy: "100",
    Description: "An attack that gains power if injured by the foe."
  },
  {
    Move: "Reversal",
    Type: "Fighting",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Inflicts more damage when the user's HP is down."
  },
  {
    Move: "Rock Smash",
    Type: "Fighting",
    PP: "15",
    Power: "20",
    Accuracy: "100",
    Description: "A rock-crushing attack that may lower DEFENSE."
  },
  {
    Move: "Rolling Kick",
    Type: "Fighting",
    PP: "15",
    Power: "60",
    Accuracy: "85",
    Description: "A fast kick delivered from a rapid spin."
  },
  {
    Move: "Seismic Toss",
    Type: "Fighting",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Inflicts damage identical to the user's level."
  },
  {
    Move: "Sky Uppercut",
    Type: "Fighting",
    PP: "15",
    Power: "85",
    Accuracy: "90",
    Description: "An uppercut thrown as if leaping into the sky."
  },
  {
    Move: "Submission",
    Type: "Fighting",
    PP: "25",
    Power: "80",
    Accuracy: "80",
    Description: "A reckless body slam that also hurts the user."
  },
  {
    Move: "Superpower",
    Type: "Fighting",
    PP: "5",
    Power: "120",
    Accuracy: "100",
    Description: "Boosts strength sharply, but lowers abilities."
  },
  {
    Move: "Triple Kick",
    Type: "Fighting",
    PP: "10",
    Power: "10",
    Accuracy: "90",
    Description: "Kicks the foe 3 times in a row with rising intensity."
  },
  {
    Move: "Vital Throw",
    Type: "Fighting",
    PP: "10",
    Power: "70",
    Accuracy: "100",
    Description: "Makes the user's move last, but it never misses."
  },
  {
    Move: "Blast Burn",
    Type: "Fire",
    PP: "5",
    Power: "150",
    Accuracy: "90",
    Description: "Powerful, but leaves the user immobile the next turn."
  },
  {
    Move: "Blaze Kick",
    Type: "Fire",
    PP: "10",
    Power: "85",
    Accuracy: "90",
    Description: "A kick with a high critical- hit ratio. May cause a burn."
  },
  {
    Move: "Ember",
    Type: "Fire",
    PP: "25",
    Power: "40",
    Accuracy: "100",
    Description: "A weak fire attack that may inflict a burn."
  },
  {
    Move: "Eruption",
    Type: "Fire",
    PP: "5",
    Power: "150",
    Accuracy: "100",
    Description: "The higher the user's HP, the more damage caused."
  },
  {
    Move: "Fire Blast",
    Type: "Fire",
    PP: "5",
    Power: "120",
    Accuracy: "85",
    Description: "A fiery blast that scorches all. May cause a burn."
  },
  {
    Move: "Fire Punch",
    Type: "Fire",
    PP: "15",
    Power: "75",
    Accuracy: "100",
    Description: "A fiery punch that may burn the foe."
  },
  {
    Move: "Fire Spin",
    Type: "Fire",
    PP: "15",
    Power: "15",
    Accuracy: "70",
    Description: "Traps the foe in a ring of fire for 2 to 5 turns."
  },
  {
    Move: "Flame Wheel",
    Type: "Fire",
    PP: "25",
    Power: "60",
    Accuracy: "100",
    Description: "A fiery charge attack that may inflict a burn."
  },
  {
    Move: "Flamethrower",
    Type: "Fire",
    PP: "15",
    Power: "95",
    Accuracy: "100",
    Description: "A powerful fire attack that may inflict a burn."
  },
  {
    Move: "Heat Wave",
    Type: "Fire",
    PP: "10",
    Power: "100",
    Accuracy: "90",
    Description: "Exhales a hot breath on the foe. May inflict a burn."
  },
  {
    Move: "Overheat",
    Type: "Fire",
    PP: "5",
    Power: "140",
    Accuracy: "90",
    Description: "Allows a full-power attack, but sharply lowers SP. ATK."
  },
  {
    Move: "Sacred Fire",
    Type: "Fire",
    PP: "5",
    Power: "100",
    Accuracy: "95",
    Description: "A mystical fire attack that may inflict a burn."
  },
  {
    Move: "Sunny Day",
    Type: "Fire",
    PP: "5",
    Power: "-",
    Accuracy: "-",
    Description: "Boosts the power of FIRE- type moves for 5 turns."
  },
  {
    Move: "Will-o-wisp",
    Type: "Fire",
    PP: "15",
    Power: "-",
    Accuracy: "75",
    Description: "Inflicts a burn on the foe with intense fire."
  },
  {
    Move: "Aerial Ace",
    Type: "Flying",
    PP: "20",
    Power: "60",
    Accuracy: "-",
    Description: "An extremely speedy and unavoidable attack."
  },
  {
    Move: "Aeroblast",
    Type: "Flying",
    PP: "5",
    Power: "100",
    Accuracy: "95",
    Description: "Launches a vacuumed blast. High critical-hit ratio."
  },
  {
    Move: "Air Cutter",
    Type: "Flying",
    PP: "25",
    Power: "55",
    Accuracy: "95",
    Description: "Hacks with razorlike wind. High critical-hit ratio."
  },
  {
    Move: "Bounce",
    Type: "Flying",
    PP: "5",
    Power: "85",
    Accuracy: "85",
    Description: "Bounces up, then down the next turn. May paralyze."
  },
  {
    Move: "Drill Peck",
    Type: "Flying",
    PP: "20",
    Power: "80",
    Accuracy: "100",
    Description: "A corkscrewing attack with the beak acting as a drill."
  },
  {
    Move: "Featherdance",
    Type: "Flying",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Envelops the foe with down to sharply reduce ATTACK."
  },
  {
    Move: "Fly",
    Type: "Flying",
    PP: "15",
    Power: "70",
    Accuracy: "95",
    Description: "Flies up on the first turn, then strikes the next turn."
  },
  {
    Move: "Gust",
    Type: "Flying",
    PP: "35",
    Power: "40",
    Accuracy: "100",
    Description: "Strikes the foe with a gust of wind whipped up by wings."
  },
  {
    Move: "Mirror Move",
    Type: "Flying",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "Counters the foe's attack with the same move."
  },
  {
    Move: "Peck",
    Type: "Flying",
    PP: "35",
    Power: "35",
    Accuracy: "100",
    Description: "Attacks the foe with a jabbing beak, etc."
  },
  {
    Move: "Sky Attack",
    Type: "Flying",
    PP: "5",
    Power: "140",
    Accuracy: "90",
    Description: "Searches out weak spots, then strikes the next turn."
  },
  {
    Move: "Wing Attack",
    Type: "Flying",
    PP: "35",
    Power: "60",
    Accuracy: "100",
    Description: "Strikes the foe with wings spread wide."
  },
  {
    Move: "Astonish",
    Type: "Ghost",
    PP: "15",
    Power: "30",
    Accuracy: "100",
    Description: "An attack that may shock the foe into flinching."
  },
  {
    Move: "Confuse Ray",
    Type: "Ghost",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "A sinister ray that confuses the foe."
  },
  {
    Move: "Destiny Bond",
    Type: "Ghost",
    PP: "5",
    Power: "-",
    Accuracy: "-",
    Description: "If the user faints, the foe is also made to faint."
  },
  {
    Move: "Grudge",
    Type: "Ghost",
    PP: "5",
    Power: "-",
    Accuracy: "100",
    Description: "If the user faints, deletes the PP of the final move."
  },
  {
    Move: "Lick",
    Type: "Ghost",
    PP: "30",
    Power: "20",
    Accuracy: "100",
    Description: "Licks with a long tongue to injure. May also paralyze."
  },
  {
    Move: "Night Shade",
    Type: "Ghost",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Inflicts damage identical to the user's level."
  },
  {
    Move: "Nightmare",
    Type: "Ghost",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Inflicts 1/4 damage on a sleeping foe every turn."
  },
  {
    Move: "Shadow Ball",
    Type: "Ghost",
    PP: "15",
    Power: "80",
    Accuracy: "100",
    Description: "Hurls a black blob that may lower the foe's SP. DEF."
  },
  {
    Move: "Shadow Punch",
    Type: "Ghost",
    PP: "20",
    Power: "60",
    Accuracy: "-",
    Description: "An unavoidable punch that is thrown from shadows."
  },
  {
    Move: "Spite",
    Type: "Ghost",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Spitefully cuts the PP of the foe's last move."
  },
  {
    Move: "Absorb",
    Type: "Grass",
    PP: "20",
    Power: "20",
    Accuracy: "100",
    Description: "An attack that absorbs half the damage inflicted."
  },
  {
    Move: "Aromatherapy",
    Type: "Grass",
    PP: "5",
    Power: "-",
    Accuracy: "-",
    Description: "Heals all status problems with a soothing scent."
  },
  {
    Move: "Bullet Seed",
    Type: "Grass",
    PP: "30",
    Power: "10",
    Accuracy: "100",
    Description: "Shoots 2 to 5 seeds in a row to strike the foe."
  },
  {
    Move: "Cotton Spore",
    Type: "Grass",
    PP: "40",
    Power: "-",
    Accuracy: "85",
    Description: "Spores cling to the foe, sharply reducing SPEED."
  },
  {
    Move: "Frenzy Plant",
    Type: "Grass",
    PP: "5",
    Power: "150",
    Accuracy: "90",
    Description: "Powerful, but leaves the user immobile the next turn."
  },
  {
    Move: "Giga Drain",
    Type: "Grass",
    PP: "5",
    Power: "60",
    Accuracy: "100",
    Description: "An attack that steals half the damage inflicted."
  },
  {
    Move: "GrassWhistle",
    Type: "Grass",
    PP: "15",
    Power: "-",
    Accuracy: "55",
    Description: "Lulls the foe into sleep with a pleasant melody."
  },
  {
    Move: "Ingrain",
    Type: "Grass",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Lays roots that restore HP. The user can't switch out."
  },
  {
    Move: "Leaf Blade",
    Type: "Grass",
    PP: "15",
    Power: "70",
    Accuracy: "100",
    Description: "Slashes with a sharp leaf. High critical-hit ratio."
  },
  {
    Move: "Leech Seed",
    Type: "Grass",
    PP: "10",
    Power: "-",
    Accuracy: "90",
    Description: "Plants a seed on the foe to steal HP on every turn."
  },
  {
    Move: "Magical Leaf",
    Type: "Grass",
    PP: "20",
    Power: "60",
    Accuracy: "-",
    Description: "Attacks with a strange leaf that cannot be evaded."
  },
  {
    Move: "Mega Drain",
    Type: "Grass",
    PP: "10",
    Power: "40",
    Accuracy: "100",
    Description: "An attack that absorbs half the damage inflicted."
  },
  {
    Move: "Needle Arm",
    Type: "Grass",
    PP: "15",
    Power: "60",
    Accuracy: "100",
    Description: "Attacks with thorny arms. May cause flinching."
  },
  {
    Move: "Petal Dance",
    Type: "Grass",
    PP: "20",
    Power: "70",
    Accuracy: "100",
    Description: "A rampage of 2 to 3 turns that confuses the user."
  },
  {
    Move: "Razor Leaf",
    Type: "Grass",
    PP: "25",
    Power: "55",
    Accuracy: "95",
    Description: "Cuts the enemy with leaves. High critical-hit ratio."
  },
  {
    Move: "Sleep Powder",
    Type: "Grass",
    PP: "15",
    Power: "-",
    Accuracy: "75",
    Description: "Scatters a powder that may cause the foe to sleep."
  },
  {
    Move: "Solarbeam",
    Type: "Grass",
    PP: "10",
    Power: "120",
    Accuracy: "100",
    Description: "Absorbs light in one turn, then attacks next turn."
  },
  {
    Move: "Spore",
    Type: "Grass",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Scatters a cloud of spores that always induce sleep."
  },
  {
    Move: "Stun Spore",
    Type: "Grass",
    PP: "30",
    Power: "-",
    Accuracy: "75",
    Description: "Scatters a powder that may paralyze the foe."
  },
  {
    Move: "Synthesis",
    Type: "Grass",
    PP: "5",
    Power: "-",
    Accuracy: "-",
    Description: "Restores HP. The amount varies with the weather."
  },
  {
    Move: "Vine Whip",
    Type: "Grass",
    PP: "10",
    Power: "35",
    Accuracy: "100",
    Description: "Strikes the foe with slender, whiplike vines."
  },
  {
    Move: "Bone Club",
    Type: "Ground",
    PP: "20",
    Power: "65",
    Accuracy: "85",
    Description: "Clubs the foe with a bone. May cause flinching."
  },
  {
    Move: "Bone Rush",
    Type: "Ground",
    PP: "10",
    Power: "25",
    Accuracy: "80",
    Description: "Strikes the foe with a bone in hand 2 to 5 times."
  },
  {
    Move: "Bonemerang",
    Type: "Ground",
    PP: "10",
    Power: "50",
    Accuracy: "90",
    Description: "Throws a bone boomerang that strikes twice."
  },
  {
    Move: "Dig",
    Type: "Ground",
    PP: "10",
    Power: "60",
    Accuracy: "100",
    Description: "Digs underground the first turn and strikes next turn."
  },
  {
    Move: "Earthquake",
    Type: "Ground",
    PP: "10",
    Power: "100",
    Accuracy: "100",
    Description: "A powerful quake, but has no effect on flying foes."
  },
  {
    Move: "Fissure",
    Type: "Ground",
    PP: "5",
    Power: "-",
    Accuracy: "30",
    Description: "A one-hit KO move that drops the foe in a fissure."
  },
  {
    Move: "Magnitude",
    Type: "Ground",
    PP: "30",
    Power: "-",
    Accuracy: "100",
    Description: "A ground-shaking attack of random intensity."
  },
  {
    Move: "Mud Shot",
    Type: "Ground",
    PP: "15",
    Power: "55",
    Accuracy: "95",
    Description: "Hurls mud at the foe and reduces SPEED."
  },
  {
    Move: "Mud Sport",
    Type: "Ground",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Covers the user in mud to raise electrical resistance."
  },
  {
    Move: "Mud-Slap",
    Type: "Ground",
    PP: "10",
    Power: "20",
    Accuracy: "100",
    Description: "Hurls mud in the foe's face to reduce its accuracy."
  },
  {
    Move: "Sand Tomb",
    Type: "Ground",
    PP: "15",
    Power: "15",
    Accuracy: "70",
    Description: "Traps and hurts the foe in quicksand for 2 to 5 turns."
  },
  {
    Move: "Sand-Attack",
    Type: "Ground",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Reduces the foe's accuracy by hurling sand in its face."
  },
  {
    Move: "Spikes",
    Type: "Ground",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "Sets spikes that hurt a foe switching out."
  },
  {
    Move: "Aurora Beam",
    Type: "Ice",
    PP: "20",
    Power: "65",
    Accuracy: "100",
    Description: "Fires a rainbow-colored beam that may lower ATTACK."
  },
  {
    Move: "Blizzard",
    Type: "Ice",
    PP: "5",
    Power: "120",
    Accuracy: "70",
    Description: "Hits the foe with an icy storm that may freeze it."
  },
  {
    Move: "Hail",
    Type: "Ice",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Summons a hailstorm that strikes every turn."
  },
  {
    Move: "Haze",
    Type: "Ice",
    PP: "30",
    Power: "-",
    Accuracy: "-",
    Description: "Creates a black haze that eliminates all stat changes."
  },
  {
    Move: "Ice Ball",
    Type: "Ice",
    PP: "20",
    Power: "30",
    Accuracy: "90",
    Description: "A 5-turn attack that gains power on successive hits."
  },
  {
    Move: "Ice Beam",
    Type: "Ice",
    PP: "10",
    Power: "95",
    Accuracy: "100",
    Description: "Blasts the foe with an icy beam that may freeze it."
  },
  {
    Move: "Ice Punch",
    Type: "Ice",
    PP: "15",
    Power: "75",
    Accuracy: "100",
    Description: "An icy punch that may freeze the foe."
  },
  {
    Move: "Icicle Spear",
    Type: "Ice",
    PP: "30",
    Power: "10",
    Accuracy: "100",
    Description: "Attacks the foe by firing 2 to 5 icicles in a row."
  },
  {
    Move: "Icy Wind",
    Type: "Ice",
    PP: "15",
    Power: "55",
    Accuracy: "95",
    Description: "A chilling attack that lowers the foe's SPEED."
  },
  {
    Move: "Mist",
    Type: "Ice",
    PP: "30",
    Power: "-",
    Accuracy: "-",
    Description: "Creates a mist that stops reduction of abilities."
  },
  {
    Move: "Powder Snow",
    Type: "Ice",
    PP: "25",
    Power: "40",
    Accuracy: "100",
    Description: "Blasts the foe with a snowy gust. May cause freezing."
  },
  {
    Move: "Sheer Cold",
    Type: "Ice",
    PP: "5",
    Power: "-",
    Accuracy: "30",
    Description: "A chilling attack that causes fainting if it hits."
  },
  {
    Move: "Assist",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Attacks randomly with one of the partner's moves."
  },
  {
    Move: "Attract",
    Type: "Normal",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Makes the opposite gender less likely to attack."
  },
  {
    Move: "Barrage",
    Type: "Normal",
    PP: "20",
    Power: "15",
    Accuracy: "85",
    Description: "Hurls round objects at the foe 2 to 5 times."
  },
  {
    Move: "Baton Pass",
    Type: "Normal",
    PP: "40",
    Power: "-",
    Accuracy: "-",
    Description: "Switches out the user while keeping effects in play."
  },
  {
    Move: "Belly Drum",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Maximizes ATTACK while sacrificing HP."
  },
  {
    Move: "Bide",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Endures attack for 2 turns to retaliate double."
  },
  {
    Move: "Bind",
    Type: "Normal",
    PP: "20",
    Power: "15",
    Accuracy: "75",
    Description: "Binds and squeezes the foe for 2 to 5 turns."
  },
  {
    Move: "Block",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "100",
    Description: "Blocks the foe's way to prevent escape."
  },
  {
    Move: "Body Slam",
    Type: "Normal",
    PP: "15",
    Power: "85",
    Accuracy: "100",
    Description: "A full-body slam that may cause paralysis."
  },
  {
    Move: "Camouflage",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Alters the POK\ufffdMON's type depending on the location."
  },
  {
    Move: "Charm",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Charms the foe and sharply reduces its ATTACK."
  },
  {
    Move: "Comet Punch",
    Type: "Normal",
    PP: "15",
    Power: "18",
    Accuracy: "85",
    Description: "Repeatedly punches the foe 2 to 5 times."
  },
  {
    Move: "Constrict",
    Type: "Normal",
    PP: "35",
    Power: "10",
    Accuracy: "100",
    Description: "Constricts to inflict pain. May lower SPEED."
  },
  {
    Move: "Conversion",
    Type: "Normal",
    PP: "30",
    Power: "-",
    Accuracy: "-",
    Description: "Changes the user's type into an own move's type."
  },
  {
    Move: "Conversion 2",
    Type: "Normal",
    PP: "30",
    Power: "-",
    Accuracy: "100",
    Description: "Makes the user resistant to the last attack's type."
  },
  {
    Move: "Covet",
    Type: "Normal",
    PP: "40",
    Power: "40",
    Accuracy: "100",
    Description: "Cutely begs to obtain an item held by the foe."
  },
  {
    Move: "Crush Claw",
    Type: "Normal",
    PP: "10",
    Power: "75",
    Accuracy: "95",
    Description: "Tears at the foe with sharp claws. May lower DEFENSE."
  },
  {
    Move: "Cut",
    Type: "Normal",
    PP: "30",
    Power: "50",
    Accuracy: "95",
    Description: "Cuts the foe with sharp scythes, claws, etc."
  },
  {
    Move: "Defense Curl",
    Type: "Normal",
    PP: "40",
    Power: "-",
    Accuracy: "-",
    Description: "Curls up to conceal weak spots and raise DEFENSE."
  },
  {
    Move: "Disable",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "55",
    Description: "Psychically disables one of the foe's moves."
  },
  {
    Move: "Dizzy Punch",
    Type: "Normal",
    PP: "10",
    Power: "70",
    Accuracy: "100",
    Description: "A rhythmic punch that may confuse the foe."
  },
  {
    Move: "Double Team",
    Type: "Normal",
    PP: "15",
    Power: "-",
    Accuracy: "-",
    Description: "Creates illusory copies to raise evasiveness."
  },
  {
    Move: "Double Edge",
    Type: "Normal",
    PP: "15",
    Power: "120",
    Accuracy: "100",
    Description: "A life-risking tackle that also hurts the user."
  },
  {
    Move: "Double Slap",
    Type: "Normal",
    PP: "10",
    Power: "15",
    Accuracy: "85",
    Description: "Repeatedly slaps the foe 2 to 5 times."
  },
  {
    Move: "Egg Bomb",
    Type: "Normal",
    PP: "10",
    Power: "100",
    Accuracy: "75",
    Description: "An egg is forcibly hurled at the foe."
  },
  {
    Move: "Encore",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "100",
    Description: "Makes the foe repeat its last move over 2 to 6 turns."
  },
  {
    Move: "Endeavor",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "100",
    Description: "Gains power if the user's HP is lower than the foe's HP."
  },
  {
    Move: "Endure",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Endures any attack for 1 turn, leaving at least 1HP."
  },
  {
    Move: "Explosion",
    Type: "Normal",
    PP: "5",
    Power: "250",
    Accuracy: "100",
    Description: "Inflicts severe damage but makes the user faint."
  },
  {
    Move: "ExtremeSpeed",
    Type: "Normal",
    PP: "5",
    Power: "80",
    Accuracy: "100",
    Description: "An extremely fast and powerful attack."
  },
  {
    Move: "Facade",
    Type: "Normal",
    PP: "20",
    Power: "70",
    Accuracy: "100",
    Description: "Boosts ATTACK when burned, paralyzed, or poisoned."
  },
  {
    Move: "Fake Out",
    Type: "Normal",
    PP: "10",
    Power: "40",
    Accuracy: "100",
    Description: "A 1st-turn, 1st-strike move that causes flinching."
  },
  {
    Move: "False Swipe",
    Type: "Normal",
    PP: "40",
    Power: "40",
    Accuracy: "100",
    Description: "An attack that leaves the foe with at least 1 HP."
  },
  {
    Move: "Flail",
    Type: "Normal",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Inflicts more damage when the user's HP is down."
  },
  {
    Move: "Flash",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "70",
    Description: "Looses a powerful blast of light that cuts accuracy."
  },
  {
    Move: "Focus Energy",
    Type: "Normal",
    PP: "30",
    Power: "-",
    Accuracy: "-",
    Description: "Focuses power to raise the critical-hit ratio."
  },
  {
    Move: "Follow Me",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Draws attention to make foes attack only the user."
  },
  {
    Move: "Foresight",
    Type: "Normal",
    PP: "40",
    Power: "-",
    Accuracy: "100",
    Description: "Negates the foe's efforts to heighten evasiveness."
  },
  {
    Move: "Frustration",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "An attack that is stronger if the TRAINER is disliked."
  },
  {
    Move: "Fury Attack",
    Type: "Normal",
    PP: "20",
    Power: "15",
    Accuracy: "85",
    Description: "Jabs the foe 2 to 5 times with sharp horns, etc."
  },
  {
    Move: "Fury Swipes",
    Type: "Normal",
    PP: "15",
    Power: "18",
    Accuracy: "80",
    Description: "Rakes the foe with sharp claws, etc., 2 to 5 times."
  },
  {
    Move: "Glare",
    Type: "Normal",
    PP: "30",
    Power: "-",
    Accuracy: "75",
    Description: "Intimidates and frightens the foe into paralysis."
  },
  {
    Move: "Growl",
    Type: "Normal",
    PP: "40",
    Power: "-",
    Accuracy: "100",
    Description: "Growls cutely to reduce the foe's ATTACK."
  },
  {
    Move: "Growth",
    Type: "Normal",
    PP: "40",
    Power: "-",
    Accuracy: "-",
    Description: "Forces the body to grow and heightens SP. ATK."
  },
  {
    Move: "Guillotine",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "30",
    Description: "A powerful pincer attack that may cause fainting."
  },
  {
    Move: "Harden",
    Type: "Normal",
    PP: "30",
    Power: "-",
    Accuracy: "-",
    Description: "Stiffens the body's muscles to raise DEFENSE."
  },
  {
    Move: "Headbutt",
    Type: "Normal",
    PP: "15",
    Power: "70",
    Accuracy: "100",
    Description: "A ramming attack that may cause flinching."
  },
  {
    Move: "Heal Bell",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "-",
    Description: "Chimes soothingly to heal all status abnormalities."
  },
  {
    Move: "Heart Swap",
    Type: "Normal",
    PP: "0",
    Power: "-",
    Accuracy: "-",
    Description: "Stat Effects are swapped between all Pok\ufffdmon on the field."
  },
  {
    Move: "Helping Hand",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Boosts the power of the recipient's moves."
  },
  {
    Move: "Hidden Power",
    Type: "Normal",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "The effectiveness varies with the user."
  },
  {
    Move: "Horn Attack",
    Type: "Normal",
    PP: "25",
    Power: "65",
    Accuracy: "100",
    Description: "Jabs the foe with sharp horns."
  },
  {
    Move: "Horn Drill",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "30",
    Description: "A one-hit KO attack that uses a horn like a drill."
  },
  {
    Move: "Howl",
    Type: "Normal",
    PP: "40",
    Power: "-",
    Accuracy: "-",
    Description: "Howls to raise the spirit and boosts ATTACK."
  },
  {
    Move: "Hyper Beam",
    Type: "Normal",
    PP: "5",
    Power: "150",
    Accuracy: "90",
    Description: "Powerful, but leaves the user immobile the next turn."
  },
  {
    Move: "Hyper Fang",
    Type: "Normal",
    PP: "15",
    Power: "80",
    Accuracy: "90",
    Description: "Attacks with sharp fangs. May cause flinching."
  },
  {
    Move: "Hyper Voice",
    Type: "Normal",
    PP: "10",
    Power: "90",
    Accuracy: "100",
    Description: "A loud attack that uses sound waves to injure."
  },
  {
    Move: "Leer",
    Type: "Normal",
    PP: "30",
    Power: "-",
    Accuracy: "100",
    Description: "Frightens the foe with a leer to lower DEFENSE."
  },
  {
    Move: "Lock-on",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "100",
    Description: "Locks on to the foe to ensure the next move hits."
  },
  {
    Move: "Lovely Kiss",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "75",
    Description: "Demands a kiss with a scary face that induces sleep."
  },
  {
    Move: "Mean Look",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "100",
    Description: "Fixes the foe with a mean look that prevents escape."
  },
  {
    Move: "Mega Kick",
    Type: "Normal",
    PP: "5",
    Power: "120",
    Accuracy: "75",
    Description: "An extremely powerful kick with intense force."
  },
  {
    Move: "Mega Punch",
    Type: "Normal",
    PP: "20",
    Power: "80",
    Accuracy: "85",
    Description: "A strong punch thrown with incredible power."
  },
  {
    Move: "Metronome",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Waggles a finger to use any POK\ufffdMON move at random."
  },
  {
    Move: "Milk Drink",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Recovers up to half the user's maximum HP."
  },
  {
    Move: "Mimic",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Copies a move used by the foe during one battle."
  },
  {
    Move: "Mind Reader",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "100",
    Description: "Senses the foe's action to ensure the next move's hit."
  },
  {
    Move: "Minimize",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "Minimizes the user's size to raise evasiveness."
  },
  {
    Move: "Moonlight",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "-",
    Description: "Restores HP. The amount varies with the weather."
  },
  {
    Move: "Morning Sun",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "-",
    Description: "Restores HP. The amount varies with the weather."
  },
  {
    Move: "Nature Power",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "95",
    Description: "The type of attack varies depending on the location."
  },
  {
    Move: "Odor Sleuth",
    Type: "Normal",
    PP: "40",
    Power: "-",
    Accuracy: "100",
    Description: "Negates the foe's efforts to heighten evasiveness."
  },
  {
    Move: "Pain Split",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Adds the user and foe's HP, then shares them equally."
  },
  {
    Move: "Pay Day",
    Type: "Normal",
    PP: "20",
    Power: "40",
    Accuracy: "100",
    Description: "Throws coins at the foe. Money is recovered after."
  },
  {
    Move: "Perish Song",
    Type: "Normal",
    PP: "5",
    Power: "-",
    Accuracy: "-",
    Description: "Any POK\ufffdMON hearing this song faints in 3 turns."
  },
  {
    Move: "Pound",
    Type: "Normal",
    PP: "35",
    Power: "40",
    Accuracy: "100",
    Description: "Pounds the foe with forelegs or tail."
  },
  {
    Move: "Present",
    Type: "Normal",
    PP: "15",
    Power: "-",
    Accuracy: "90",
    Description: "A gift in the form of a bomb. May restore HP."
  },
  {
    Move: "Protect",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Evades attack, but may fail if used in succession."
  },
  {
    Move: "Psych Up",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Copies the foe's effect(s) and gives to the user."
  },
  {
    Move: "Quick Attack",
    Type: "Normal",
    PP: "30",
    Power: "40",
    Accuracy: "100",
    Description: "An extremely fast attack that always strikes first."
  },
  {
    Move: "Rage",
    Type: "Normal",
    PP: "20",
    Power: "20",
    Accuracy: "100",
    Description: "Raises the user's ATTACK every time it is hit."
  },
  {
    Move: "Rapid Spin",
    Type: "Normal",
    PP: "40",
    Power: "20",
    Accuracy: "100",
    Description: "Spins the body at high speed to strike the foe."
  },
  {
    Move: "Razor Wind",
    Type: "Normal",
    PP: "10",
    Power: "80",
    Accuracy: "100",
    Description: "A 2-turn move that strikes the foe on the 2nd turn."
  },
  {
    Move: "Recover",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "Recovers up to half the user's maximum HP."
  },
  {
    Move: "Recycle",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Recycles a used item for one more use."
  },
  {
    Move: "Refresh",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Heals poisoning, paralysis, or a burn."
  },
  {
    Move: "Return",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "An attack that increases in power with friendship."
  },
  {
    Move: "Roar",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Makes the foe flee to end the battle."
  },
  {
    Move: "Safeguard",
    Type: "Normal",
    PP: "25",
    Power: "-",
    Accuracy: "-",
    Description: "A mystical force prevents all status problems."
  },
  {
    Move: "Scary Face",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "90",
    Description: "Frightens with a scary face to sharply reduce SPEED."
  },
  {
    Move: "Scratch",
    Type: "Normal",
    PP: "35",
    Power: "40",
    Accuracy: "100",
    Description: "Scratches the foe with sharp claws."
  },
  {
    Move: "Screech",
    Type: "Normal",
    PP: "40",
    Power: "-",
    Accuracy: "85",
    Description: "Emits a screech to sharply reduce the foe's DEFENSE."
  },
  {
    Move: "Secret Power",
    Type: "Normal",
    PP: "20",
    Power: "70",
    Accuracy: "100",
    Description: "An attack with effects that vary by location."
  },
  {
    Move: "Selfdestruct",
    Type: "Normal",
    PP: "5",
    Power: "200",
    Accuracy: "100",
    Description: "Inflicts severe damage but makes the user faint."
  },
  {
    Move: "Sharpen",
    Type: "Normal",
    PP: "30",
    Power: "-",
    Accuracy: "-",
    Description: "Reduces the polygon count and raises ATTACK."
  },
  {
    Move: "Sing",
    Type: "Normal",
    PP: "15",
    Power: "-",
    Accuracy: "55",
    Description: "A soothing song lulls the foe into a deep slumber."
  },
  {
    Move: "Sketch",
    Type: "Normal",
    PP: "1",
    Power: "-",
    Accuracy: "-",
    Description: "Copies the foe's last move permanently."
  },
  {
    Move: "Skull Bash",
    Type: "Normal",
    PP: "15",
    Power: "100",
    Accuracy: "100",
    Description: "Tucks in the head, then attacks on the next turn."
  },
  {
    Move: "Slack Off",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Slacks off and restores half the maximum HP."
  },
  {
    Move: "Slam",
    Type: "Normal",
    PP: "20",
    Power: "80",
    Accuracy: "75",
    Description: "Slams the foe with a long tail, vine, etc."
  },
  {
    Move: "Slash",
    Type: "Normal",
    PP: "20",
    Power: "70",
    Accuracy: "100",
    Description: "Slashes with claws, etc. Has a high critical-hit ratio."
  },
  {
    Move: "Sleep Talk",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Uses an own move randomly while asleep."
  },
  {
    Move: "SmellingSalt",
    Type: "Normal",
    PP: "10",
    Power: "60",
    Accuracy: "100",
    Description: "Powerful against paralyzed foes, but also heals them."
  },
  {
    Move: "Smokescreen",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Lowers the foe's accuracy using smoke, ink, etc."
  },
  {
    Move: "Snore",
    Type: "Normal",
    PP: "15",
    Power: "40",
    Accuracy: "100",
    Description: "A loud attack that can be used only while asleep."
  },
  {
    Move: "Softboiled",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Recovers up to half the user's maximum HP."
  },
  {
    Move: "Sonicboom",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "90",
    Description: "Launches shock waves that always inflict 20 HP damage."
  },
  {
    Move: "Spike Cannon",
    Type: "Normal",
    PP: "15",
    Power: "20",
    Accuracy: "100",
    Description: "Launches sharp spikes that strike 2 to 5 times."
  },
  {
    Move: "Spit Up",
    Type: "Normal",
    PP: "10",
    Power: "100",
    Accuracy: "100",
    Description: "Releases stockpiled power (the more the better)."
  },
  {
    Move: "Splash",
    Type: "Normal",
    PP: "40",
    Power: "-",
    Accuracy: "-",
    Description: "It's just a splash... Has no effect whatsoever."
  },
  {
    Move: "Stockpile",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Charges up power for up to 3 turns."
  },
  {
    Move: "Stomp",
    Type: "Normal",
    PP: "20",
    Power: "65",
    Accuracy: "100",
    Description: "Stomps the enemy with a big foot. May cause flinching."
  },
  {
    Move: "Strength",
    Type: "Normal",
    PP: "15",
    Power: "80",
    Accuracy: "100",
    Description: "Builds enormous power, then slams the foe."
  },
  {
    Move: "Struggle",
    Type: "Normal",
    PP: "1",
    Power: "50",
    Accuracy: "100",
    Description: "Used only if all PP are gone. Also hurts the user a little."
  },
  {
    Move: "Substitute",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Creates a decoy using 1/4 of the user's maximum HP."
  },
  {
    Move: "Super Fang",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "90",
    Description: "Attacks with sharp fangs and cuts half the foe's HP."
  },
  {
    Move: "Supersonic",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "55",
    Description: "Emits bizarre sound waves that may confuse the foe."
  },
  {
    Move: "Swagger",
    Type: "Normal",
    PP: "15",
    Power: "-",
    Accuracy: "90",
    Description: "Confuses the foe, but also sharply raises ATTACK."
  },
  {
    Move: "Swallow",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Absorbs stockpiled power and restores HP."
  },
  {
    Move: "Sweet Kiss",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "75",
    Description: "Demands a kiss with a cute look. May cause confusion."
  },
  {
    Move: "Sweet Scent",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Allures the foe to reduce evasiveness."
  },
  {
    Move: "Swift",
    Type: "Normal",
    PP: "20",
    Power: "60",
    Accuracy: "-",
    Description: "Sprays star-shaped rays that never miss."
  },
  {
    Move: "Swords Dance",
    Type: "Normal",
    PP: "30",
    Power: "-",
    Accuracy: "-",
    Description: "A fighting dance that sharply raises ATTACK."
  },
  {
    Move: "Tackle",
    Type: "Normal",
    PP: "35",
    Power: "35",
    Accuracy: "95",
    Description: "Charges the foe with a full- body tackle."
  },
  {
    Move: "Tail Whip",
    Type: "Normal",
    PP: "30",
    Power: "-",
    Accuracy: "100",
    Description: "Wags the tail to lower the foe's DEFENSE."
  },
  {
    Move: "Take Down",
    Type: "Normal",
    PP: "20",
    Power: "90",
    Accuracy: "85",
    Description: "A reckless charge attack that also hurts the user."
  },
  {
    Move: "Teeter Dance",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Confuses all POK\ufffdMON on the scene."
  },
  {
    Move: "Thrash",
    Type: "Normal",
    PP: "20",
    Power: "90",
    Accuracy: "100",
    Description: "A rampage of 2 to 3 turns that confuses the user."
  },
  {
    Move: "Tickle",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Makes the foe laugh to lower ATTACK and DEFENSE."
  },
  {
    Move: "Curse",
    Type: "curse",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Makes the foe laugh to lower ATTACK and DEFENSE."
  },
  {
    Move: "Transform",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Alters the user's cells to become a copy of the foe."
  },
  {
    Move: "Tri Attack",
    Type: "Normal",
    PP: "10",
    Power: "80",
    Accuracy: "100",
    Description: "Fires three types of beams at the same time."
  },
  {
    Move: "Uproar",
    Type: "Normal",
    PP: "10",
    Power: "50",
    Accuracy: "100",
    Description: "Causes an uproar for 2 to 5 turns and prevents sleep."
  },
  {
    Move: "Vicegrip",
    Type: "Normal",
    PP: "30",
    Power: "55",
    Accuracy: "100",
    Description: "Grips the foe with large and powerful pincers."
  },
  {
    Move: "Weather Ball",
    Type: "Normal",
    PP: "10",
    Power: "50",
    Accuracy: "100",
    Description: "The move's type and power change with the weather."
  },
  {
    Move: "Whirlwind",
    Type: "Normal",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Blows away the foe with wind and ends the battle."
  },
  {
    Move: "Wish",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "A wish that restores HP. It takes time to work."
  },
  {
    Move: "Wrap",
    Type: "Normal",
    PP: "20",
    Power: "15",
    Accuracy: "85",
    Description: "Wraps and squeezes the foe 2 to 5 times with vines, etc."
  },
  {
    Move: "Yawn",
    Type: "Normal",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Lulls the foe into yawning, then sleeping next turn."
  },
  {
    Move: "Acid",
    Type: "Poison",
    PP: "30",
    Power: "40",
    Accuracy: "100",
    Description: "Sprays a hide-melting acid. May lower DEFENSE."
  },
  {
    Move: "Acid Armor",
    Type: "Poison",
    PP: "40",
    Power: "-",
    Accuracy: "-",
    Description: "Liquifies the user's body to sharply raise DEFENSE."
  },
  {
    Move: "Poison Fang",
    Type: "Poison",
    PP: "15",
    Power: "50",
    Accuracy: "100",
    Description: "A sharp-fanged attack. May badly poison the foe."
  },
  {
    Move: "Poison Gas",
    Type: "Poison",
    PP: "40",
    Power: "-",
    Accuracy: "55",
    Description: "Envelops the foe in a toxic gas that may poison."
  },
  {
    Move: "Poison Sting",
    Type: "Poison",
    PP: "35",
    Power: "15",
    Accuracy: "100",
    Description: "A toxic attack with barbs, etc., that may poison."
  },
  {
    Move: "Poison Tail",
    Type: "Poison",
    PP: "25",
    Power: "50",
    Accuracy: "100",
    Description: "Has a high critical-hit ratio. May also poison."
  },
  {
    Move: "PoisonPowder",
    Type: "Poison",
    PP: "35",
    Power: "-",
    Accuracy: "75",
    Description: "Scatters a toxic powder that may poison the foe."
  },
  {
    Move: "Sludge",
    Type: "Poison",
    PP: "20",
    Power: "65",
    Accuracy: "100",
    Description: "Sludge is hurled to inflict damage. May also poison."
  },
  {
    Move: "Sludge Bomb",
    Type: "Poison",
    PP: "10",
    Power: "90",
    Accuracy: "100",
    Description: "Sludge is hurled to inflict damage. May also poison."
  },
  {
    Move: "Smog",
    Type: "Poison",
    PP: "20",
    Power: "20",
    Accuracy: "70",
    Description: "An exhaust-gas attack that may also poison."
  },
  {
    Move: "Toxic",
    Type: "Poison",
    PP: "10",
    Power: "-",
    Accuracy: "85",
    Description: "Poisons the foe with an intensifying toxin."
  },
  {
    Move: "Agility",
    Type: "Psychic",
    PP: "30",
    Power: "-",
    Accuracy: "-",
    Description: "Relaxes the body to sharply boost SPEED."
  },
  {
    Move: "Amnesia",
    Type: "Psychic",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "Forgets about something and sharply raises SP. DEF."
  },
  {
    Move: "Barrier",
    Type: "Psychic",
    PP: "30",
    Power: "-",
    Accuracy: "-",
    Description: "Creates a barrier that sharply raises DEFENSE."
  },
  {
    Move: "Calm Mind",
    Type: "Psychic",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "Raises SP. ATK and SP. DEF by focusing the mind."
  },
  {
    Move: "Confusion",
    Type: "Psychic",
    PP: "25",
    Power: "50",
    Accuracy: "100",
    Description: "A psychic attack that may cause confusion."
  },
  {
    Move: "Cosmic Power",
    Type: "Psychic",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "Raises DEFENSE and SP. DEF with a mystic power."
  },
  {
    Move: "Dream Eater",
    Type: "Psychic",
    PP: "15",
    Power: "100",
    Accuracy: "100",
    Description: "Takes one half the damage inflicted on a sleeping foe."
  },
  {
    Move: "Extrasensory",
    Type: "Psychic",
    PP: "30",
    Power: "80",
    Accuracy: "100",
    Description: "Attacks with a peculiar power. May cause flinching."
  },
  {
    Move: "Future Sight",
    Type: "Psychic",
    PP: "15",
    Power: "80",
    Accuracy: "90",
    Description: "Heightens inner power to strike 2 turns later."
  },
  {
    Move: "Hypnosis",
    Type: "Psychic",
    PP: "20",
    Power: "-",
    Accuracy: "60",
    Description: "A hypnotizing move that may induce sleep."
  },
  {
    Move: "Imprison",
    Type: "Psychic",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Prevents foes from using moves known by the user."
  },
  {
    Move: "Kinesis",
    Type: "Psychic",
    PP: "15",
    Power: "-",
    Accuracy: "80",
    Description: "Distracts the foe. May lower accuracy."
  },
  {
    Move: "Light Screen",
    Type: "Psychic",
    PP: "30",
    Power: "-",
    Accuracy: "-",
    Description: "Creates a wall of light that lowers SP. ATK damage."
  },
  {
    Move: "Luster Purge",
    Type: "Psychic",
    PP: "5",
    Power: "70",
    Accuracy: "100",
    Description: "Attacks with a burst of light. May lower SP. DEF."
  },
  {
    Move: "Magic Coat",
    Type: "Psychic",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "Reflects special effects back to the attacker."
  },
  {
    Move: "Meditate",
    Type: "Psychic",
    PP: "40",
    Power: "-",
    Accuracy: "-",
    Description: "Meditates in a peaceful fashion to raise ATTACK."
  },
  {
    Move: "Mirror Coat",
    Type: "Psychic",
    PP: "20",
    Power: "-",
    Accuracy: "100",
    Description: "Counters the foe's special attack at double the power."
  },
  {
    Move: "Mist Ball",
    Type: "Psychic",
    PP: "5",
    Power: "70",
    Accuracy: "100",
    Description: "Attacks with a flurry of down. May lower SP. ATK."
  },
  {
    Move: "Psybeam",
    Type: "Psychic",
    PP: "20",
    Power: "65",
    Accuracy: "100",
    Description: "Fires a peculiar ray that may confuse the foe."
  },
  {
    Move: "Psychic",
    Type: "Psychic",
    PP: "10",
    Power: "90",
    Accuracy: "100",
    Description: "A powerful psychic attack that may lower SP. DEF."
  },
  {
    Move: "Psycho Boost",
    Type: "Psychic",
    PP: "5",
    Power: "140",
    Accuracy: "90",
    Description: "Allows a full-power attack, but sharply lowers SP. ATK."
  },
  {
    Move: "Psywave",
    Type: "Psychic",
    PP: "15",
    Power: "-",
    Accuracy: "80",
    Description: "Attacks with a psychic wave of varying intensity."
  },
  {
    Move: "Reflect",
    Type: "Psychic",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "Creates a wall of light that weakens physical attacks."
  },
  {
    Move: "Rest",
    Type: "Psychic",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "The user sleeps for 2 turns, restoring HP and status."
  },
  {
    Move: "Role Play",
    Type: "Psychic",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Mimics the target and copies its special ability."
  },
  {
    Move: "Skill Swap",
    Type: "Psychic",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "The user swaps special abilities with the target."
  },
  {
    Move: "Teleport",
    Type: "Psychic",
    PP: "20",
    Power: "-",
    Accuracy: "-",
    Description: "A psychic move for fleeing from battle instantly."
  },
  {
    Move: "Trick",
    Type: "Psychic",
    PP: "10",
    Power: "-",
    Accuracy: "100",
    Description: "Tricks the foe into trading held items."
  },
  {
    Move: "AncientPower",
    Type: "Rock",
    PP: "5",
    Power: "60",
    Accuracy: "100",
    Description: "An attack that may raise all stats."
  },
  {
    Move: "Rock Blast",
    Type: "Rock",
    PP: "10",
    Power: "25",
    Accuracy: "80",
    Description: "Hurls boulders at the foe 2 to 5 times in a row."
  },
  {
    Move: "Rock Slide",
    Type: "Rock",
    PP: "10",
    Power: "75",
    Accuracy: "90",
    Description: "Large boulders are hurled. May cause flinching."
  },
  {
    Move: "Rock Throw",
    Type: "Rock",
    PP: "15",
    Power: "50",
    Accuracy: "90",
    Description: "Throws small rocks to strike the foe."
  },
  {
    Move: "Rock Tomb",
    Type: "Rock",
    PP: "10",
    Power: "50",
    Accuracy: "80",
    Description: "Stops the foe from moving with rocks and cuts SPEED."
  },
  {
    Move: "Rollout",
    Type: "Rock",
    PP: "20",
    Power: "30",
    Accuracy: "90",
    Description: "An attack lasting 5 turns with rising intensity."
  },
  {
    Move: "Sandstorm",
    Type: "Rock",
    PP: "10",
    Power: "-",
    Accuracy: "-",
    Description: "Causes a sandstorm that rages for several turns."
  },
  {
    Move: "Doom Desire",
    Type: "Steel",
    PP: "5",
    Power: "120",
    Accuracy: "85",
    Description: "Summons strong sunlight to attack 2 turns later."
  },
  {
    Move: "Iron Defense",
    Type: "Steel",
    PP: "15",
    Power: "-",
    Accuracy: "-",
    Description: "Hardens the body's surface to sharply raise DEFENSE."
  },
  {
    Move: "Iron Tail",
    Type: "Steel",
    PP: "15",
    Power: "100",
    Accuracy: "75",
    Description: "Attacks with a rock-hard tail. May lower DEFENSE."
  },
  {
    Move: "Metal Claw",
    Type: "Steel",
    PP: "35",
    Power: "50",
    Accuracy: "95",
    Description: "A claw attack that may raise the user's ATTACK."
  },
  {
    Move: "Metal Sound",
    Type: "Steel",
    PP: "40",
    Power: "-",
    Accuracy: "85",
    Description: "Emits a horrible screech that sharply lowers SP. DEF."
  },
  {
    Move: "Meteor Mash",
    Type: "Steel",
    PP: "10",
    Power: "100",
    Accuracy: "85",
    Description: "Fires a meteor-like punch. May raise ATTACK."
  },
  {
    Move: "Steel Wing",
    Type: "Steel",
    PP: "25",
    Power: "70",
    Accuracy: "90",
    Description: "Strikes the foe with hard wings spread wide."
  },
  {
    Move: "Bubble",
    Type: "Water",
    PP: "30",
    Power: "20",
    Accuracy: "100",
    Description: "An attack using bubbles. May lower the foe's SPEED."
  },
  {
    Move: "BubbleBeam",
    Type: "Water",
    PP: "20",
    Power: "65",
    Accuracy: "100",
    Description: "Forcefully sprays bubbles that may lower SPEED."
  },
  {
    Move: "Clamp",
    Type: "Water",
    PP: "10",
    Power: "35",
    Accuracy: "75",
    Description: "Traps and squeezes the foe for 2 to 5 turns."
  },
  {
    Move: "Crabhammer",
    Type: "Water",
    PP: "10",
    Power: "90",
    Accuracy: "85",
    Description: "Hammers with a pincer. Has a high critical-hit ratio."
  },
  {
    Move: "Dive",
    Type: "Water",
    PP: "10",
    Power: "60",
    Accuracy: "100",
    Description: "Dives underwater the first turn and strikes next turn."
  },
  {
    Move: "Hydro Cannon",
    Type: "Water",
    PP: "5",
    Power: "150",
    Accuracy: "90",
    Description: "Powerful, but leaves the user immobile the next turn."
  },
  {
    Move: "Hydro Pump",
    Type: "Water",
    PP: "5",
    Power: "120",
    Accuracy: "80",
    Description: "Blasts water at high power to strike the foe."
  },
  {
    Move: "Muddy Water",
    Type: "Water",
    PP: "10",
    Power: "95",
    Accuracy: "85",
    Description: "Attacks with muddy water. May lower accuracy."
  },
  {
    Move: "Octazooka",
    Type: "Water",
    PP: "10",
    Power: "65",
    Accuracy: "85",
    Description: "Fires a lump of ink to damage and cut accuracy."
  },
  {
    Move: "Rain Dance",
    Type: "Water",
    PP: "5",
    Power: "-",
    Accuracy: "-",
    Description: "Boosts the power of WATER- type moves for 5 turns."
  },
  {
    Move: "Surf",
    Type: "Water",
    PP: "15",
    Power: "95",
    Accuracy: "100",
    Description: "Creates a huge wave, then crashes it down on the foe."
  },
  {
    Move: "Water Gun",
    Type: "Water",
    PP: "25",
    Power: "40",
    Accuracy: "100",
    Description: "Squirts water to attack the foe."
  },
  {
    Move: "Water Pulse",
    Type: "Water",
    PP: "20",
    Power: "60",
    Accuracy: "100",
    Description: "Attacks with ultrasonic waves. May confuse the foe"
  },
  {
    Move: "Water Sport",
    Type: "Water",
    PP: "15",
    Power: "-",
    Accuracy: "100",
    Description: "The user becomes soaked to raise resistance to fire."
  },
  {
    Move: "Water Spout",
    Type: "Water",
    PP: "5",
    Power: "150",
    Accuracy: "100",
    Description: "Inflicts more damage if the user's HP is high."
  },
  {
    Move: "Waterfall",
    Type: "Water",
    PP: "15",
    Power: "80",
    Accuracy: "100",
    Description: "Charges the foe with speed to climb waterfalls."
  },
  {
    Move: "Whirlpool",
    Type: "Water",
    PP: "15",
    Power: "15",
    Accuracy: "70",
    Description: "v"
  },
  {
    Move: "Withdraw",
    Type: "Water",
    PP: "40",
    Power: "-",
    Accuracy: "-",
    Description: "Withdraws the body into its hard shell to raise DEFENSE."
  },
  {
    Move: "null",
    Type: " ",
    PP: " ",
    Power: " ",
    Accuracy: " ",
    Description: " "
  }
]