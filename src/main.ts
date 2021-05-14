import { ShardingManager } from 'discord.js';
import config from "../auth.json";
import moment from 'moment'; // require
import "./xlogger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (a: any) => {
    const now = moment().format();
    console.log(`[COMMANDER] [${now}]`, a);
}

const manager = new ShardingManager('./dist/bot.js', { token: config.token });

manager.on('shardCreate', shard => {
    log(`Launched shard ${shard.id}`);
    let timer: NodeJS.Timeout;
    shard.on("death", () => {
        if (timer) {
            timer = setTimeout(() => {
                shard.respawn();
                clearTimeout(timer);
            }, 5000)
        }
    });
});
manager.spawn();
