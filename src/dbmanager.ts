import mysql, { escape } from "mysql";
import { db_config } from "../auth.json";
import xlog from "./xlogger";
import moment from "moment";
import util from 'util';
import Discord, { Guild, GuildMember, Message, PartialGuildMember, Role, User } from 'discord.js';
import { AutomoduleData, BSRow, CmdTrackingRow, DashUserObject, ExpRow, GlobalSettingRow, GuildSettingsRow, GuildUserDataRow, InsertionResult, LevelRolesRow, PartialGuildObject, PersonalExpRow, TimedAction, TwitchHookRow, UnparsedTimedAction, UserDataRow, XClient } from "./gm";
import { Bot } from "./bot";

const levelRoles = [{
        level: 70,
        name: 'no-life',
        color: '#9F2292'
    },
    {
        level: 60,
        name: 'Active x10⁹⁹',
        color: '#943246'
    },
    {
        level: 50,
        name: 'Super Hyper Active Member',
        color: '#3F62CC'
    },
    {
        level: 40,
        name: 'Hyper Active Member',
        color: '#1F8B4B'
    },
    {
        level: 25,
        name: 'Very Active Member',
        color: '#BA342A'
    },
    {
        level: 10,
        name: 'Active Member',
        color: '#BB3DA8'
    },
    {
        level: 5,
        name: 'prob not a bot level',
        color: '#a886f1'
    },
    {
        level: 1,
        name: 'noob level',
        color: '#99AAB1'
    }
];

// https://www.tutorialkart.com/nodejs/nodejs-mysql-result-object/#Example-Nodejs-MySQL-INSERT-INTO-Result-Object

export class DBManager {
    public db!: mysql.Connection;
    private query!: (arg1: string | mysql.QueryOptions) => Promise < unknown > ;

    constructor() {
        this.db;
        this.query;
    }

    async handleDisconnect(): Promise < this > {
        try {
            const conn: mysql.Connection = mysql.createConnection(db_config);
            conn.connect((err) => {
                if (err) {
                    xlog.error('error when connecting to db:', err);
                    setTimeout(this.handleDisconnect, 2000);
                    return;
                }
                xlog.log("Connected to database");
            });
            conn.on('error', (err) => {
                //console.log('db error', err);
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    this.handleDisconnect();
                } else {
                    throw err;
                }
            });

            this.db = conn;
            this.query = util.promisify(conn.query).bind(conn);
            // util.promisify(conn.query).bind(conn)
            /*(query_str, query_var => {
                return new Promise((resolve, reject) => {
                    conn.query(query)
                })
            }*/

            this.query("CREATE TABLE IF NOT EXISTS `botstats` (`updateId` int(11) NOT NULL AUTO_INCREMENT, `logDate` timestamp NOT NULL DEFAULT current_timestamp(), `numUsers` int(11) NOT NULL DEFAULT 0, `numGuilds` int(11) NOT NULL DEFAULT 1, `numChannels` int(11) NOT NULL DEFAULT 0, PRIMARY KEY (`updateId`)) ENGINE=MyISAM AUTO_INCREMENT=76 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;");
            this.query("CREATE TABLE IF NOT EXISTS `clientstats` (`stat` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,`updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),`value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,`description` text COLLATE utf8mb4_unicode_ci NOT NULL,PRIMARY KEY (`stat`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
            this.query("CREATE TABLE IF NOT EXISTS `cmdtracking` (`cmdname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,`used` int(11) NOT NULL DEFAULT 0,`iscmd` tinyint(1) NOT NULL DEFAULT 1,PRIMARY KEY (`cmdname`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
            this.query("CREATE TABLE IF NOT EXISTS `dgmxp` ( `id` varchar(40) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL, `userid` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL, `guildid` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL, `timeAdded` timestamp NOT NULL DEFAULT current_timestamp(), `timeUpdated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), `xp` int(11) NOT NULL, `level` int(11) NOT NULL DEFAULT 0, `spideySaved` timestamp NULL DEFAULT NULL, `warnings` int(11) NOT NULL DEFAULT 0, `thinice` int(1) NOT NULL DEFAULT 0, UNIQUE KEY `id` (`id`)) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            this.query("CREATE TABLE IF NOT EXISTS `globalsettings` (`name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,`value` varchar(5000) COLLATE utf8mb4_unicode_ci NOT NULL,`previousvalue` varchar(5000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,`description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,`lastupdated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),`updatedby` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '745780460034195536',`category` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',PRIMARY KEY (`name`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
            this.query("CREATE TABLE IF NOT EXISTS `guildsettings` (`id` int(11) NOT NULL AUTO_INCREMENT,`guildid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,`property` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,`value` varchar(5000) COLLATE utf8mb4_unicode_ci NOT NULL,`previousvalue` varchar(5000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
            this.query("CREATE TABLE IF NOT EXISTS `levelroles` (`id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,`guildid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,`roleid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,`level` int(11) NOT NULL DEFAULT 1,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
            this.query("CREATE TABLE IF NOT EXISTS `prefix` (`guildid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,`prefix` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,PRIMARY KEY (`guildid`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
            this.query("CREATE TABLE IF NOT EXISTS `twitchhooks` (`id` varchar(35) COLLATE utf8mb4_unicode_ci NOT NULL,`streamerid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,`guildid` varchar(18) COLLATE utf8mb4_unicode_ci NOT NULL,`channelid` varchar(18) COLLATE utf8mb4_unicode_ci NOT NULL,`streamerlogin` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,`message` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,`expires` timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
            this.query("CREATE TABLE IF NOT EXISTS `dashusers` ( `userid` VARCHAR(18) NOT NULL , `tag` TINYTEXT NOT NULL , `avatar` TEXT NOT NULL , `guilds` MEDIUMTEXT NOT NULL , PRIMARY KEY (`userid`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
            this.query("CREATE TABLE IF NOT EXISTS `timedactions` ( `actionid` varchar(18) COLLATE utf8mb4_unicode_ci NOT NULL, `exectime` timestamp NULL DEFAULT current_timestamp(), `actiontype` tinytext COLLATE utf8mb4_unicode_ci NOT NULL, `actiondata` text COLLATE utf8mb4_unicode_ci NOT NULL, PRIMARY KEY (`actionid`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            this.query("CREATE TABLE IF NOT EXISTS `userdata` ( `userid` varchar(18) COLLATE utf8mb4_unicode_ci NOT NULL, `createdat` timestamp NOT NULL DEFAULT current_timestamp(), `updatedat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), `bio` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '', `afk` text COLLATE utf8mb4_unicode_ci DEFAULT NULL, `offenses` int(11) DEFAULT 0, `nicknames` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '', PRIMARY KEY (`userid`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            this.query("CREATE TABLE IF NOT EXISTS `guilduserdata` ( `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL, `userid` varchar(18) COLLATE utf8mb4_unicode_ci NOT NULL, `guildid` varchar(18) COLLATE utf8mb4_unicode_ci NOT NULL, `createdat` timestamp NOT NULL DEFAULT current_timestamp(), `updatedat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), `offenses` int(11) NOT NULL DEFAULT 0, `warnings` int(11) NOT NULL DEFAULT 0, `bans` int(11) NOT NULL DEFAULT 0, `bio` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '', `nicknames` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '', PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci")
            //async function dbInit() {}

            return this;
        } catch (error) {
            xlog.error(`DB Error: ${error.message}\nError: ${error.stack}`);
            return this;
        }
    }

    /*escapeString(str: string) {
        return str.replace(/'/g, "\\'");
    }*/

    /**
     * query and retrieve values from the globalsettings table
     * @param {string} name name of setting to retrieve
     */
    async getGlobalSetting(name: string): Promise<GlobalSettingRow | false> {
        const rows = await <Promise<GlobalSettingRow[]>>this.query(`SELECT * FROM globalsettings WHERE name = ${mysql.escape(name)}`).catch(xlog.error);
        if (rows && rows.length > 0) {
            return rows[0];
        } else {
            return false;
        }
    }

    /**
     * Get the stored value paired to a color name in the database
     * @param name name of the color
     */
    async getColor(name: string): Promise<number> {
        if (!name.endsWith("_embed_color")) return 0;
        // color cache lookup and management should go here
        const rows = await <Promise<GlobalSettingRow[]>>this.query(`SELECT * FROM globalsettings WHERE name = ${mysql.escape(name)}`).catch(xlog.error);
        if (!rows || rows.length == 0) {
            if (name === "info_embed_color") return 279673;
            if (name === "fail_embed_color") return 16711680;
            if (name === "warn_embed_color") return 16750899;
            if (name === "success_embed_color") return 4437377;
            return 0;
        }
        if (!isNaN(parseInt(rows[0].value, 10))) {
            return parseInt(rows[0].value, 10);
        }
        return 0;
    }

    /**
     * Get the current amount of xp assigned to a user
     * @param {Discord.GuildMember} target discord user object to select in database
     */
    async getXP(target: Discord.GuildMember): Promise<ExpRow | false> {
        if (!target) return false;
        const rows = await <Promise<ExpRow[]>>this.query(`SELECT * FROM dgmxp WHERE id = '${target.user.id}${target.guild.id}'`);
        if (rows && rows.length) {
            return rows[0];
        }
        return false;
    }

    /**
     * Uses a message sent by author to update their xp in the database
     * @param {object} message message sent to be counted for author
     */
    async updateXP(message: Message): Promise<void> {
        if (!message.guild) return;
        const maxs = await this.getGlobalSetting("max_xp");

        function genXP() {
            if (!maxs) return 28;
            return Math.floor(Math.random() * (parseInt(maxs.value, 10) - 15) + 15);
        }
        this.db.query(`SELECT * FROM dgmxp WHERE id = '${message.author.id}${message.guild.id}'`, (err, rows) => {
            if (err) throw err;
            let sql;
            if (rows.length < 1) {
                sql = `INSERT INTO dgmxp (id, userid, guildid, xp, level) VALUES ('${message.author.id}${message.guild?.id}', '${message.author.id}', '${message.guild?.id}', ${genXP()}, 0)`;
            } else {
                // SENSITIVE AREA
                // xp to next level = 5 * (lvl ^ 2) + 50 * lvl + 100 for mee6
                const xp = rows[0].xp + genXP();
                let levelNow = rows[0].level;
                let totalNeeded = 0;
                for (let x = 0; x < rows[0].level + 1; x++) {
                    totalNeeded += (5 * (x ** 2)) + (50 * x) + 100;
                }
                if (xp > totalNeeded) levelNow++;
                // SENSITIVE AREA
                /*let levelNow = Math.floor(0.1 * Math.sqrt(xp));
                if (rows[0].level !== levelNow) {
                    rows[0].level = levelNow;
                }*/
                sql = `UPDATE dgmxp SET xp = ${xp}, level = ${levelNow} WHERE id = '${message.author.id}${message.guild?.id}'`

                if (message.member) {
                    this.updateLevelRole(message.member, levelNow);
                }
            }
            this.query(sql).catch((err) => {
                if (err.code === "ER_DUP_ENTRY") {
                    xlog.error('error: ER_DUP_ENTRY caught and deflected');
                    return;
                } else {
                    throw err;
                }
            });
        });
    }

    /**
     * Gets the level roles in a guild and gives them to the provided member if they are missing some
     * @param member the member to apply the xp system to
     * @param level the level of the member to apply
     */
    async updateLevelRole(member: GuildMember, level: number): Promise<boolean> {
        if (!member || !member.guild || !member.guild.id || !level) return false;
        let levelsEnabled: false | GuildSettingsRow | string = await this.getGuildSetting(member.guild, 'xp_levels');
        levelsEnabled = levelsEnabled ? levelsEnabled.value : false;
        if (levelsEnabled === "enabled") {
            member.guild.roles = await member.guild.roles.fetch();
            const levelRows = await this.checkForLevelRoles(member.guild);
            if (!levelRows) return false;
            const availableRoles = [];
            for (let i = 0; i < levelRows.length; i++) {
                const r = levelRows[i];
                if (r.level <= level) {
                    availableRoles.push(member.guild.roles.cache.find(ro => ro.id === r.roleid) || null);
                }
            }
            if (availableRoles && availableRoles.length > 0) {
                for (let i = 0; i < availableRoles.length; i++) {
                    const r = availableRoles[i];
                    if (r) {
                        if (member.guild.me && r.comparePositionTo(member.guild.me.roles.highest) < 0) {
                            if (!member.roles.cache.find(ro => ro.id === r.id)) {
                                member.roles.add(r, 'levelling up').catch(console.error);
                            }
                        }
                    }

                }
            }
            return true;
        } else {
            return false;
        }
    }

    async checkForLevelRoles(guild: Guild): Promise<LevelRolesRow[] | void> {
        try {
            if (!guild) return;
            let levelRows = await <Promise<LevelRolesRow[]>>this.query(`SELECT * FROM levelroles WHERE guildid = '${guild.id}' ORDER BY level DESC`);
            if (!levelRows || !levelRows.length) {
                for (const ro of levelRoles) {
                    const roleToAdd = await guild.roles.create({
                        data: {
                            name: ro.name || `Level ${ro.level}`,
                            color: ro.color || '#99AAB1',
                            permissions: 0,
                            position: 1
                        }
                    });
                    await this.query(`INSERT INTO levelroles (id, guildid, roleid, level) VALUES ('${guild.id + roleToAdd.id}', '${guild.id}', '${roleToAdd.id}', ${ro.level})`);
                }
                levelRows = await <Promise<LevelRolesRow[]>>this.query(`SELECT * FROM levelroles WHERE guildid = ${guild.id} ORDER BY level DESC`);
            } else {
                for (let i = 0; i < levelRows.length; i++) {
                    const dbro = guild.roles.cache.find(ro => ro.id === levelRows[i].roleid);
                    if (!dbro) {
                        await this.query(`DELETE FROM levelroles WHERE roleid = '${levelRows[i].roleid}'`).catch(e => console.log(e.stack))
                        levelRows.splice(i, 1);
                    }
                }
            }
            return levelRows;
        } catch (error) {
            xlog.error(error);
        }
    }

    /**
     * add a new row of current statistics to gm counters
     * @param {object} client running discord client
     */
    async updateBotStats(client: XClient): Promise<void> {
        try {
            const users = client.users.cache.size;
            const guilds = client.guilds.cache.size;
            const channels = client.channels.cache.size;
            this.query(`INSERT INTO botstats (numUsers, numGuilds, numChannels) VALUES (${users}, ${guilds}, ${channels})`);
        } catch (error) {
            xlog.error(error);
        }
    }

    /**
     * get the current db stats for gm counters
     * @param {int} limiter number of past hours to retrieve
     */
    async getGMStats(limiter = 24): Promise<BSRow[]> {
        const rows = await <Promise<BSRow[]>>this.query(`SELECT * FROM botstats ORDER BY updateId DESC LIMIT ${limiter}`).catch(xlog.error);
        return rows;
    }

    /**
     * Update a setting for config in the global settings database
     * @param selectortype column being used to select (name, category)
     * @param selectorvalue value of column for selection
     * @param updateuser user
     * @param value setting value
     * @returns result object with edit information, or string for promise rejection
     */
    async editGlobalSettings(selectortype = "", selectorvalue = "", updateuser: User, value = ""): Promise<InsertionResult> {
        return new Promise((resolve, reject) => {
            if (!selectortype || !selectorvalue || !value || !updateuser || !updateuser.id || typeof selectorvalue !== "string" || typeof value !== "string") return reject("MISSING_VALUES");
            if (selectortype !== "name" && selectortype !== "category") return reject("NAME_OR_CAT");
            selectorvalue = selectorvalue.replace(/'/g, "\\'");
            value = value.replace(/'/g, "\\'");
            this.db.query(`UPDATE \`globalsettings\` SET \`previousvalue\`=\`value\`,\`value\`='${value}',\`updatedby\`='${updateuser.id}' WHERE \`${selectortype}\`='${selectorvalue}'`, (err, result: InsertionResult) => {
                if (err) throw err;
                if (result.affectedRows > 0) {
                    return resolve(result);
                } else if (selectortype === "name") {
                    this.db.query(`INSERT INTO \`globalsettings\`(\`name\`, \`value\`, \`updatedby\`, \`category\`) VALUES ('${selectorvalue}','${value}','${updateuser.id}', 'general')`, (err, result: InsertionResult) => {
                        if (err) throw err;
                        resolve(result);
                    });
                } else {
                    return reject("NONEXISTENT");
                }
            });
        });
    }

    /**
     * Get the prefix for a guild if it has one, otherwise it will be the default prefix stored in GlobalSettings
     * @param guildid Guild ID
     */
    async getPrefix(guildid = ""): Promise<string | false> {
        const rows = await <Promise<{guildid: string, prefix:string}[]>>this.query(`SELECT \`prefix\` FROM \`prefix\` WHERE \`guildid\` = '${guildid}'`).catch(xlog.error);
        if (rows.length > 0) {
            return rows[0].prefix;
        } else {
            return false;
        }
    }

    /**
     * Change the prefix (before commands) per guilds
     * @param guildid ID of guild to update
     * @param newprefix New prefix for guild
     */
    async setPrefix(guildid = "", newprefix = ""): Promise<void> {
        newprefix = newprefix.replace(/'/g, "\\'");
        const rows = await <Promise<{guildid: string, prefix: string}[]>>this.query(`SELECT \`prefix\` FROM \`prefix\` WHERE \`guildid\` = '${guildid}'`).catch(xlog.error);
        if (rows.length > 0) {
            await <Promise<InsertionResult>>this.query(`UPDATE \`prefix\` SET \`prefix\`='${newprefix}' WHERE \`guildid\`='${guildid}'`).catch(xlog.error);
        } else {
            await <Promise<InsertionResult>>this.query(`INSERT INTO \`prefix\`(\`guildid\`, \`prefix\`) VALUES ('${guildid}', '${newprefix}')`).catch(xlog.error);
        }
    }

    /**
     * Gets the top 10 members by xp of a guild plus the ranking of the provided member.
     * @param {string} guildid id of guild to look up
     * @param {string} memberid id of member in guild to look up
     */
    async getTop10(guildid = "", memberid = ""): Promise<{rows: ExpRow[], personal: PersonalExpRow} | false> {
        const rows = await <Promise<ExpRow[]>>this.query(`SELECT * FROM \`dgmxp\` WHERE \`guildid\` = '${guildid}' ORDER BY \`xp\` DESC LIMIT 10`);
        const personalrows = await <Promise<PersonalExpRow[]>>this.query(`SELECT userid, xp, level , FIND_IN_SET( xp, ( SELECT GROUP_CONCAT( xp ORDER BY xp DESC ) FROM dgmxp WHERE guildid = '${guildid}' ) ) AS rank FROM dgmxp WHERE id = '${memberid}${guildid}'`);
        if (!rows.length) return false;
        return {
            rows: rows || [],
            personal: personalrows[0] || false
        };
    }

    /**
     * Gets the value of a discord guild setting, if it exists.
     * @param {object} guild guild object
     * @param {string} name property name
     */
    async getGuildSetting(guild: string | Guild, name: string): Promise<GuildSettingsRow | false> {
        try {
            if (!guild) return false;
            const gid = guild instanceof Guild ? guild.id : guild;
            const rows = await <Promise<GuildSettingsRow[]>>this.query(`SELECT * FROM guildsettings WHERE guildid = '${gid}' AND property = '${name}'`).catch(xlog.error);
            if (rows.length > 0) {
                return rows[0];
            } else {
                return false;
            }
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    /**
     * Edits or deletes a setting for an individual Discord Guild.
     * @param guild guild object to edit the settings for
     * @param name property name of the setting
     * @param value value to set for the property
     * @param deleting whether to delete the setting
     */
    async editGuildSetting(guild: Guild, name = "", value = "", deleting = false): Promise<InsertionResult> {
        return new Promise((resolve, reject) => {
            if (!guild || !guild.id || !name) return reject("MISSING_VALUES");
            if (deleting) {
                return this.db.query(`DELETE FROM \`guildsettings\` WHERE guildid = ${escape(guild.id)} AND property = ${escape(name)}`, (err, result: InsertionResult) => {
                    if (err) throw err;
                    if (result.affectedRows > 0) {
                        return resolve(result);
                    } else {
                        reject('NO_DELETION');
                    }
                });
            }
            if (!value) return reject("MISSING_VALUES");
            this.db.query(`UPDATE \`guildsettings\` SET \`previousvalue\`=\`value\`,\`value\`=${escape(value)} WHERE guildid = ${escape(guild.id)} AND property = ${escape(name)}`, (err, result: InsertionResult) => {
                if (err) throw err;
                if (result.affectedRows > 0) {
                    return resolve(result);
                } else {
                    this.db.query(`INSERT INTO \`guildsettings\`(\`guildid\`, \`property\`, \`value\`) VALUES (${escape(guild.id)}, ${escape(name)}, ${escape(value)})`, (err, result: InsertionResult) => {
                        if (err) throw err;
                        resolve(result);
                    });
                }
            });
        });
    }

    /**
     * Deletes the xp entry for a member of a guild.
     * @param {object} member guild member to delete the xp for
     */
    async clearXP(member: GuildMember | PartialGuildMember): Promise<number> {
        if (!member || !member.id || !member.guild || !member.guild.id) return 0;
        const result = await <Promise<InsertionResult>>this.query(`DELETE FROM dgmxp WHERE guildid = '${member.guild.id}' AND userid = '${member.id}'`).catch(xlog.error);
        return result.affectedRows || 0;
    }

    /**
     * Deletes all xp entries for a guild.
     * @param {object} guild guild to delete the xp from
     */
    async massClearXP(guild: Guild): Promise<number> {
        if (!guild) return 0;
        const result = await <Promise<InsertionResult>>this.query(`DELETE FROM dgmxp WHERE guildid = '${guild.id}'`).catch(xlog.error);
        return result.affectedRows || 0;
    }

    /**
     * Configure the role reward roles for a given guild.
     * @param {number} level the current level for the role to be set to
     * @param {Discord.Guild} guild the guild for the role to be set to
     * @param {Discord.Role} role the role to be added or configured
     * @param {boolean} deleting whether or not the given role should be deleted from the database, if true the level param will be ignored
     */
    async setLevelRole(level: number | null, guild: Guild, role: Role, deleting = false): Promise<LevelRolesRow[] | number | false> {
        if (!guild || !guild.id) return false;
        let result;
        if (role && deleting) {
            if (!role.id) return false;
            result = await <Promise<InsertionResult>>this.query(`DELETE FROM levelroles WHERE guildid = '${guild.id}' AND roleid = '${role.id}'`);
            return result.affectedRows || false;
        }
        if (level && role) {
            if (isNaN(level) || !role.id) return false;
            result = await <Promise<InsertionResult>>this.query(`UPDATE levelroles SET level = ${level} WHERE guildid = '${guild.id}' AND roleid = '${role.id}'`);
            if (!result) return false;
            if (result.affectedRows === 0) {
                //guild.roles.create()
                result = await <Promise<InsertionResult>>this.query(`INSERT INTO levelroles (id, guildid, roleid, level) VALUES ('${guild.id + role.id}', '${guild.id}', '${role.id}', ${level})`);
            }
            return result.affectedRows;
        }
        if (role) {
            if (!role.id) return false;
            result = await <Promise<LevelRolesRow[]>>this.query(`SELECT * FROM levelroles WHERE guildid = '${guild.id}' AND roleid = '${role.id}'`);
            if (!result.length) return false;
            return result;
        }
        result = await <Promise<LevelRolesRow[]>>this.query(`SELECT * FROM levelroles WHERE guildid = '${guild.id}' ORDER BY level DESC`);
        if (!result[0]) return false;
        return result;
    }

    /**
     * Deletes all of the level roles for a given guild
     * @param {Discord.Guild} guild the guild to delete the roles of
     */
    async deleteAllLevelRoles(guild: Guild): Promise<InsertionResult | false> {
        if (!(guild instanceof Discord.Guild)) return false;
        const result = await <Promise<InsertionResult>>this.query(`DELETE FROM levelroles WHERE guildid = '${guild.id}'`);
        if (result && result.affectedRows > 0) return result;
        return false;
    }

    /**
     * Log command usage (after execution)
     * @param {string} name name of command being logged
     */
    async logCmdUsage(name: string): Promise<void> {
        try {
            const oresult = await <Promise<CmdTrackingRow[]>>this.query(`SELECT * FROM cmdtracking WHERE cmdname = 'all'`);
            const result = await <Promise<CmdTrackingRow[]>>this.query(`SELECT * FROM cmdtracking WHERE cmdname = '${name}'`);
            if (!oresult || oresult.length === 0) {
                await <Promise<InsertionResult>>this.query(`INSERT INTO cmdtracking (cmdname, used) VALUES ('all', 1)`);
            } else {
                await <Promise<InsertionResult>>this.query(`UPDATE cmdtracking SET used = used + 1 WHERE cmdname = 'all'`);

            }
            if (!result || result.length === 0) {
                await <Promise<InsertionResult>>this.query(`INSERT INTO cmdtracking (cmdname, used) VALUES ('${name}', 1)`);
            } else {
                await <Promise<InsertionResult>>this.query(`UPDATE cmdtracking SET used = used + 1 WHERE cmdname = '${name}'`);
            }
        } catch (error) {
            xlog.error(error);
        }
    }

    /**
     * Get total number of commands sent from db
     * @returns {number} result object with edit information, or string for promise rejection
     */
    async getTotalCmdUsage(): Promise<CmdTrackingRow[] | undefined> {
        try {
            return await <Promise<CmdTrackingRow[]>>this.query(`SELECT * FROM cmdtracking WHERE cmdname = 'all'`);
        } catch (error) {
            xlog.error(error);
        }
    }

    /**
     * Update a setting for config in the global settings database
     */
    async logMsgReceive(): Promise<void> {
        try {
            const result = await <Promise<GlobalSettingRow[]>>this.query(`SELECT * FROM globalsettings WHERE name = 'mreceived'`);
            if (!result || result.length === 0) {
                await <Promise<InsertionResult>>this.query(`INSERT INTO globalsettings (name, value) VALUES ('mreceived', '1')`);
            } else {
                await <Promise<InsertionResult>>this.query(`UPDATE \`globalsettings\` SET \`previousvalue\`=\`value\`,\`value\`= value + 1 WHERE \`name\`='mreceived'`);
            }
        } catch (error) {
            xlog.error(error);
        }
    }

    /**
     * Update a setting for config in the global settings database
     */
    async logDefined(): Promise<void> {
        try {
            const result = await <Promise<GlobalSettingRow[]>>this.query(`SELECT * FROM globalsettings WHERE name = 'definedcount'`);
            if (!result || result.length === 0) {
                await <Promise<InsertionResult>>this.query(`INSERT INTO globalsettings (name, value) VALUES ('definedcount', '1')`);
            } else {
                await <Promise<InsertionResult>>this.query(`UPDATE globalsettings SET previousvalue=value, value=value + 1 WHERE name='definedcount'`);
            }
        } catch (error) {
            xlog.error(error);
        }
    }

    /**
     * Set that spidey saved a member
     * @param {Discord.GuildMember} member object of the member who was saved
     */
    async setSpideySaved(target: GuildMember): Promise<boolean> {
        try {
            const result = await <Promise<ExpRow[]>>this.query(`SELECT * FROM dgmxp WHERE id = '${target.user.id}${target.guild.id}'`);
            if (!result || result.length === 0) {
                return false;
            } else {
                //const mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                await this.query(`UPDATE dgmxp SET spideySaved = CURRENT_TIMESTAMP WHERE id = '${target.user.id}${target.guild.id}'`);
                return true;
            }
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    /**
     * Create a subscription entry for Twitch webhooks in the database
     * @param streamerid twitch id of streamer
     * @param guildid id of guild for subscription
     * @param expiredate a parseable date to be used to sort by timestamps for renewal
     * @param message (optional) the message that will be sent with the discord notification
     */
    async addTwitchSubscription(streamerid: string, guildid: string, channelid: string, expiredate: moment.DurationInputArg1, message = "", name: string): Promise<boolean> {
        try {
            if (!streamerid || !guildid || !channelid || !expiredate || !name) return false;
            const result = await <Promise<TwitchHookRow[]>>this.query(`SELECT * FROM twitchhooks WHERE streamerid = '${streamerid}' AND guildid = '${guildid}'`);
            const expiresTimestamp = moment().add(expiredate).format('YYYY-MM-DD HH:mm:ss');
            message = message.replace(/'/g, "\\'");
            if (!result || !result[0]) {
                if (!message || !message.length || typeof message !== "string") {
                    await this.query(`INSERT INTO twitchhooks (id, streamerid, guildid, channelid, expires, streamerlogin) VALUES ('${streamerid}${guildid}', '${streamerid}', '${guildid}', '${channelid}', '${expiresTimestamp}', '${name}')`);
                } else {
                    await this.query(`INSERT INTO twitchhooks (id, streamerid, guildid, channelid, message, expires, streamerlogin) VALUES ('${streamerid}${guildid}', '${streamerid}', '${guildid}', '${channelid}', '${message}', '${expiresTimestamp}', '${name}')`);
                }
                return true;
            } else {
                if (!message || !message.length || typeof message !== "string") {
                    await this.query(`UPDATE twitchhooks SET expires = '${expiresTimestamp}', streamerlogin = '${name}' WHERE id = '${streamerid}${guildid}'`);
                } else {
                    await this.query(`UPDATE twitchhooks SET expires = '${expiresTimestamp}', streamerlogin = '${name}', message = '${message}' WHERE id = '${streamerid}${guildid}'`);
                }
                return true;
            }
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    /**
     * Create a subscription entry for Twitch webhooks in the database
     * @param {string} streamerid twitch id of streamer
     * @param {string} guildid id of guild for subscription
     * @param {*} expiredate a parseable date to be used to sort by timestamps for renewal
     * @param {string} message (optional) the message that will be sent with the discord notification
     */
    async removeTwitchSubscription(streamerid: string, guildid: string): Promise<number | false> {
        try {
            if (!streamerid || !guildid) return false;
            const delresult = await <Promise<InsertionResult>>this.query(`DELETE FROM twitchhooks WHERE streamerid = '${streamerid}' AND guildid = '${guildid}'`);
            return delresult.affectedRows;
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    /**
     * get a list of database entries that use a specified streamer id
     * @param {string} streamerid twitch id of streamer
     */
    async getTwitchSubsForID(streamerid: string): Promise<false | TwitchHookRow[]> {
        try {
            if (!streamerid) return false;
            const result = await <Promise<TwitchHookRow[]>>this.query(`SELECT * FROM twitchhooks WHERE streamerid = '${streamerid}'`);
            if (!result.length) return false;
            return result;
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    /**
     * get a list of database entries that belong to a specific guild
     * @param {string} streamerid twitch id of streamer
     */
    async getTwitchSubsGuild(guildid: string): Promise<false | TwitchHookRow[]> {
        try {
            if (!guildid) return false;
            const result = await <Promise<TwitchHookRow[]>>this.query(`SELECT * FROM twitchhooks WHERE guildid = '${guildid}'`);
            if (!result.length) return false;
            return result;
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    async updateDashUser(id: string, username: string, discriminator: string, avatar: string, guilds: PartialGuildObject[]): Promise<false | InsertionResult> {
        try {
            if (!id || !username || !discriminator || !guilds) return false;
            if (!avatar) {
                avatar = "";
            }
            if (!(typeof guilds === "object")) {
                return false;
            }
            username = username.replace(/'/g, "\\'");
            avatar = avatar.replace(/'/g, "\\'");
            const guildString = JSON.stringify(guilds).replace(/'/g, "\\'");
            const result = await <Promise<InsertionResult>>this.query(`INSERT INTO dashusers (userid, tag, avatar, guilds) VALUES ('${id}', '${username}#${discriminator}' , '${avatar}', '${guildString}') ON DUPLICATE KEY UPDATE tag = '${username}#${discriminator}', avatar = '${avatar}', guilds = '${guildString}'`);
            if (!result || !result.affectedRows) {
                return false;
            }
            return result;
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    async getDashUser(id: string): Promise<false | DashUserObject> {
        try {
            if (!id) return false;
            id = id.replace(/'/g, "\\'");
            const result = await <Promise<{userid: string, tag: string, avatar: string, guilds: string}[]>>this.query(`SELECT * FROM dashusers WHERE userid = '${id}'`);
            if (!result || !result[0] || !result[0].userid) {
                return false;
            }
            const fr = result[0];
            const dashuser: DashUserObject = {
                id: fr.userid,
                tag: fr.tag,
                avatar: fr.avatar,
                guilds: JSON.parse(fr.guilds) || []
            }
            return dashuser;
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    /**
     * Set an action to be executed automatically at a given time
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setAction(id: string, time: Date, actionType: string, data: Record<string, any>): Promise<boolean> {
        try {
            const mtime = moment(time).format('YYYY-MM-DD HH:mm:ss');
            const actionData = JSON.stringify(data).replace(/'/g, "\\'");

            const r = await <Promise<InsertionResult>>this.query(`INSERT INTO timedactions (actionid, exectime, actiontype, actiondata) VALUES ('${id.replace(/'/g, "\\'")}', '${mtime.replace(/'/g, "\\'")}', '${actionType.replace(/'/g, "\\'")}', '${actionData}')`);

            if (!r || !r.affectedRows) {
                return false;
            }
            return true;
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    /**
     * Get all actions up to the number of give seconds ahead of the current time.
     * @param lookahead number representing the number of seconds to look ahead in the db
     */
    async getActions(lookahead: number): Promise<TimedAction[] | false> {
        if (lookahead < 0 || lookahead > 3600) return false;
        const et = moment().add(lookahead, "seconds").format('YYYY-MM-DD HH:mm:ss');
        const r = await <Promise<UnparsedTimedAction[]>>this.query(`SELECT * FROM timedactions WHERE exectime <= '${et.replace(/'/g, "\\'")}'`);
        if (!r || !r.length) {
            return [];
        }
        const parsed: TimedAction[] = [];
        for (const a of r) {
            const b: TimedAction = {
                id: a.actionid,
                time: moment(a.exectime).toDate(),
                type: a.actiontype,
                data: JSON.parse(a.actiondata)
            }
            parsed.push(b);
        }
        return parsed;
    }

    async deleteAction(id: string): Promise<InsertionResult> {
        const result = await <Promise<InsertionResult>>this.query(`DELETE FROM timedactions WHERE actionid = '${id.replace(/'/g, "\\'")}'`);
        return result;
    }

    async getUserData(userid: string): Promise<UserDataRow | false> {
        try {
            const rows = await <Promise<UserDataRow[]>>this.query(`SELECT * FROM userdata WHERE userid = '${userid.replace(/'/g, "\\'")}'`);
            if (rows && rows.length > 0) {
                return rows[0];
            } else {
                return false;
            }
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    /**
     * Update a user's data. This is global data (opposed to guild data).
     */
    async updateUserData(userid: string, afk?: string | null, offenses?: number, nickname?: string): Promise<InsertionResult | false> {
        try {
            if (!userid) return false;
            userid = escape(userid);
            if (afk === "~~off~~") afk = null;
            const sql = `INSERT INTO userdata (userid, afk, offenses, nicknames) VALUES (${userid}, ${escape(afk)}, ${escape(offenses || 0)}, ${escape(nickname || "")}) ON DUPLICATE KEY UPDATE afk = COALESCE(${escape(afk)}, afk), offenses = COALESCE(${escape(offenses)}, offenses), nicknames = COALESCE(${escape(nickname)}, nicknames)`;
            const result = await <Promise<InsertionResult>>this.query(sql);
            if (!result || !result.affectedRows) {
                return false;
            }
            return result;
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    async getGuildSettingsByPrefix(guildid: string, prefix: string): Promise<GuildSettingsRow[] | false> {
        if (!guildid || !prefix) return false;
        const result = await <Promise<GuildSettingsRow[]>>this.query(`SELECT * FROM \`guildsettings\` WHERE \`guildid\` = '${guildid.replace(/'/g, "\\'")}' AND \`property\` LIKE '${prefix.replace(/'/g, "\\'")}%'`);
        if (!result || !result.length) {
            return [];
        }
        return result;
    }

    async getAutoModule(guildid: string, mod: string, row?: GuildSettingsRow): Promise<AutomoduleData> {
        const defaults: AutomoduleData = {
            name: mod,
            text: false,
            enableAll: false,
            applyRoles: [],
            roleEffect: 'ignore',
        }
        defaults.text = Bot.client.services?.isText(`automod_${mod}`) || false;
        if (defaults.text) {
            defaults.channels = [];
            defaults.channelEffect = 'enable';
        }
        const safeParseAM = (r: GuildSettingsRow) => {
            try {
                const parsed = JSON.parse(r.value);
                if (typeof parsed.name !== "string" || typeof parsed.text !== "boolean" || typeof parsed.enableAll !== "boolean" || typeof parsed.applyRoles !== "object" || typeof parsed.roleEffect !== "string" || (defaults.text && (typeof parsed.channels !== "object" || typeof parsed.channelEffect !== "string"))) {
                    return defaults;
                } else {
                    return parsed;
                }
            } catch (error) {
                return defaults;
            }
        }
        if (!guildid || !mod) return defaults;
        if (row) {
            return safeParseAM(row);
        }
        // I have no idea why I didn't just do getGuildSetting in the first place, my stupid fucking error caused it to get any existing automod setting in the db causing it to activate automod for all servers.
        //const result = await <Promise<GuildSettingsRow[]>>this.query(`SELECT * FROM guildsettings WHERE property = 'automod_${mod.replace(/'/g, "\\'")}'`);
        const result = await this.getGuildSetting(guildid, `automod_${mod}`);
        if (result) {
            return safeParseAM(result);
        }
        return defaults;
    }

    async getAllAutoModules(guildid: string): Promise<AutomoduleData[]> {
        if (!guildid) return [];
        const services = Bot.client.services?.automods || [];
        const modConf = await this.getGuildSettingsByPrefix(guildid, "automod_") || [];
        const guildMods: AutomoduleData[] = [];
        for await (const serv of services) {
            const am = await this.getAutoModule(guildid, serv, modConf.find(x => x.property === `automod_${serv}`));
            guildMods.push(am);
        }
        return guildMods;
    }

    async getAutoModuleEnabled(guildid: string, mod: string, channelid?: string, anywhere?: boolean, roleid?: string): Promise<false | AutomoduleData> {
        if (!guildid || !mod) return false;
        const m = await this.getAutoModule(guildid, mod);

        if (m.enableAll || m.channels?.length || m.channelEffect === "disable") {
            if (m.enableAll) {
                return m;
            }

            if (channelid && m.channels?.includes(channelid)) {
                if (m.channelEffect === "enable") {
                    return m;
                }
                if (m.channelEffect === "disable") {
                    return false;
                }
            }

            if (m.channelEffect === "disable") {
                return m;
            }

            if (anywhere && (m.channels?.length)) {
                return m;
            }
        }
        return false;
    }

    async getGuildUserData(guildid: string, userid: string): Promise<GuildUserDataRow | false> {
        try {
            const rows = await <Promise<GuildUserDataRow[]>>this.query(`SELECT * FROM guilduserdata WHERE id = ${escape(guildid + userid)}`);
            if (rows && rows.length > 0) {
                return rows[0];
            } else {
                return false;
            }
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }

    /**
     * Update a user's data. This is global data (opposed to guild data).
     */
    async updateGuildUserData(guildid: string, userid: string, offenses?: number, warnings?: number, bans?: number, bio?: string, nicknames?: string): Promise<InsertionResult | false> {
        try {
            if (!guildid || !userid) return false;
            const sql = `INSERT INTO guilduserdata (id, userid, guildid, offenses, warnings, bans, bio, nicknames) VALUES (${escape(guildid + userid)}, ${escape(userid)}, ${escape(guildid)}, ${escape(offenses || 0)}, ${escape(warnings || 0)}, ${escape(bans || 0)}, ${escape(bio || "")}, ${escape(nicknames || "")}) ON DUPLICATE KEY UPDATE offenses = COALESCE(${escape(offenses)}, offenses), warnings = COALESCE(${escape(warnings)}, warnings), bans = COALESCE(${escape(bans)}, bans), bio = COALESCE(${escape(bio)}, bio), nicknames = COALESCE(${escape(nicknames)}, nicknames)`;
            const result = await <Promise<InsertionResult>>this.query(sql);
            if (!result || !result.affectedRows) {
                return false;
            }
            return result;
        } catch (error) {
            xlog.error(error);
            return false;
        }
    }
}
