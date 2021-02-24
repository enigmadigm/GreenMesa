//import { Request } from 'express';

declare module "*.json";

/* instead used https://stackoverflow.com/a/58788706/10660033
declare global {
    export namespace Express {
        interface Request {
            user: DashUserObject;
        }
        export interface User {
            guilds: PartialGuildObject[];
        }
    }
}*/

declare module 'plotly';
declare module 'corpora';
