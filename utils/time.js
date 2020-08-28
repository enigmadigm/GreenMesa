const timeUnits = { second: 1000 };
timeUnits.minute = timeUnits.second * 60;
timeUnits.hour = timeUnits.minute * 60;
timeUnits.day = timeUnits.hour * 24;
timeUnits.normalMonth = timeUnits.day * 30;

/**
 * calculates and returns an object of time units that represent the distributed value of the provided duration
 * @param {number} msAlive duration in milliseconds
 * @param {boolean} leadingzero whether times should have leading zeroes
 */
function getFriendlyUptime(msAlive = 0, leadingzero = false) {
    msAlive = Math.abs(msAlive);
    let days = Math.floor(msAlive / timeUnits.day);
    let hours = Math.floor(msAlive / timeUnits.hour) % 24;
    let minutes = Math.floor(msAlive / timeUnits.minute) % 60;
    let seconds = Math.floor(msAlive / timeUnits.second) % 60;
    let milliseconds = msAlive % 1000;
    if (leadingzero) {
        if (days < 10) {
            days = "00" + days;
        } else if (days < 100) {
            days = "0" + days;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
    }
    return {
        days,
        hours,
        minutes,
        seconds,
        milliseconds
    };
}

exports.timeUnits = timeUnits;
exports.getFriendlyUptime = getFriendlyUptime;