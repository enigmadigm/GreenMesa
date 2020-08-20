const mysql = require("mysql");
const { db_config } = require("./auth.json");
const xlog = require("./xlogger");
const util = require('util');
var conn;

function handleDisconnect() {
    conn = mysql.createConnection(db_config);
    conn.connect(function(err) {
        if (err) {
            xlog.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
            return;
        }
        xlog.log("Connected to database");
    });
    conn.on('error', function(err) {
        //console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

const query = util.promisify(conn.query).bind(conn);

/**
 * query and retrieve values from the globalsettings table
 * @param {string} name name of setting to retrieve
 */
async function getGlobalSetting(name) {
    let rows = await query(`SELECT * FROM globalsettings WHERE name = "${name}"`).catch(xlog.error);
    if (rows.length > 0) {
        return rows;
    } else {
        return false;
    }
}

/**
 * Get the current amount of xp assigned to a user
 * @param {object} message sent message
 * @param {object} target discord user object to select in database
 */
async function getXP(message, target) {
    let rows = await query(`SELECT * FROM dgmxp WHERE id = '${target.id}${message.guild.id}'`);
    return rows;
}

/**
 * Uses a message sent by author to update their xp in the database
 * @param {object} message message sent to be counted for author
 */
async function updateXP(message) {
    let maxs = await getGlobalSetting("max_xp");
    function genXP() {
        if (!maxs[0]) return 28;
        return Math.floor(Math.random() * (maxs[0].value - 15) + 15);
    }
    conn.query(`SELECT * FROM dgmxp WHERE id = '${message.author.id}${message.guild.id}'`, (err, rows) => {
        if (err) throw err;
        let sql;
        if (rows.length < 1) {
            sql = `INSERT INTO dgmxp (id, userid, guildid, xp, level) VALUES ('${message.author.id}${message.guild.id}', '${message.author.id}', '${message.guild.id}', '${genXP()}', '0')`;
        } else {
            let xp = rows[0].xp;
            let gennedxp = genXP();
            let levelNow = Math.floor(0.1 * Math.sqrt(xp));
            if (rows[0].level !== levelNow) {
                rows[0].level = levelNow;
            }
            sql = `UPDATE dgmxp SET xp = ${xp + gennedxp}, level = ${rows[0].level} WHERE id = '${message.author.id}${message.guild.id}'`
        }
        query(sql).catch((err) => {
            if (err.code === "ER_DUP_ENTRY") {
                return xlog.error('error: ER_DUP_ENTRY caught and deflected');
            } else {
                throw err;
            }
        });
    });
}

/**
 * add a new row of current statistics to gm counters
 * @param {object} client running discord client
 */
async function updateBotStats(client) {
    query(`INSERT INTO botstats (numUsers, numGuilds, numChannels) VALUES (${client.users.cache.size}, ${client.guilds.cache.size}, ${client.channels.cache.size})`).catch(xlog.error);
}

/**
 * get the current db stats for gm counters
 * @param {int} limiter number of past hours to retrieve
 */
async function getGMStats(limiter = 24) {
    let rows = await query(`SELECT * FROM botstats ORDER BY updateId DESC LIMIT ${limiter}`).catch(xlog.error);
    return rows;
}

/**
 * Update a setting for config in the global settings database
 * @param {string} selectortype column being used to select (name, category)
 * @param {string} selectorvalue value of column for selection
 * @param {string} value setting value
 * @param {object} updatedby user
 */
async function editGlobalSettings(selectortype = "", selectorvalue = "", updateuser, value = "") {
    return new Promise((resolve, reject) => {
        if (!selectortype || !selectorvalue || !value || !updateuser || !updateuser.id || typeof selectorvalue !== "string" || typeof value !== "string") return reject("MISSING_VALUES");
        if (selectortype !== "name" && selectortype !== "category") return reject("NAME_OR_CAT");
        conn.query(`UPDATE \`globalsettings\` SET \`previousvalue\`=\`value\`,\`value\`='${value}',\`updatedby\`='${updateuser.id}' WHERE \`${selectortype}\`='${selectorvalue}'`, (err, result) => {
            if (err) throw err;
            if (result.affectedRows > 0) {
                return resolve(result);
            } else if (selectortype === "name") {
                conn.query(`INSERT INTO \`globalsettings\`(\`name\`, \`value\`, \`updatedby\`) VALUES ('${selectorvalue}','${value}','${updateuser.id}')`, (err, result) => {
                    if (err) throw err;
                    resolve(result);
                });
            } else {
                return reject("NONEXISTENT");
            }
        });
    })

}

async function getPrefix(guildid = "") {
    let rows = await query(`SELECT \`prefix\` FROM \`prefix\` WHERE \`guildid\` = '${guildid}'`).catch(xlog.error);
    if (rows.length > 0) {
        return rows[0].prefix;
    } else {
        return false;
    }
}

async function setPrefix(guildid = "", newprefix = "") {
    let rows = await query(`SELECT \`prefix\` FROM \`prefix\` WHERE \`guildid\` = '${guildid}'`).catch(xlog.error);
    if (rows.length > 0) {
        rows = await query(`UPDATE \`prefix\` SET \`prefix\`='${newprefix}' WHERE \`guildid\`='${guildid}'`).catch(xlog.error);
    } else {
        rows = await query(`INSERT INTO \`prefix\`(\`guildid\`, \`prefix\`) VALUES ('${guildid}', '${newprefix}')`).catch(xlog.error);
    }
}

async function getTop10(guildid = "", memberid = "") {
    let rows = await query(`SELECT * FROM \`dgmxp\` WHERE \`guildid\` = '${guildid}' ORDER BY \`xp\` DESC LIMIT 12`);
    let personalrows = await query(`SELECT userid, xp, level , FIND_IN_SET( xp, ( SELECT GROUP_CONCAT( xp ORDER BY xp DESC ) FROM dgmxp WHERE guildid = '${guildid}' ) ) AS rank FROM dgmxp WHERE id = '${memberid}${guildid}'`);
    if (!rows.length) return false;
    return { rows: rows || [], personal: personalrows[0] || false };
}

exports.conn = conn;
exports.getXP = getXP;
exports.updateXP =  updateXP;
exports.updateBotStats = updateBotStats;
exports.getGMStats = getGMStats;
exports.getGlobalSetting = getGlobalSetting;
exports.editGlobalSettings = editGlobalSettings;
exports.getPrefix = getPrefix;
exports.setPrefix = setPrefix;
exports.getTop10 = getTop10;
