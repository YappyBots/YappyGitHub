const GithubEvents = require('../Github/GithubEvents');
const ChannelConf = require('./ChannelConf');
const ServerConf = require('./ServerConf');
const GithubCache = require('./Util/GithubCache');
const Util = require('./Util');
const Log = require('./Logger').Logger;
const moment = require('moment');

const SendMessage = (bot, data) => {

  let str = data.str;
  let repo = data.repo;

  if (!repo || !str) return false;

  let channelConfs = ChannelConf.get(repo);

  if (!channelConfs.length) return false;

  if (typeof str == 'object') {
    let stringData = `**${repo}**: ${str.str}`;
    let sha = str.sha;
    let context = str.context;

    channelConfs.forEach(channelConf => {
      let channel = bot.channels.get(channelConf.channel_id);
      if (!channel) return false;

      channel.fetchMessages({
        limit: 10
      }).then(messages => {
        let message = messages.filter(e => {
          return e.content.includes(sha) && e.content.includes(context);
        }).array();
        if (!message[0]) return channel.sendMessage(stringData);
        message[0].edit(stringData);
      });
    });
    return false;
  }

  str = `**${repo}**: ${str}`;

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

  GithubEvents.on('issues', data => SendMessage(bot, data));
  GithubEvents.on('issueComment', data => SendMessage(bot, data));
  GithubEvents.on('push', data => SendMessage(bot, data));
  GithubEvents.on('pr', data => SendMessage(bot, data));
  GithubEvents.on('release', data => SendMessage(bot, data));
  GithubEvents.on('fork', data => SendMessage(bot, data));
  GithubEvents.on('watch', data => SendMessage(bot, data));
  GithubEvents.on('branch', data => SendMessage(bot, data));
  GithubEvents.on('ping', data => SendMessage(bot, data));
  GithubEvents.on('repository', data => SendMessage(bot, data));
  GithubEvents.on('member', data => SendMessage(bot, data));
  GithubEvents.on('status', data => SendMessage(bot, data));
  GithubEvents.on('gollum', data => SendMessage(bot, data));

}
