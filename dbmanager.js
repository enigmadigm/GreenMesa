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

async function getXP(message, target) {
    let rows = await query(`SELECT * FROM dgmxp WHERE id = '${target.id}'`);
    return rows;
}

async function updateXP(message) {
    function genXP() {
        return Math.floor(Math.random() * getGlobalSetting("max_xp"));
    }
    conn.query(`SELECT * FROM dgmxp WHERE id = '${message.author.id}'`, (err, rows) => {
        if (err) throw err;
        let sql;
        if (rows.length < 1) {
            sql = `INSERT INTO dgmxp (id, xp) VALUES ('${message.author.id}', '${genXP()}')`;
        } else {
            let xp = rows[0].xp;
            sql = `UPDATE dgmxp SET xp = ${xp + genXP()} WHERE id = '${message.author.id}'`
        }
        conn.query(sql);
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
 * query and retrieve values from the globalsettings table
 * @param {string} name name of setting to retrieve
 */
async function getGlobalSetting(name) {
    let rows = await query(`SELECT * FROM globalsettings WHERE name = "${name}"`).catch(xlog.error);
    return rows;
}

exports.conn = conn;
exports.getXP = getXP;
exports.updateXP =  updateXP;
exports.updateBotStats = updateBotStats;
exports.getGMStats = getGMStats;
exports.getGlobalSetting = getGlobalSetting;
