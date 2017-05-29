const mongoose = require('mongoose');
const Collection = require('discord.js').Collection;
const Schema = mongoose.Schema;

/**
* The channel config Schema
* @typedef {Object} ChannelConfigSchema
* @property {String} guildName - Guild Name
* @property {String} guildID Guild ID
* @property {String} channelName Channel Name
* @property {String} channelID Channel ID
* @property {Array} repos Array of repos to event to channel (channelID)
* @property {Array} repo Repo to use for gitlab commands in channel
* @property {Array} disabledEvents Github events to disable in this channel
* @property {Boolean} embed Use embeds for events or not
*/
const channelConfigSchema = Schema({
  guildName: String,
  guildID: String,
  channelName: String,
  channelID: String,
  repo: String,
  repos: Array,
  disabledEvents: Array,
  ignoredUsers: Array,
  ignoredBranches: Array,
});

const channelConfig = mongoose.model('ChannelConfig', channelConfigSchema);

/**
* A Channel Config Item
*/
class ChannelConfigItem {
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
  * @see ChannelConfig#setChannel
  * @return {Promise}
  */
  set(prop, value) {
    return this._client.setChannel(this.channelID, prop, value);
  }

  /**
  * Delete repo events from channel
  * @param {String} repo Repo events to delete from channel
  */
  deleteRepo(repo) {
    let repos = this.repos;
    repos.splice(repos.indexOf(repo), 1);
    return this.set('repos', repos);
  }
}

/**
* The Channel Config manager
*/
class ChannelConfig {
  constructor() {
    /**
    * All the config
    * @type {Collection}
    * @private
    */
    this._data = new Collection();
    this.setup();
    this.validKeys = [
      'repos',
      'repo',
      'embed',
      'disabledEvents',
      'ignoredUsers',
      'ignoredBranches',
    ];
    this.setupEvents = false;
  }

  /**
  * Get config from database and add to this._data
  */
  setup() {
    channelConfig.find({}).then(configs => {
      configs.forEach(row => {
        this._data.set(row.channelID, new ChannelConfigItem(this, row._doc));
      });
    }).catch(Log.error);
  }

  /**
   * Initialize configuration and Discord bot events
   * @param {external:Client} bot
   */
  init(bot) {
    if (this._data.size < 5) return setTimeout(() => this.init(bot), 5000);
    for (const ch of bot.channels) {
      const channel = ch[1];
      if (!channel || channel.type !== 'text') continue;
      if (!this.findByChannel(channel.id)) {
        Log.info(`ChannelConf | Adding "${channel.guild.name}"'s #${channel.name} (${channel.id})`);
        this.addChannel(channel).catch(e => bot.emit('error', e));
      }
    }
    if (this.setupEvents) return;
    this.setupEvents = true;
    bot.on('channelDelete', channel => {
      if (!channel || channel.type !== 'text') return;
      Log.info(`ChannelConf | Deleting "${channel.guild.name}"'s #${channel.name} (${channel.id})`);
      this.deleteChannel(channel.id).catch(Log.error);
    });
    bot.on('channelCreate', channel => {
      if (!channel || channel.type !== 'text') return;
      let ch = this.findByChannel(channel.id);
      if (ch) return;
      Log.info(`ChannelConf | Adding "${channel.guild.name}"'s #${channel.name} (${channel.id})`);
      this.addChannel(channel);
    });
  }

  /**
  * Find channels with events for repo
  * @param {String} repo Repo for the events
  * @return {ChannelConfigItem}
  */
  findByRepo(repo) {
    let re = repo.toLowerCase();
    return this._data.filter(e => e.repos.filter(r => r === re)[0]);
  }

  /**
  * Find events for channel
  * @param {String} channel Channel (ID) with the events
  * @return {ChannelConfigItem}
  */
  findByChannel(channel) {
    return this._data.find('channelID', channel);
  }

  /**
  * Find channels with events for repo
  * @param {String} channel Channel (ID) with the repo's events
  * @param {String} repo Repo to check in channel
  * @return {ChannelConfigItem}
  */
  findRepoInChannel(channel, repo) {
    return this._data.find(e => e.channelID = channel && e.repos.includes(repo));
  }

  /**
  * Delete all repo events from channel
  * @param {String} channel Channel with the events to delete
  * @return {ChannelConfig}
  */
  delete(channel) {
    return channelConfig.findOneAndRemove({
      channelID: channel,
    }).then(() => {
      let oldData = this._data;
      let newData = oldData.filter(e => e.channel !== channel);
      this._data = newData;
      return Promise.resolve(this);
    });
  }

  /**
  * Delete repo events from specific channel
  * @param {String} channel Channel with the repo events
  * @param {String} repo Repo event to remove from Channel
  * @return {ChannelConfig}
  */
  deleteRepo(channel, repo) {
    return channelConfig.findOneAndRemove({
      repo,
    }).then(() => {
      let oldRepos = this._data.find('channelID', channel);
      let newRepos = oldRepos.slice(0, oldRepos.indexOf(repo));
      return this.setChannel(channel, 'repos', newRepos);
    });
  }

  /**
  * Delete repo events from specific channel
  * @param {String} channel Channel with the repo events
  * @param {String} repo Repo event to remove from Channel
  * @return {ChannelConfig}
  */
  setChannel(channel, prop, value) {
    return new Promise((resolve, reject) => {
      let oldConfig = this._data.find('channelID', channel);
      let newConfig = oldConfig;
      newConfig[prop] = value;
      channelConfig.findOneAndUpdate({
        channelID: channel,
      }, newConfig, {
        new: true,
      }, (err) => {
        if (err) return reject(err);
        this._data.set(newConfig.channel, new ChannelConfigItem(this, newConfig));
        resolve(newConfig);
      });
    });
  }

  /**
  * Add channel to config
  * @param {Channel} channel Channel to add repo events
  * @return {Promise<ChannelConfig>}
  */
  addChannel(channel) {
    if (!channel || !channel.id) return Promise.reject(`No channel passed!`);
    if (channel && channel.id && this.findByChannel(channel.id)) return Promise.reject(`Channel already has an entry in database`);
    let conf = {
      guildID: channel.guild && channel.guild.id,
      guildName: channel.guild && channel.guild.name,
      channelID: channel.id,
      channelName: channel.name,
      repos: [],
      prefix: `G! `,
    };
    return channelConfig.create(conf).then(() => {
      this._data.set(conf.channelID, new ChannelConfigItem(this, conf));
      return Promise.resolve(this);
    });
  }
  async addRepoToChannel(channel, repo) {
    if (!channel || !repo) return Promise.reject(`Invalid arguments.`);
    let conf = this.findByChannel(channel);
    let repos = conf.repos;
    repos.push(repo.toLowerCase());
    return this.setChannel(channel, 'repos', repos);
  }
}

module.exports = new ChannelConfig();
