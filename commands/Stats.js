const Log = require('../lib/Logger').Logger;
const BotCache = require('../lib/BotCache');
const moment = require('moment');

require('moment-duration-format');

const GetUptime = bot => {
  return moment.duration(bot.uptime).format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]');
};

module.exports = bot => (msg, command, args) => {
  let SeenMessages = BotCache.SeenMessages.length;
  let SentMessages = BotCache.SentMessages.length + 1;
  let CommandsRun = BotCache.CommandsRun.length;
  let TrelloEvents = BotCache.TrelloEvents.length;

  let message = [
    `DiscordJS Rewrite Trello has been up for **${GetUptime(bot)}**`,
    '',
    `Connected to **${bot.guilds.size}** ${bot.guilds.size == 1 ? 'server' : 'servers'}`,
    `Seen **${bot.users.size}** ${bot.users.size == 1 ? 'user' : 'users'}`,
    `In **${bot.channels.size}** ${bot.channels.size == 1 ? 'channel' : 'channels'} (**${bot.channels.filter(e => e.type !== 'voice').size}** text, **${bot.channels.filter(e => e.type == 'voice').size}** voice)`,
    '',
    `**${SeenMessages}** seen messages in the last hour (**~${(SeenMessages / 60).toFixed(2)}** per minute)`,
    `**${SentMessages}** sent messages in the last hour (**~${(SentMessages / 60).toFixed(2)}** per minute)`,
    `**${CommandsRun}** commands run in the last hour (**~${(CommandsRun / 60).toFixed(2)}** per minute)`,
    `**${TrelloEvents}** trello events in the last hour (**~${(TrelloEvents / 60).toFixed(2)}** per minute)`,
  ].join('\n');

  msg.channel.sendMessage(message).catch(err => Log.error(err));
};
