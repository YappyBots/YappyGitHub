const mongoose = require('mongoose');
const Collection = require('discord.js').Collection;
const Schema = mongoose.Schema;

/**
* The server config Schema
* @typedef {Object} ServerConfigSchema
* @property {String} guildName Guild Name
* @property {String} guildID Guild ID
* @property {String} prefix Prefix
*/
let serverConfigSchema = Schema({
  guildName: String,
  guildID: String,
  prefix: String,
});

let serverConfig = mongoose.model('ServerConfig', serverConfigSchema);

/**
* A Channel Config Item
*/
class ServerConfigItem {
  constructor(client, config) {
    /**
    * The bot client
    * @type Client
    * @private
    */
    this._client = client;
    for (let key in config) {
      if (config.hasOwnProperty(key)) {
        this[key] = config[key];
      }
    }
  }
  /**
  * Set a specific config property to a value for this config item
  * @param {String} prop Property to modify
  * @param {String} value The new value for the property
  * @see ServerConfig#set
  * @return {Promise<ServerConfig>}
  */
  set(prop, value) {
    return this._client.set(this.guildID, prop, value);
  }
  /**
  * Delete guild config
  * @see ServerConfig#delete
  * @return {Promise<ServerConfig>}
  */
  delete() {
    return this._client.delete(this.guildID);
  }
}

/**
* The Channel Config manager
*/
class ServerConfig {
  constructor() {
    /**
    * All the config
    * @type {Collection}
    * @private
    */
    this._data = new Collection();
    this.setup();
    this.validKeys = [
      'prefix',
    ];
    this.setupEvents = false;
  }
  /**
  * Get config from database and add to this._data
  */
  setup() {
    serverConfig.find({}).then(configs => {
      configs.forEach(row => {
        if (!row.guildID) return;
        this._data.set(row.guildID, new ServerConfigItem(this, row._doc));
      });
    });
  }
  /**
  * Initialize configuration and Discord bot events
  * @param {external:Client} bot
  */
  init(bot) {
    if (this._data.size < 1) return setTimeout(() => this.init(bot), 5000);
    for (const [, g] of bot.guilds) {
      const guild = g;
      if (!guild) continue;
      if (!this.has(guild.id)) {
        Log.info(`ServerConf | Adding "${guild.name}"`);
        this.add(guild).catch(e => bot.emit('error', e));
      }
    }
    if (this.setupEvents) return;
    this.setupEvents = true;
    bot.on('guildDelete', (guild) => {
      if (!guild || !guild.available) return;
      Log.info(`ServerConf | Deleting "${guild.name}"`);
      this.delete(guild.id).catch(e => bot.emit('error', e));
    });
    bot.on('guildCreate', (guild) => {
      if (!guild || !guild.available) return;
      let g = this.get(guild.id);
      if (g) return;
      Log.info(`ServerConf | Adding "${guild.name}"`);
      this.add(guild).catch(e => bot.emit('error', e));
    });
  }

  /**
  * Delete guild config
  * @param {Guild|String} guildID Guild config to delete
  * @return {Promise<ServerConfig>}
  */
  deleteGuild(guildID) {
    if (guildID.id) guildID = guildID.id;
    return serverConfig.findOneAndRemove({
      guildID,
    }).then(() => {
      let oldData = this._data;
      let newData = oldData.filter(e => e.guildID !== guildID);
      this._data = newData;
      return Promise.resolve(this);
    });
  }

  /**
  * Add channel to config
  * @param {Guild} guildID Guild to add config of
  * @return {Promise<ServerConfig>}
  */
  add(guild) {
    if (!guild || !guild.id) return Promise.reject(`No guild passed!`);
    if (this.has(guild.id)) return Promise.reject(`Guild already has an entry in database`);
    let conf = {
      guildID: guild.id,
      guildName: guild.name,
      prefix: `GL! `,
    };
    return serverConfig.create(conf).then(() => {
      this._data.set(conf.guildID, new ServerConfigItem(this, conf));
      return Promise.resolve(this);
    });
  }

  /**
  * Replace specific guild config prop with value
  * @param {Guild|String} guildID Guild id to change config of
  * @param {String} prop Property to set
  * @param {String} value Value to set property to
  * @return {Promise<ServerConfig>} updated config item
  */
  set(guildID, prop, value) {
    return new Promise((resolve, reject) => {
      if (guildID.id) guildID = guildID.id;
      let oldConfig = this._data.find('guildID', guildID);
      let newConfig = oldConfig;
      newConfig[prop] = value;
      serverConfig.findOneAndUpdate({
        guildID,
      }, newConfig, {
        new: true,
      }, (err) => {
        if (err) return reject(err);
        this._data.set(newConfig.channel, new ServerConfigItem(this, newConfig));
        resolve(this);
      });
    });
  }

  /**
  * Get guild conf
  * @param {Guild|String} guildID Guild id to change config of
  * @return {ServerConfigItem} updated config item
  */
  get(guildID) {
    return this._data.get(guildID);
  }

  /**
  * Has guild conf
  * @param {Guild|String} guildID Guild id to check if has config
  * @return {Boolean}
  */
  has(guildID) {
    if (guildID.id) guildID = guildID.id;
    return this._data.has(guildID);
  }
}

module.exports = new ServerConfig();
