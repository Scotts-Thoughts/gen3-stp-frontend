//*timer methods
//start the timer
function startTime() {
    if (this.timer_pause == false) {
        return
    }
    const timeRegex = /(\d+):(\d{2}):(\d{2})\.(\d{2})/;
    const timeOffsetArray = this.timer_startTimeOffset.match(timeRegex)?.slice(1,5).map(x => parseInt(x)) ?? [0,0,0,0];
    const timeOffset = timeOffsetArray[0] * 3600000 + timeOffsetArray[1] * 60000 + timeOffsetArray[2] * 1000 + timeOffsetArray[3] * 10;

    this.timer_startTime = Date.now() - timeOffset
    this.timer_pause = false
    this.updateTime()
}
//stop the timer
function stopTime() {
    this.timer_pause_time = Date.now()
    this.timer_pause = true
}
function padTime(time) {
    return time.toString().padStart(2, "0")
}
//animate the timer
function updateTime() {
    var time = Date.now() - this.timer_startTime
    if (this.timer_pause == true) {
        time = this.timer_pause_time - this.timer_startTime
    }
    var f = (x) => x.toString().padStart(2, "0")
    var c = (Math.floor(time / 10) % 100)
    var s = (Math.floor(time / 1000) % 60)
    var m = (Math.floor(time / 60000) % 60)
    var h = (Math.floor(time / 3600000))
    this.time_h = h
    this.time_m = m
    this.time_s = s
    this.time_ms = c
    if (h != 0) {
        this.timer_formatted_time = [ h + ":" + f(m) + ":" + f(s), "." + f(c), h + "h" + m + "m" + s + "s", ]
    }
    else if (m != 0) {
        this.timer_formatted_time = [ m + ":" + f(s), "." + f(c), h + "h" + m + "m" + s + "s", ]
    }
    else {
        this.timer_formatted_time = [ s, "." + f(c), h + "h" + m + "m" + s + "s", ]
    }
    if (this.timer_pause == false) {
        requestAnimationFrame(this.updateTime)
    }
}
//pause the timer
function pauseUnpauseTime() {
    if (this.timer_pause == true) {
        this.timer_pause = false
        this.timer_startTime += Date.now() - this.timer_pause_time
        this.updateTime()
        retro.resume()
    }
    else {
        this.timer_pause = true
        this.timer_pause_time = Date.now()
        retro.pause()
    }
}
function set_timer() {
    const timeRegex = /(\d+):(\d{2}):(\d{2})\.(\d{2})/;
    const timeOffsetArray = this.timer_startTimeOffset.match(timeRegex)?.slice(1,5).map(x => parseInt(x)) ?? [0,0,0,0];
    const timeOffset = timeOffsetArray[0] * 3600000 + timeOffsetArray[1] * 60000 + timeOffsetArray[2] * 1000 + timeOffsetArray[3] * 10;

    this.timer_pause = true
    this.timer_startTime = Date.now() - timeOffset
    this.timer_pause_time = Date.now()
    this.timer_formatted_time = [ "0", ".00" ]
    this.finished_logs = false

    this.updateTime()
}

//GAMETIME
function gameTimeHM(h, m) {
    if (m < 10) m = "0" + m.toString();
    return `${h}:`+m;
}
function gameTimeM(m) {
    if (m < 10) 
        m = "0" + m.toString();
    return m
}

//GAMETIME FUNCTIONS
function gameTimeHM(h, m) {
    if (h <= 0) return m;
    if (m < 10) 
        m = "0" + m.toString();
    return `${h}:${m}`;
}
function gameTimeHMS(h, m) {
    if (h <= 0) {
        if (m <= 0) return `${s}`;
        if (s < 10) s = "0" + s.toString();
        return `${m}:${s}`;
    }
    if (s < 10) s = "0" + s.toString();
    if (m < 10) m = "0" + m.toString();
    return `${h}:${m}:${s}`;
}
function leadZero(y) {
    if (y < 10) return "0" + y.toString();
    return y;
}
function formatDuration(x) {
    if (x.startsWith("00:")) {
        x = x.substring(3)
    }
    if (x.startsWith(0)) {
        x = x.substring(1)
    }
    x = x.substring(0, x.length-4)
    return x
}