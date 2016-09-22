const GithubEvents = require('../Github/GithubEvents');
const Log = require('./Logger').Logger;
const Settings = {
  Channels: ['213089011105923072', '224572469321793538']
}
const moment = require('moment');

const SendMessage = (bot, str) => {
  if (!bot.readyTime || bot.uptime < 15000) return false;
  // if (!bot.readyTime) return false;
  if (!str) return false;

  Settings.Channels.forEach(id => {
    let channel = bot.channels.get(id);
    if (channel) channel.sendMessage(str).catch(Log.error);
  });
}

module.exports = bot => {

  GithubEvents.on('issues', string => SendMessage(bot, string));
  GithubEvents.on('issueComment', string => SendMessage(bot, string));
  GithubEvents.on('push', string => SendMessage(bot, string));
  GithubEvents.on('pr', string => SendMessage(bot, string));
  GithubEvents.on('release', string => SendMessage(bot, string));
  GithubEvents.on('fork', string => SendMessage(bot, string));
  GithubEvents.on('watch', string => SendMessage(bot, string));
  GithubEvents.on('branch', string => SendMessage(bot, string));
}
