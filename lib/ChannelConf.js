const mongoose = require("./Mongoose");
const Collection = require('./Collection');
const Schema = mongoose.Schema;
const Log = require('./Logger').Logger;

let channelConfigSchema = Schema({
  channelId: String,
  guildId: String,
  repo: String
});

let channelConfig = mongoose.model("ChannelConfig", channelConfigSchema);

/**
 * A Channel Config Item
 */
class ChannelConfigItem {
  constructor(client, config) {
    this._client = client;
    for (let key in config) {
      if (config.hasOwnProperty(key)) {
        this[key] = config[key];
      }
    }
  }
  /**
   * Delete the channel's repo config
   * @see ChannelConfig.DeleteRepo
   */
  delete() {
    return this._client.DeleteRepo(this.channelId, this.repo);
  }
}

/**
 * Channel Config for the bot
 */
class ChannelConfig {
  constructor() {
    this._data = new Collection();
    this.setup();
  }
  /**
   * Set up the channel config by getting values from the DB, and transforming them into ChannelConfigItem(s)
   */
  setup() {
    channelConfig.find({}).then(configs => {
      configs.forEach(row => {
        let data = row._doc;
        this._data.set(`[${data.channelId}] ${data.repo}`, new ChannelConfigItem(this, data));
      });
    });
  }
  /**
   * Refresh the config, get from DB
   */
  refresh() {
    channelConfig.find({}).then(configs => {
      delete this._data;
      this._data = new Collection();
      configs.forEach(row => {
        let data = row._doc;
        this._data.set(`[${data.channelId}] ${data.repo}`, new ChannelConfigItem(this, data));
      });
    });
  }

  /**
   * Get all data for every channel and every repo
   * @return {Collection<ChannelConfigItem>}
   */
  FindAll() {
    return this._data;
  }
  /**
   * Find conf by channel and repo
   * @param channel {String} - channel
   * @param repo {String} - repo
   * @return {Promise<ChannelConfigItem>}
   */
  Find(channel, repo) {
    return Promise.resolve(this._data.filter(e => {
      return e.channelId === channel && e.repo === repo;
    }).first());
  }
  /**
   * Get the channels that have events for repo
   * @param repo {String} - repo to search channels for
   * @return {Collection<ChannelConfigItem>}
   */
  FindByRepo(repo) {
    return this._data.findAll("repo", repo);
  }
  /**
   * Get the repos that have events in channel
   * @param channel {String} - channel to search repos for
   * @return {Collection<ChannelConfigItem>}
   */
  FindByChannel(channel) {
    return this._data.findAll("channelId", channel);
  }
  /**
   * Delete a channel's config
   * @param channel {String} - channel to delete configs of
   * @return {Promise}
   */
  DeleteChannel(channel) {
    return channelConfig.find({
      channelId: channel,
    }).remove().then(() => {
      this._data = this._data.filter(e => {
        return e.channelId !== channel;
      });
    }).catch(Log.error);
  }
  /**
   * Delete a channel's config for a specific repo
   * @param channel {String} - channel to delete config for
   * @param repo {String} - repo to delete config of
   * @return {Promise}
   */
  DeleteRepo(channel, repo) {
    return channelConfig.find({
      channelId: channel,
      repo: repo,
    }).remove().then(() => {
      this._data = this._data.filter(e => {
        return (e.channelId === channel && e.repo !== repo) || e.channelId !== channel;
      });
    }).catch(Log.error);
  }
  /**
   * Create config for a channel for a specific repo
   * @param channel {String} - channel to add config for
   * @param guild {String} - channel's guild
   * @param repo {String} - repo to add config for channel
   * @return {Promise}
   */
  Add(channel, guild, repo) {
    return channelConfig.create({
      channelId: channel,
      guildId: guild,
      repo: repo
    }).then(() => {
      this.refresh();
    }).catch(Log.error);
  }
}

module.exports = new ChannelConfig();
