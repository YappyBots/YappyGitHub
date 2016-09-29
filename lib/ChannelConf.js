const db = require('sqlite');
const path = require('path');
const dbPath = path.resolve(__dirname, '../db/channelconf.sqlite');
const Collection = require('./Collection');


class ChannelConf {

  constructor() {

    /**
     * @private
     */
    this._channelconf = new Collection();

    /**
    * @see Collection.find
    */
    this.find = this._channelconf.find.bind(this._channelconf);

    /**
    * @see Collection.array
    */
    this.array = this._channelconf.array.bind(this._channelconf);

    /**
    * @see Collection.exists
    */
    this.exists = this._channelconf.exists.bind(this._channelconf);

    /**
    * @see Collection.filter
    */
    this.filter = this._channelconf.filter.bind(this._channelconf);
  }

  /**
  * Inits the channel configuration by getting database rows and setting them to `channelconf` variable
  * @return void
  */
  init(bot) {
    db.open(dbPath).then(() => {
      return db.all(`SELECT * FROM channel_configs`);
    }).then(rows => {
      for (const row of rows) this._channelconf.set(row.channel_id, row);
    });
  }

  /**
  * Add a channel's webhooks repo thingy
  * @param {String} channel_id The channel id for the repo's webhooks
  * @param {String} repo       The repo's full name, i.e. hydrabolt/discord.js
  */
  add(channel_id, repo) {
    return new Promise((resolve, reject) => {
      if (this._channelconf.has(channel_id)) return reject('Channel already has github repo webhooks configured');
      db.open(dbPath).then(() => {
        db.run(`INSERT INTO "channel_configs" (channel_id, repo) VALUES (?, ?)`, [channel_id, repo]).then(() => {
          this._channelconf.set(channel_id, { channel_id, repo })
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
  get(repo) {
    return this._channelconf.findAll('repo', repo);
  }

  /**
  * Delete a spefic channel's repo configuration
  * @param  {String} channel_id      The channel id for which to delete the info
  * @return {Promise<Collection>}    Returns a promise resolving all the channel conf
  */
  delete(channel_id) {
    return new Promise((resolve, reject) => {
      if (!this._channelconf.has(channel_id)) return reject('Channel doesn\'t have github repo events to delete');
      db.open(dbPath).then(() => {
        db.run(`DELETE FROM channel_configs WHERE channel_id = ${channel_id}`).then(() => {
          this._channelconf.delete(channel_id);
          resolve(this._channelconf);
        }).catch(reject);
      })
    });
  }

}

module.exports = new ChannelConf();
