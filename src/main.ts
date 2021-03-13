import { ShardingManager } from 'discord.js';
import config from "../auth.json";
import xlg from './xlogger';

const manager = new ShardingManager('./dist/bot.js', { token: config.token });

manager.on('shardCreate', shard => {
    xlg.log(`Launched shard ${shard.id}`);
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
