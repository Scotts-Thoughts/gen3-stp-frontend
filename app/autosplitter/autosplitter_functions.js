function log_split(x) {
    // console.log(this)
    const time = this.timer.formatted_time;
    console.log(`Autosplitter - Battle Ended: Split: ${this.opponent} at ${time[0]}${time[1]} (Gametime: ${this.gametimeSplit})`)
} 
function autosplitter_process() {
    // console.log("Checking if autosplitter is on...")
    if (this.autosplitter_toggle == true && this.mapper.properties.battle.type.trainer.value == true) {
        console.log("Began Autosplitter Process")
        d = new Date()
        battle_end = Date.now()
        //values
        let gameTimeH = this.mapper.properties.gameTime?.hours?.value
        let gameTimeM = this.mapper.properties.gameTime?.minutes?.value
        let gameTimeS = this.mapper.properties.gameTime?.seconds?.value
        let gameTimeF = this.mapper.properties.gameTime?.frames?.value
        
        //data to be collected with the autosplitter
        let date_string = (d.getMonth() + 1) + "-" + d.getDate().toString().padStart(2, "0")
        let time_string = d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0")
        let player_name = this.mapper.properties.player.name.value
        let pokemon = this.starterString
        console.log("opponent info: "+ this.opponent)
        let trainer_name = this.opponent
        // let trainer_name = this.format_trainer_name(this.mapper.properties.battle.trainer.class.value, this.mapper.properties.battle.trainer.number.value)
        let trainer_id = this.opponentId
        let location = this.mapper.properties.overworld.mapName.value
        let total_pokemon = this.mapper.properties.battle.trainer.totalPokemon
        const formattedTime = this.timer.formatted_time;
        let real_time_total = formattedTime[0] + formattedTime[1]
        let real_time_hmmss = formattedTime[0]
        let real_time_file_label = formattedTime[2]
        let resets = this.playerResets.toString()
        let blackouts = this.blackout_counter.toString()
        let failures = this.playerResets + this.blackout_counter
        let level = this.mapper.properties.player.team[0].level.value.toString()
        let game_time = this.gametimeSplit.toString()
        let battle_duration = (battle_end - this.battle_start)/1000 
        let move1 = this.mapper.properties.player.team[0].move1.value
        let move2 = this.mapper.properties.player.team[0].move2.value
        let move3 = this.mapper.properties.player.team[0].move3.value
        let move4 = this.mapper.properties.player.team[0].move4.value
        let move1pp = this.mapper.properties.player.team[0].move1pp.value
        let move2pp = this.mapper.properties.player.team[0].move2pp.value
        let move3pp = this.mapper.properties.player.team[0].move3pp.value
        let move4pp = this.mapper.properties.player.team[0].move4pp.value
        let move1ppUp = this.mapper.properties.player.team[0].move1ppUp.value
        let move2ppUp = this.mapper.properties.player.team[0].move2ppUp.value
        let move3ppUp = this.mapper.properties.player.team[0].move3ppUp.value
        let move4ppUp = this.mapper.properties.player.team[0].move4ppUp.value
        let saves = 0
        let steps = 0
        let bonks = 0
        let trainerBattles = 0
        let wildBattles = 0
        let battleTurns = 0
        let playerTurns = 0
        let enemyTurns = 0
        let itemsInBag = 0
        let money = 0
        let rivalTeam = 0
        let statusCondition = this.mapper.properties.player.team[0].statusCondition.value
        let type1 = this.dexData[this.starterString].type_1
        let type2 = this.dexData[this.starterString].type_2
        let experience = this.mapper.properties.player.team[0].expPoints.value
        
        //deprecated properties
        let incremented_finished_run_count = this.finished_run_count + 1
        let runIdentifier = this.starterString.toString() + " " + incremented_finished_run_count.toString()
        let trainerName = this.autosplitter_trainer(this.opponent)
        const time = this.timer.getTime();
        let RTHours = time.hours;
        let RTMinutes = time.minutes;
        let RTSeconds = time.seconds;
        let RTMilliseconds = time.ms;
        let startTime = this.time_split_start
        let realTime = this.padTime(time.hours) + ":" + this.padTime(time.minutes) + ":" + this.padTime(time.seconds) + "." + this.padTime(time.ms)
        let gameTime = this.padTime(gameTimeH) + ":" + this.padTime(gameTimeM) + ":" + this.padTime(gameTimeS) + "." + this.padTime(gameTimeF)
        let hp = this.mapper.properties.player.team[0].hp.value
        let maxHp = this.mapper.properties.player.team[0].maxHp.value
        let atk = this.mapper.properties.player.team[0].attack.value
        let def = this.mapper.properties.player.team[0].defense.value
        let spA = this.mapper.properties.player.team[0].specialAttack.value
        let spD = this.mapper.properties.player.team[0].specialDefense.value
        let spe = this.mapper.properties.player.team[0].speed.value
        let statExp_hp = this.mapper.properties.player.team[0].ivHp.value
        let statExp_atk = this.mapper.properties.player.team[0].ivAttack.value
        let statExp_def = this.mapper.properties.player.team[0].ivDefense.value
        let statExp_spA = this.mapper.properties.player.team[0].ivSpecialAttack.value
        let statExp_spD = this.mapper.properties.player.team[0].ivSpecialDefense.value
        let statExp_spe = this.mapper.properties.player.team[0].ivSpeed.value
        let dvAttack = this.mapper.properties.player.team[0].ivAttack.value
        let dvDefense = this.mapper.properties.player.team[0].ivDefense.value
        let dvSpeed = this.mapper.properties.player.team[0].ivSpeed.value
        let dvSpecial = this.mapper.properties.player.team[0].ivSpecialAttack.value
        let mod_atk = this.mapper.properties.battle.yourPokemon.modStageAttack.value
        let mod_def = this.mapper.properties.battle.yourPokemon.modStageDefense.value
        let mod_spA = this.mapper.properties.battle.yourPokemon.modStageSpecialAttack.value
        let mod_spD = this.mapper.properties.battle.yourPokemon.modStageSpecialDefense.value
        let mod_spe = this.mapper.properties.battle.yourPokemon.modStageSpeed.value
        let mod_acc = this.mapper.properties.battle.yourPokemon.modStageAccuracy.value
        let mod_eva = this.mapper.properties.battle.yourPokemon.modStageEvasion.value
        let battle_atk = this.mapper.properties.battle.yourPokemon.attack.value
        let battle_def = this.mapper.properties.battle.yourPokemon.defense.value
        let battle_spA = this.mapper.properties.battle.yourPokemon.specialAttack.value
        let battle_spD = this.mapper.properties.battle.yourPokemon.specialDefense.value
        let battle_spe = this.mapper.properties.battle.yourPokemon.speed.value
        
        //patch properties
        let patch_frameCount                 = 0
        let patch_oWFrameCount               = 0
        let patch_battleFrameCount           = 0
        let patch_menuFrameCount             = 0
        let patch_introsFrameCount           = 0
        let patch_saveCount                  = 0
        let patch_reloadCount                = 0
        let patch_clockResetCount            = 0
        let patch_stepsCount                 = 0
        let patch_stepsCountWalk             = 0
        let patch_stepsCountBike             = 0
        let patch_stepsCountSurf             = 0
        let patch_bonks                      = 0
        let patch_battles                    = 0
        let patch_trainerBattles             = 0
        let patch_wildBattles                = 0
        let patch_battlesFled                = 0
        let patch_failedRuns                 = 0
        let patch_totalDamageDealt           = 0
        let patch_actualDamageDealt          = 0
        let patch_totalDamageTaken           = 0
        let patch_actualDamageTaken          = 0
        let patch_ownMovesHit                = 0
        let patch_ownMovesMissed             = 0
        let patch_enemyMovesHit              = 0
        let patch_enemyMovesMissed           = 0
        let patch_ownMovesSE                 = 0
        let patch_ownMovesNVE                = 0
        let patch_enemyMovesSE               = 0
        let patch_enemyMovesNVE              = 0
        let patch_criticalsDealt             = 0
        let patch_oHKOsDealt                 = 0
        let patch_criticalsTaken             = 0
        let patch_oHKOsTaken                 = 0
        let patch_wasConfused                = 0
        let patch_enemyBecameConfused        = 0
        let patch_wasParalyzed               = 0
        let patch_enemyWasParalyzed          = 0
        let patch_wasBurned                  = 0
        let patch_enemyWasBurned             = 0
        let patch_wasFrozen                  = 0
        let patch_enemyWasFrozen             = 0
        let patch_wasPoisoned                = 0
        let patch_enemyWasPoisoned           = 0
        let patch_wasPoisonedBadly           = 0
        let patch_enemyWasPoisonedBadly      = 0
        let patch_fellAsleep                 = 0
        let patch_enemyFellAsleep            = 0
        let patch_playerTurnsConfused        = 0
        let patch_enemyTurnsConfused         = 0
        let patch_playerTurnsConfusedHitSelf = 0
        let patch_enemyTurnsConfusedHitSelf  = 0
        let patch_playerTurnsParalyzed       = 0
        let patch_enemyTurnsParalyzed        = 0
        let patch_playerTurnsParalyzedFully  = 0
        let patch_enemyTurnsParalyzedFully   = 0
        let patch_PlayerTurnsAsleep          = 0
        let patch_EnemyTurnsAsleep           = 0
        let patch_playerHpHealed             = 0
        let patch_enemyHpHealed              = 0
        let patch_playerPokemonFainted       = 0
        let patch_enemyPokemonFainted        = 0
        let patch_experienceGained           = 0
        let patch_switchout                  = 0
        let patch_moneyMade                  = 0
        let patch_moneySpent                 = 0
        let patch_moneyLost                  = 0
        let patch_itemsPickedUp              = 0
        let patch_itemsBought                = 0
        let patch_itemsSold                  = 0
        let patch_ballsThrown                = 0
        let patch_pokemonCaughtInBalls       = 0
        let patch_movesLearnt                = 0

        //definitions for what split data is logged to file
        let simple_data = [
            player_name, pokemon, trainer_name, real_time_total, 
            resets, blackouts, level, game_time, battle_duration, 
            move1, move2, move3, move4
        ]
        let full_data = simple_data
        if (this.scott_mode == true) {
            full_data = [
                date_string, time_string, player_name, pokemon, trainer_name, 
                trainer_id, location, total_pokemon, real_time_total, 
                real_time_hmmss, real_time_file_label, resets, blackouts, failures, 
                level, game_time, battle_duration, move1, move2, move3, move4, 
                saves, steps, bonks, trainerBattles, wildBattles, battleTurns, 
                playerTurns, enemyTurns, itemsInBag, money, rivalTeam,
                statusCondition, type1, type2, experience,
                runIdentifier, this.starter, trainerName,
                startTime, realTime, gameTime, level, this.playerResets,
                RTHours, RTMinutes, RTSeconds, RTMilliseconds,
                move1, move2, move3, move4, move1pp, move2pp, move3pp, move4pp, move1ppUp, move2ppUp, move3ppUp, move4ppUp,
                hp, maxHp, atk, def, spA, spD, spe,
                statExp_hp, statExp_atk, statExp_def, statExp_spA, statExp_spD, statExp_spe,
                dvAttack, dvDefense, dvSpeed, dvSpecial,
                mod_atk, mod_def, mod_spA, mod_spD, mod_spe, mod_acc, mod_eva,
                battle_atk, battle_def, battle_spA, battle_spD, battle_spe,
                patch_frameCount, patch_oWFrameCount, patch_battleFrameCount, patch_menuFrameCount, patch_introsFrameCount,
                patch_saveCount, patch_reloadCount, patch_clockResetCount,
                patch_stepsCount, patch_stepsCountWalk, patch_stepsCountBike, patch_stepsCountSurf, patch_bonks,
                patch_battles, patch_trainerBattles, patch_wildBattles, patch_battlesFled, patch_failedRuns,
                patch_totalDamageDealt, patch_actualDamageDealt, patch_totalDamageTaken, patch_actualDamageTaken,
                patch_ownMovesHit, patch_ownMovesMissed, patch_enemyMovesHit, patch_enemyMovesMissed, 
                patch_ownMovesSE, patch_ownMovesNVE, patch_enemyMovesSE, patch_enemyMovesNVE, 
                patch_criticalsDealt, patch_oHKOsDealt, patch_criticalsTaken, patch_oHKOsTaken,
                patch_wasConfused, patch_enemyBecameConfused, patch_wasParalyzed, patch_enemyWasParalyzed, 
                patch_wasBurned, patch_enemyWasBurned, patch_wasFrozen, patch_enemyWasFrozen,
                patch_wasPoisoned, patch_enemyWasPoisoned, patch_wasPoisonedBadly, patch_enemyWasPoisonedBadly,
                patch_fellAsleep, patch_enemyFellAsleep, patch_playerTurnsConfused, patch_playerTurnsConfusedHitSelf, 
                patch_playerTurnsParalyzed, patch_playerTurnsParalyzedFully, patch_enemyTurnsConfused, patch_enemyTurnsConfusedHitSelf, 
                patch_enemyTurnsParalyzed, patch_enemyTurnsParalyzedFully, patch_PlayerTurnsAsleep, patch_EnemyTurnsAsleep,
                patch_playerHpHealed, patch_enemyHpHealed, 
                patch_playerPokemonFainted, patch_enemyPokemonFainted, patch_experienceGained, patch_switchout,
                patch_moneyMade, patch_moneySpent, patch_moneyLost,
                patch_itemsPickedUp, patch_itemsBought, patch_itemsSold,
                patch_ballsThrown, patch_pokemonCaughtInBalls,
                patch_movesLearnt,
                //new properties
                blackouts, this.attempt_number, failures, rivalTeam
            ]
        }

        let deprecated_data = []
        if (this.scott_mode == true) {
            deprecated_data = [
                runIdentifier, this.starterString, trainerName,
                startTime, realTime, gameTime, level, this.playerResets,
                RTHours, RTMinutes, RTSeconds, RTMilliseconds,
                move1, move2, move3, move4,
                atk, def, spA, spD, spe,
                mod_atk, mod_def, mod_spA, mod_spD, mod_spe, mod_acc, mod_eva,
                battle_atk, battle_def, battle_spA, battle_spD, battle_spe,
                patch_frameCount, patch_oWFrameCount, patch_battleFrameCount, patch_menuFrameCount, patch_introsFrameCount,
                patch_saveCount, patch_reloadCount, patch_clockResetCount,
                patch_stepsCount, patch_stepsCountWalk, patch_stepsCountBike, patch_stepsCountSurf, patch_bonks,
                patch_battles, patch_trainerBattles, patch_wildBattles, patch_battlesFled, patch_failedRuns,
                patch_totalDamageDealt, patch_actualDamageDealt, patch_totalDamageTaken, patch_actualDamageTaken,
                patch_ownMovesHit, patch_ownMovesMissed, patch_enemyMovesHit, patch_enemyMovesMissed, 
                patch_ownMovesSE, patch_ownMovesNVE, patch_enemyMovesSE, patch_enemyMovesNVE, 
                patch_criticalsDealt, patch_oHKOsDealt, patch_criticalsTaken, patch_oHKOsTaken,
                patch_wasConfused, patch_enemyBecameConfused, patch_wasParalyzed, patch_enemyWasParalyzed, 
                patch_wasBurned, patch_enemyWasBurned, patch_wasFrozen, patch_enemyWasFrozen,
                patch_wasPoisoned, patch_enemyWasPoisoned, patch_wasPoisonedBadly, patch_enemyWasPoisonedBadly,
                patch_fellAsleep, patch_enemyFellAsleep, patch_playerTurnsConfused, patch_playerTurnsConfusedHitSelf, 
                patch_playerTurnsParalyzed, patch_playerTurnsParalyzedFully, patch_enemyTurnsConfused, patch_enemyTurnsConfusedHitSelf, 
                patch_enemyTurnsParalyzed, patch_enemyTurnsParalyzedFully,
                patch_playerHpHealed, patch_enemyHpHealed, 
                patch_playerPokemonFainted, patch_enemyPokemonFainted, patch_experienceGained, patch_switchout,
                patch_moneyMade, patch_moneySpent, patch_moneyLost,
                patch_itemsPickedUp, patch_itemsBought, patch_itemsSold,
                patch_ballsThrown, patch_pokemonCaughtInBalls,
                patch_movesLearnt,
                //new properties
                blackouts, this.attempt_number, failures, rivalTeam
            ]
        }
        
        let simple_data_str = simple_data.join(",") + "\n";
        let full_data_str = full_data.join(",") + "\n";
        let deprecated_data_str = deprecated_data.join(",") + "\n";
        MyStorage["simple_data_str"] = simple_data_str
        MyStorage["full_data_str"] = full_data_str
        MyStorage["simple_data"] = simple_data
        MyStorage["deprecated_data_str"] = deprecated_data_str
        this.simple_data_str = simple_data_str
        this.full_data_str = full_data_str
        this.simple_data = simple_data
        this.deprecated_data_str = deprecated_data_str
        if (this.collect_split_data == true && this.mapper.properties.battle.turnInfo.battleOutcome.value == "WON" && this.mapper.properties.battle.type.trainer.value == true) {
            this.current_splits.push({
                trainer: trainer_name, 
                time:    real_time_hmmss,
            })
        }
    }
}