const template = `
    <div class="gametime">
            <div class="timerTitle">time played at 4x game-speed</div>
            <div class="gametimeClock">{{formattedTime[0]}}</div>
            <div class="gametimeFrames">{{formattedTime[1]}}</div>
    </div>
`

module.exports = {
    template,
    props: ["paused", "start", "pauseTime"],
    data: () => ({
        runs: true,
        formattedTime: ["0", ".00"],
    }),
    methods: {
        formatTime() {
            if (this.paused) {
                return;
            }
            var time = Date.now() - this.start
            if (this.pauseTime == true) {
                time = this.pauseTime - this.start
            }
            var f = (x) => x.toString().padStart(2, "0")
            var c = (Math.floor(time / 10) % 100)
            var s = (Math.floor(time / 1000) % 60)
            var m = (Math.floor(time / 60000) % 60)
            var h = (Math.floor(time / 3600000))
            if (h != 0) {
                this.formattedTime = [h + ":" + f(m) + ":" + f(s), "." + f(c), h + "h" + m + "m" + s + "s",]
            }
            else if (m != 0) {
                this.formattedTime = [m + ":" + f(s), "." + f(c), h + "h" + m + "m" + s + "s",]
            }
            else {
                this.formattedTime = [s, "." + f(c), h + "h" + m + "m" + s + "s",]
            }
        },
        loop() {
            this.formatTime();
            if (this.runs) {
                window.requestAnimationFrame(this.loop);
            }
        }
    },
    mounted: function() {
        this.loop();
    },
    onUnmounted () {
        this.runs = false;
    }
}
