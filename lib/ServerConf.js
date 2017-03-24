const path = require('path');
const mongoose = require("./Mongoose");
const Collection = require("discord.js").Collection;
const Schema = mongoose.Schema;
const Log = require('./Logger').Logger;

const default_conf = {
  guildId: null,
  guildName: null,
  prefix: 'G! ',
  repo: null,
  "default": true
}
const conf_keys = ['prefix', 'repo'];

let serverConfigSchema = Schema({
  guildId: String,
  guildName: String,
  prefix: String,
  repo: String
});

let serverConfig = mongoose.model("ServerConfig", serverConfigSchema);

/**
 * A Server Config Item
 */
class ServerConfigItem {

  constructor(client, config) {
    this._client = client;
    for (let key in config) {
      if (config.hasOwnProperty(key)) {
        this[key] = config[key];
      }
    }
  }

  /**
   * Delete the server's config
   * @see ServerConfig.DeleteGuild
   */
  delete() {
    return this._client.RemoveGuild(this.channelId, this.repo);
  }

  /**
   * Set the server's config
   * @see ServerConfig.SetGuild
   */
  set(key, value) {
    return this._client.SetGuild(this.guildId, key, value);
  }

}

/**
* A channel configuration class to add, set, delete repo events config from channels
*/
class ServerConfig extends Collection {

  /**
  * Inits the guilds configuration by getting database rows, and initializes guilds that don't have config yet
  * @return void
  */
  init(bot) {
    Log.info(`Loading server config...`);
    serverConfig.find({}).then(configs => {
      configs.forEach(row => {
        this.set(row.guildId, new ServerConfigItem(this, row._doc));
      });
      for (const guild of bot.guilds) {
        if (!guild) return false;
        if (!this.has(guild[1].id)) {
          this.AddGuild(guild[1]).catch(Log.error);
        }
      }
    }).catch(Log.error);

    this._bot = bot;
  }
  
  /**
   * Add guild add and guild remove events to bot
   */
  addBotEvents(bot) {
    bot.on('guildDelete', (guild) => {
      if (!this.has(guild.id)) return false;
      this.RemoveGuild(guild.id);
    });

    bot.on('guildCreate', (guild) => {
      if (this.has(guild.id)) return false;
      this.AddGuild(guild);
    });
  }
  
  /**
   * Refresh the config, get from DB
   */
  refresh() {
    serverConfig.find({}).then(configs => {
      delete this._data;
      this._data = new Collection();
      configs.forEach(row => {
        let data = row._doc;
        this._data.set(data.guildId, new ServerConfigItem(this, data));
      });
    });
  }

  /**
  * Add guild to config
  * @param {String} guild The guild's object
  * @return {Promise<Object>}
  */
  AddGuild(guild) {
    let conf = this;
    let guild_id = guild.id || guild;

    Log.debug(`Adding ${guild.name || guild} to server conf..`);

    return new Promise((resolve, reject) => {
      if (conf.has(guild_id)) return reject('Server is already in the configuration');
      let newConfig = {
        guildId: guild_id,
        guildName: guild.name || undefined,
        prefix: default_conf.prefix,
        repo: null
      };
      serverConfig.create(newConfig).then(() => {
        this.set(guild_id, newConfig);
        resolve(newConfig);
      }).catch(reject);
    });
  }

  /**
  * Get the server config for a spefic server
  * @param  {String} guild - The guild's object
  * @return {ServerConfig}     The server's config
  */
  GetGuild(guild) {
    if (!guild) return false;
    let config = this;

    if (config.has(guild.id)) {
      let server_conf = config.get(guild.id);
      const conf = {};
      if (server_conf) {
        for (let key in server_conf) {
          if (key !== '_client') {
            if (server_conf[key]) {
              conf[key] = server_conf[key];
            } else {
              conf[key] = default_conf[key];
            }
          }
        }
        conf["default"] = false;
      }
      return new ServerConfigItem(config, conf);
    }
  }

  /**
   * Set the server's config
   * @param guild {Guild} - guild to change conf for
   * @param key {String} - property to change in the conf
   * @param value {*} - value for the property
   * @see ServerConfig.DeleteGuild
   */
  SetGuild(guild, key, value) {
    let conf = this;

    return new Promise((resolve, reject) => {

      // fml
      key = key && key.replace ? key.replace(/[';]/g, '') : key;
      value = value && value.replace ? value.replace(/[';]/g, '') : value;

      if (!key || (!value && key !== 'repo')) return reject(`❌ Value or key hasn't been provided. Key: \`${key}\`. Value: \`${value}\``);
      if (!value) value = null;

      let guildObj = typeof guild === 'object' ? guild : conf._bot.guilds.get(guild);
      let server_id = guildObj ? guildObj.id : guild;

      if (!conf.has(server_id)) {
        return reject(`❌ The server **${guild.name || guild}** was not found while trying to set config \`${key}\` to \`${value}\``);
      }

      let thisconf = conf.get(server_id);

      if (['server_id', 'server_name'].includes(key)) return reject(`❌ The key \`${key}\` is read-only.`);
      if (!conf_keys.includes(key)) return reject(`❌ The key \`${key}\` doesn't exist.`);

      thisconf[key] = value;
      conf.set(server_id, thisconf);

      if (isNaN(value)) value = `'${value}'`;

      serverConfig.findOneAndUpdate({
        guildId: server_id
      }, thisconf, {
        new: true
      }).then(() => {
        resolve(`✅ Successfully set config key \`${key}\` to \`${value}\``)
      }).catch((e) => {
        Log.error(e);
        reject(`❌ Unable to update database key. \`${e}\``);
      });

    });
  }

  /**
  * Delete a spefic server's repo configuration
  * @param  {String} server_id      The guild id for which to delete the info
  * @return {Promise<Collection>}    Returns a promise resolving all the channel conf
  */
  RemoveGuild(server_id) {
    let conf = this;

    return new Promise((resolve, reject) => {
      if (!conf.has(server_id)) return reject('Server doesn\'t have any config to delete');
      serverConfig.findOneAndRemove({
        guildId: server_id
      }).then(() => {
        conf.delete(server_id);
        resolve();
      }).catch(e => {
        Log.error(e);
        reject(`Unable to get server configuration. \`${e}\``);
      })
    });
  }

}

module.exports = new ServerConfig();
