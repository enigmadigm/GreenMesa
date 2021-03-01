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

declare namespace NodeJS {
    interface ProcessEnv {
        WEBSITE_PORT?: string;
        DASHBOARD_CLIENT_ID?: string;
        DASHBOARD_CLIENT_SECRET?: string;
        DASHBOARD_CALLBACK_URL?: string;
        DASHBOARD_STATIC_LOC?: string;
        DASHBOARD_COOKIE_SECRET?: string;
        NODE_ENV?: string;
    }
}

interface String {
    escapeSpecialChars(): string;
    escapeDiscord(): string;
}