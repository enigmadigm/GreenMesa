/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from 'moment'; // require
const now = moment().format();
global.xlg = {
    log(e, ...params) {
        if (e) {
            return console.log(`[${now}]`, e instanceof Error ? e.stack || e : e, ...params);
        }
    },
    error(e, ...params) {
        if (e) {
            return console.error(`[${now}]`, e.stack || e, ...params);
        }
    }
}
