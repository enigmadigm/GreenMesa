declare namespace Express {
    interface Request {
        user: User;
        twitch_hub: string;
        twitch_hex: string;
        twitch_signature: string;
    }
    interface User {//TODO: this needs to be integrated with the userdata table, like, seriously, what the hell did i do this for
        id: string;
        tag: string;
        avatar: string;
        guilds: {
            owner: boolean;
            permissions: number;
            icon: string;
            id: string;
            name: string;
            features?: string[];
            permissions_new?: string;
        }[];
        kingpin?: {
            yes: boolean;
            grade?: number;
        };
    }
}