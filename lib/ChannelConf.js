const mongoose = require("./Mongoose");
const Collection = require("discord.js").Collection;
const Schema = mongoose.Schema;
const Log = require('./Logger').Logger;

let channelConfigSchema = Schema({
  channelId: String,
  guildId: String,
  repo: String
});

let channelConfig = mongoose.model("ChannelConfig", channelConfigSchema);

class ChannelConfigItem {
  constructor(client, config) {
    this._client = client;
    for (let key in config) {
      if (config.hasOwnProperty(key)) {
        this[key] = config[key];
      }
    }
  }
  delete() {
    return this._client.DeleteRepo(this.channelId, this.repo);
  }
}

class ChannelConfig {
  constructor() {
    this._data = new Collection();
    this.setup();
  }
  setup() {
    channelConfig.find({}).then(configs => {
      configs.forEach(row => {
        this._data.set(Math.random(), new ChannelConfigItem(this, row._doc));
      });
    });
  }
  FindAll() {
    return this._data;
  }
  FindByRepo(board) {
    return this._data.findAll("repo", board);
  }
  FindByChannel(channel) {
    return this._data.findAll("channelId", channel);
  }
  DeleteChannel(channel) {
    return channelConfig.find({
      channelId: channel,
    }).remove().then(() => {
      this._data = this._data.filter(e => {
        return e.channelId !== channel;
      });
    }).catch(Log.error);
  }
  DeleteRepo(channel, repo) {
    return channelConfig.find({
      channelId: channel,
      repo: repo,
    }).remove().then(() => {
      Log.debug(this._data.size);
      this._data = this._data.filter(e => {
        return (e.channelId == channel && e.repo !== repo) || e.channelId !== channel;
      });
      Log.debug(this._data.size);
    }).catch(Log.error);
  }
  Add(channel, guild, repo) {
    return channelConfig.create({
      channelId: channel,
      guildId: guild,
      repo: repo
    }).then(() => {
      this._data.set(Math.random(), new ChannelConfigItem({
        channelId: channel,
        guildId: guild,
        repo
      }));
    }).catch(Log.error);
  }
}

module.exports = new ChannelConfig();
