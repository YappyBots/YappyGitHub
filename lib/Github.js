const GithubEvents = require('../Github/GithubEvents');
const Log = require('./Logger').Logger;
const Settings = {
  Channels: ['175021235384614912', '224572469321793538']
}

const SendMessage = (bot, str) => {
  if (!bot.readyTime) return false;
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

  GithubEvents.on('fork', payload => {
    let actor = payload.actor;
    SendMessage(bot, `🍝 **${actor.login}** forked hydrabolt/discord.js`);
  });

  GithubEvents.on('watch', payload => {
    let actor = payload.actor;
    SendMessage(bot, `👀 **${actor.login}** is now watching hydrabolt/discord.js`);
  });


}
