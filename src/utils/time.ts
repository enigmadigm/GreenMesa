interface TUnits {
    second: number;
    minute: number;
    hour: number;
    day: number;
    normalMonth: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const timeUnitsTemp: any = { second: 1000 };
timeUnitsTemp.minute = timeUnitsTemp.second * 60;
timeUnitsTemp.hour = timeUnitsTemp.minute * 60;
timeUnitsTemp.day = timeUnitsTemp.hour * 24;
timeUnitsTemp.normalMonth = timeUnitsTemp.day * 30;
export const timeUnits: TUnits = timeUnitsTemp;


interface FriendlyTime {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    d: string;
    h: string;
    m: string;
    s: string;
    ms: string;
}

/**
 * calculates and returns an object of time units that represent the distributed value of the provided duration
 * @param {number} msAlive duration in milliseconds
 * @param {boolean} leadingzero whether times should have leading zeroes
 */
export function getFriendlyUptime(msAlive = 0, leadingzero = false): FriendlyTime {
    msAlive = Math.abs(msAlive);
    const days = Math.floor(msAlive / timeUnits.day);
    const hours = Math.floor(msAlive / timeUnits.hour) % 24;
    const minutes = Math.floor(msAlive / timeUnits.minute) % 60;
    const seconds = Math.floor(msAlive / timeUnits.second) % 60;
    const milliseconds = msAlive % 1000;
    // I made these separate vars for pretty much no reason, I was trying to figure out if I could gauarantee a return type of string or a return type of number
    let d = `${days}`;
    let h = `${hours}`;
    let m = `${minutes}`;
    let s = `${seconds}`;
    const ms = `${milliseconds}`
    if (leadingzero) {
        if (days < 10) {
            d = "00" + days;
        } else if (days < 100) {
            d = "0" + days;
        }
        if (hours < 10) {
            h = "0" + hours;
        }
        if (minutes < 10) {
            m = "0" + minutes;
        }
        if (seconds < 10) {
            s = "0" + seconds;
        }
    }
    // I ended up making it just return a full object with the same values but in two different types (therefore two different properties)
    return {
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
        d,
        h,
        m,
        s,
        ms
    };
}

/**
 * This function gets the rounded day difference between two timestamps using getDurationDiff.
 *
 * @export
 * @param {number} timestamp0 first timestamp
 * @param {number} timestamp1 second timestamp
 * @returns
 */
export function getDayDiff(timestamp0: number, timestamp1: number): number {
    return Math.round(getDurationDiff(timestamp0, timestamp1, timeUnits.day));
}

/**
 * This function returns how many times a specified duration fits into a time frame.
 *
 * @param {number} timestamp0 first timestamp
 * @param {number} timestamp1 second timestamp
 * @param {(number | timeUnits)} duration duration of time
 * @returns
 */
export function getDurationDiff(timestamp0: number, timestamp1: number, duration: number): number {
    return Math.abs(timestamp0 - timestamp1) / duration;
}

/**
 * converts string into milliseconds. Syntax:
 * - Ns = N seconds
 * - Nm = N minutes
 * - Nh = N hours
 * - Nd = N days
 *
 * @export
 * @param {string} text input text
 * @returns
 */
export function stringToDuration(text: string): number {
    let ms = 0;
    const seconds = /(\d+)(s|sec|seconds)/.exec(text);
    if (seconds) ms += Number(seconds[1]) * timeUnits.second;
    const minutes = /(\d+)(m|min|minutes)/.exec(text);
    if (minutes) ms += Number(minutes[1]) * timeUnits.minute;
    const hours = /(\d+)(h|hrs|hours)/.exec(text);
    if (hours) ms += Number(hours[1]) * timeUnits.hour;
    const days = /(\d+)(d|days)/.exec(text);
    if (days) ms += Number(days[1]) * timeUnits.day;
    const years = /(\d+)(y|years)/.exec(text);
    if (years) ms += Number(years[1]) * timeUnits.day * 365;

    return ms;
}
