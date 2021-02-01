declare namespace Express {
    interface Request {
        user: User;
        twitch_hub: string;
        twitch_hex: string;
        twitch_signature: string;
    }
    interface User {
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
    }
}