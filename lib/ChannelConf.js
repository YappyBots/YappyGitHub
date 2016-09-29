const db = require('sqlite');
const path = require('path');
const dbPath = path.resolve(__dirname, '../db/channelconf.sqlite');
const Collection = require('./Collection');

const channelconf = new Collection();

/**
 * Inits the channel configuration by getting database rows and setting them to `channelconf` variable
 * @return void
 */
exports.init = () => {
  db.open(dbPath).then(() => {
    return db.all(`SELECT * FROM channel_configs`);
  }).then(rows => {
    for (const row of rows) channelconf.set(row.channel_id, row);
  });
}

/**
 * Add a channel's webhooks repo thingy
 * @param {String} channel_id The channel id for the repo's webhooks
 * @param {String} repo       The repo's full name, i.e. hydrabolt/discord.js
 */
exports.add = (channel_id, repo) => {
  return new Promise((resolve, reject) => {
    if (channelconf.has(channel_id)) return reject('Channel already has github repo webhooks configured');
    db.open(dbPath).then(() => {
      db.run(`INSERT INTO "channel_configs" (channel_id, repo) VALUES (?, ?)`, [channel_id, repo]).then(() => {
        channelconf.set(channel_id, { channel_id, repo })
        resolve({ channel_id, repo });
      }).catch(reject);
    })
  });
}

/**
 * Get all the channels for a specific repo
 * @param  {String} repo The repo's full name to look up
 * @return {Object[]}    An array of all the channel ids and repos as an object, i.e. [ { channel_id: 'CHANNELID', repo: 'hydrabolt/discord.js'} ]
 */
exports.get = (repo) => {
  return channelconf.findAll('repo', repo);
}

/**
 * Delete a spefic channel's repo configuration
 * @param  {String} channel_id      The channel id for which to delete the info
 * @return {Promise<Collection>}    Returns a promise resolving all the channel conf
 */
exports.delete = (channel_id) => {
  return new Promise((resolve, reject) => {
    if (!channelconf.has(channel_id)) return reject('Channel doesn\'t have github repo events to delete');
    db.open(dbPath).then(() => {
      db.run(`DELETE FROM channel_configs WHERE channel_id = ${channel_id}`).then(() => {
        channelconf.delete(channel_id);
        resolve(channelconf);
      }).catch(reject);
    })
  });
}

/**
 * Collection.prototype.find
 * @see Collection.prototype.find
 */
 exports.find = channelconf.find.bind(channelconf);

/**
 * Collection.prototype.array
 * @see Collection.prototype.array
 */
exports.array = channelconf.array.bind(channelconf);

/**
 * Collection.prototype.exists
 * @see Collection.prototype.exists
 */
exports.exists = channelconf.exists.bind(channelconf);

/**
 * Collection.prototype.filter
 * @see Collection.prototype.filter
 */
exports.filter = channelconf.filter.bind(channelconf);
