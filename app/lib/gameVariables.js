const gameVariables = 
{
    "FireRed and LeafGreen": {
        "opponent": "opponent",
        "newGameFlagContainer" : "pointers",
        "newGameFlag" : "callback2",
        newGame() {
            try {
                console.log(this.mapper)
                this.mapper.properties.pointers.callback2.change((newProp, oldProp) => {
                    if(newProp.value=="New Game" && oldProp.value == "Main Menu"){
                        // console.log("new game started")
                        if (!this.testRun) { this.attempt_number++ }
                        this.newRun();
                        this.startTime();
                    }
                })
            }
            catch {
                console.log("lol error")
            }
            
        }
    },
    "Emerald": {
        "opponent": "opponentA",
        "newGameFlag" : "misc.palette5",
        // newGame() {
        //     this.mapper.properties.misc.palette5.change((newProp, oldProp) => {
        //         if(newProp.value=="NEW GAME" && oldProp.value == "MAIN MENU"){
        //             // console.log("new game started")
        //             if (!this.testRun) { this.attempt_number++ }
        //             this.newRun();
        //             this.startTime();
        //         }
        //     })
        // },
    },
    "Ruby and Sapphire": {

    },
}

export default gameVariables;