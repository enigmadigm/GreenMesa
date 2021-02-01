/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from 'moment'; // require
const now = moment().format();
export = {
    log(e: any): void {
        if (e) {
            return console.log(`[${now}]`, e.stack || e);
        }
    },
    error(e: any, err?: Error): void {
        if (e) {
            return console.error(`[${now}]`, e.stack || e, err?.stack);
        }
    }
}
