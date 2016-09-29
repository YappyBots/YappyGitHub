const GithubEvents = require('../Github/GithubEvents');
const ChannelConf = require('./ChannelConf');
const Log = require('./Logger').Logger;
const Settings = {
  Channels: ['213089011105923072', '224572469321793538']
}
const moment = require('moment');

const SendMessage = (bot, data) => {
  // if (!bot.readyTime || bot.uptime < 15000) return false;
  if (!bot.readyTime) return false;
  if (!data) return false;

  let str = data.str;
  let repo = data.repo;

  if (!repo || !str) return false;

  let channelConfs = ChannelConf.get(repo);
  if (!channelConfs.length) return false;

  str = `**${repo}**: ${str}`;

  channelConfs.forEach(channelConf => {
    let channel = bot.channels.get(channelConf.channel_id);
    if (channel) channel.sendMessage(str).catch(Log.error);
  });

}

module.exports = bot => {

  ChannelConf.init(bot);

  GithubEvents.on('issues', data => SendMessage(bot, data));
  GithubEvents.on('issueComment', data => SendMessage(bot, data));
  GithubEvents.on('push', data => SendMessage(bot, data));
  GithubEvents.on('pr', data => SendMessage(bot, data));
  GithubEvents.on('release', data => SendMessage(bot, data));
  GithubEvents.on('fork', data => SendMessage(bot, data));
  GithubEvents.on('watch', data => SendMessage(bot, data));
  GithubEvents.on('branch', data => SendMessage(bot, data));
}
