import { ShardingManager } from 'discord.js';
import config from "../auth.json";
import xlg from './xlogger';

const manager = new ShardingManager('./dist/bot.js', { token: config.token });

manager.on('shardCreate', shard => {
    xlg.log(`Launched shard ${shard.id}`);
    shard.on("death", () => {
        shard.respawn();
    });
});
manager.spawn();
