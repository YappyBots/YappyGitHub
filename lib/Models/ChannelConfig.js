const mongoose = require('mongoose');
const Collection = require('discord.js').Collection;
const Schema = mongoose.Schema;

let channelConfigSchema = Schema({
  channelId: String,
  guildId: String,
  repos: Array,
  disabledEvents: Array,
});

let channelConfig = mongoose.model('ChannelConfig', channelConfigSchema);

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
   * @see ChannelConfig#SetChannel
   * @return {Promise}
   */
  set(prop, value) {
    return this._client.SetChannel(this.channelId, prop, value);
  }
  /**
   * Delete repo events from channel
   * @param {String} repo Repo events to delete from channel
   */
  deleteRepo(repo) {
    return this.set(repo, this.repos.slice(0, this.repos.indexOf(repo)));
  }
}

class ChannelConfig {
  /**
   * Create the Channel Config manager
   */
  constructor() {
    /**
     * All the config
     * @type {Collection}
     * @private
     */
    this._data = new Collection();
    this.setup();
  }
  /**
   * Get config from database and add to this._data
   */
  setup() {
    channelConfig.find({}).then(configs => {
      configs.forEach(row => {
        this._data.set(row.channelId, new ChannelConfigItem(this, row._doc));
      });
    });
  }
  /**
   * Find channels with events for repo
   * @param {String} repo Repo for the events
   * @return {ChannelConfigItem}
   */
  FindByRepo(repo) {
    return this._data.findAll(e => e.repos.indexOf(repo));
  }
  /**
   * Find events for channel
   * @param {String} channel Channel with the events
   * @return {ChannelConfigItem}
   */
  FindByChannel(channel) {
    return this._data.findAll('channelId', channel);
  }
  /**
   * Delete all repo events from channel
   * @param {String} channel Channel with the events to delete
   * @return {ChannelConfig}
   */
  DeleteChannel(channel) {
    return channelConfig.findOneAndRemove({
      channelId: channel,
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
  DeleteRepo(channel, repo) {
    return channelConfig.findOneAndRemove({
      repo,
    }).then(() => {
      let oldRepos = this._data.find('channelId', channel);
      let newRepos = oldRepos.slice(0, oldRepos.indexOf(repo));
      return this.SetChannel(channel, 'repos', newRepos);
    });
  }
  /**
   * Delete repo events from specific channel
   * @param {String} channel Channel with the repo events
   * @param {String} repo Repo event to remove from Channel
   * @return {ChannelConfig}
   */
  SetChannel(channel, prop, value) {
    return new Promise((resolve, reject) => {
      let oldConfig = this._data.find('channelId', channel);
      let newConfig = oldConfig;
      newConfig[prop] = value;
      channelConfig.findOneAndUpdate({
        channelId: channel,
      }, newConfig, {
        new: true,
      }, (err) => {
        if (err) return reject(err);
        this._data.set(newConfig.channel, new ChannelConfigItem(this, newConfig));
        resolve(newConfig);
      });
    });
  }
  Add(channel) {
    let conf = {
      channelId: channel.id,
      guildId: channel.guild.id,
      repos: [],
      disabledEvents: [],
    };
    return channelConfig.create(conf).then(() => {
      this._data.set(conf.channelId, new ChannelConfigItem(this, conf));
      return Promise.resolve(this);
    });
  }
}

module.exports = new ChannelConfig();
