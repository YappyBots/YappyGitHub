const GithubEvents = require('../Github/GithubEvents');
const ChannelConf = require('./ChannelConf');
const ServerConf = require('./ServerConf');
const GithubCache = require('./Util/GithubCache');
const Log = require('./Logger').Logger;
const moment = require('moment');

const SendMessage = (bot, data) => {

  let str = data.str;
  let repo = data.repo;

  Log.debug(str);
  Log.debug(repo);

  if (!repo || !str) return false;


  let channelConfs = ChannelConf.get(repo);
  if (!channelConfs.length) return false;

  if (repo) str = `**${repo}**: ${str}`;

  channelConfs.forEach(channelConf => {
    let channel = bot.channels.get(channelConf.channel_id);
    if (channel) channel.sendMessage(str).catch(err => {
      Log.error(err);
      channel.guild.defaultChannel.sendMessage(`I don't have perms to talk in ${channel} for Github updates!`);
    });
  });

}

module.exports = bot => {

  bot.on('ready', () => {
    ChannelConf.init(bot).then(() => {
      GithubCache.init(ChannelConf);
    }).catch(Log.error);

    ServerConf.init(bot);
  });

  GithubEvents.on('*', data => {
    Log.debug(`GithubEvents Event: Got event from ${data.repo}:`, data.string);
  });

  GithubEvents.on('issues', data => SendMessage(bot, data));
  GithubEvents.on('issueComment', data => SendMessage(bot, data));
  GithubEvents.on('push', data => SendMessage(bot, data));
  GithubEvents.on('pr', data => SendMessage(bot, data));
  GithubEvents.on('release', data => SendMessage(bot, data));
  GithubEvents.on('fork', data => SendMessage(bot, data));
  GithubEvents.on('watch', data => SendMessage(bot, data));
  GithubEvents.on('branch', data => SendMessage(bot, data));
  GithubEvents.on('ping', data => SendMessage(bot, data));
}
