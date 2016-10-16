const Discord = require('discord.js');
const bot = new Discord.Client();
const BotCache = new require('./lib/BotCache')(bot);
const Log = require('./lib/Logger').Logger;
const ServerConf = require('./lib/ServerConf');
const BotsDiscordPwAPI = require('./lib/Structures/BotsDiscordPw');

const token = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.BOT_TOKEN;
let GithubPrefix = 'G! ';
let ClientReady = false;

const PingCommand = require('./commands/Ping');

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
  ClientReady = true;
});

bot.on('error', err => {
  Log.error(err);
});
bot.on('disconnect', () => Log.info('Disconnected! Reconnecting...'));

process.on('unhandledRejection', (err) => {
  if (typeof err == 'object' && !!err.stack) {
    err.stack = err.stack.replace(new RegExp(__dirname, 'g'), '.');
  }

  let message = [
    '**UNHANDLED REJECTION**',
    '',
    '```xl',
    err.stack || err,
    '```'
  ].join('\n');

  Log.error(err.stack);

  if (ClientReady) bot.users.get('175008284263186437').sendMessage(message);
});

process.on('uncaughtException', err => {
  if (typeof err == 'object' && !!err.stack) {
    err.stack = err.stack.replace(new RegExp(__dirname, 'g'), '.');
  }

  let message = [
    '**UNCAUGHT EXCEPTION**',
    '',
    '```xl',
    err.stack || err,
    '```'
  ].join('\n');

  Log.error(err.stack);

  if (ClientReady) bot.users.get('175008284263186437').sendMessage(message);
});

Log.info('=> Logging in...');

bot.login(token).then(token => {
  // Detect if login failed or didn't occur after 7.5s
  setTimeout(() => {
    if (ClientReady) return false;
    Log.error('=> Unable to log in; invalid credentials or Discord is down');
  }, 7500);
}).catch(err => {
  Log.error('=> Unable to log in!');
  Log.error(err);
});
