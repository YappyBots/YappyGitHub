const Discord = require('discord.js');
const bot = new Discord.Client({
  disableEveryone: true,
  messageSweepInterval: 300,
  messageCacheLifetime: 600,
  disabledEvents: [
    "typingStart",
    "typingStop",
    "userUpdate",
    "voiceStateUpdate",
    "channelPinsUpdate",
    "channelUpdate",
    "guildBanAdd",
    "guildBanRemove",
    "guildEmojiCreate",
    "guildEmojiDelete",
    "guildEmojiUpdate",
    "guildMemberAdd",
    "guildMemberAvailable",
    "guildMemberRemove",
    "guildMembersChunk",
    "guildMemberSpeaking",
    "guildMemberUpdate",
    "guildUnavailable",
    "guildUpdate",
    "messageDelete",
    "messageDeleteBulk",
    "messageUpdate",
    "presenceUpdate",
    "roleCreate",
    "roleDelete",
    "roleUpdate",
    "userUpdate",
    "voiceStateUpdate",
    "debug",
    "warn",
  ],
});
const Log = require('./lib/Logger').Logger;
const ErrorLogger = require('./lib/Structures/ErrorLogger');
const BotsDiscordPwAPI = require('./lib/Structures/BotsDiscordPw');

const token = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.YAPPY_GITHUB_DISCORD || process.env.BOT_TOKEN;
let ClientReady = false;

// ===== DISCORD =====

require('./lib/CommandLogger')(bot);
require('./lib/Github')(bot);

bot.on('guildCreate', (guild) => {
  let message = [
    '```diff',
    `+ Guild: ${guild.name}`,
    `+ Owner: @${guild.owner.user.username}#${guild.owner.user.discriminator}`,
    '```'
  ];
  bot.channels.get('231911521557544960').sendMessage(message);
  guild.owner.user.sendMessage([
    `Hi! I'm Yappy, a bot that outputs github events from repos into the desired channel.`,
    `To set up a custom prefix and a global repo for commands such as \`G! issue 5\`, say \`G! conf view\` to see the current configuration, and use \`G! conf set <key> <value\` to set config keys.`,
    `If you need to know where to point the webhook, say \`G! invite\` to see the webhook endpoint, and the events you should use.`,
    `This bot was made by @datitisev#4934. If you need any help, join our official server at **https://discord.gg/HHqndMG** for support.`,
    `Thank you for choosing Yappy!`
  ]);
});
bot.on('guildDelete', (guild) => {
  let message = [
    '```diff',
    `- Guild: ${guild.name}`,
    `- Owner: @${guild.owner.user.username}#${guild.owner.user.discriminator}`,
    '```'
  ];
  bot.channels.get('231911521557544960').sendMessage(message);
});

require('./commands')(bot);

bot.on('ready', () => {
  Log.info('=> Logged in!');
  global.DiscordBotsPwAPI = new BotsDiscordPwAPI(bot);
});

bot.on('error', err => {
  Log.error(err);
});
bot.on('disconnect', () => Log.info('Disconnected! Reconnecting...'));

process.on('unhandledRejection', (err) => {
  if (typeof err == 'object' && !!err.stack) {
    err.stack = err.stack.replace(new RegExp(__dirname, 'g'), '.');
  }

  Log.error(err.stack);

  if (ClientReady) ErrorLogger.error(err);
});

process.on('uncaughtException', err => {
  if (typeof err == 'object' && !!err.stack) {
    err.stack = err.stack.replace(new RegExp(__dirname, 'g'), '.');
  }

  Log.error(err.stack);

  if (ClientReady) ErrorLogger.error(err);
});

Log.info('=> Logging in...');

bot.login(token).then(() => {
  ClientReady = true;
}).catch(err => {
  Log.error('=> Unable to log in!');
  Log.error(err);
});
