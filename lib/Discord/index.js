const path = require('path');
const { Intents } = require('discord.js');
const Client = require('./Client');
const Log = require('../Util/Log');
const { addCommands } = require('@YappyBots/addons').discord.commands;
const bot = new Client({
  name: 'Yappy, the GitHub Monitor',
  allowedMentions: { repliedUser: true },
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
  partials: ['CHANNEL'],
  owner: '175008284263186437',
});
const TOKEN = process.env.DISCORD_TOKEN;
const logger = new (require('@YappyBots/addons').discord.logger)(bot, 'main');

const initialization = require('../Models/initialization');

bot.booted = {
  date: new Date().toLocaleDateString(),
  time: new Date().toLocaleTimeString(),
};

bot.statuses = [
  'Online',
  'Connecting',
  'Reconnecting',
  'Idle',
  'Nearly',
  'Offline',
];
bot.statusColors = ['lightgreen', 'orange', 'orange', 'orange', 'green', 'red'];

bot.on('ready', () => {
  Log.info('Bot | Logged In');
  logger.log('Logged in', null, 'GREEN');
  initialization(bot);
});

bot.on('disconnect', (e) => {
  Log.warn(`Bot | Disconnected (${e.code}).`);
  logger.log('Disconnected', e.code, 'ORANGE');
});

bot.on('error', (e) => {
  Log.error(e);
  logger.log(e.message || 'An error occurred', e.stack || e, 'RED');
});

bot.on('warn', (e) => {
  Log.warn(e);
  logger.log(e.message || 'Warning', e.stack || e, 'ORANGE');
});

bot.on('messageCreate', (msg) => {
  try {
    bot.runCommand(msg);
  } catch (e) {
    bot.emit('error', e);
  }
});

bot.on('runCommand', Log.message);

bot.loadCommands(path.resolve(__dirname, 'Commands'));
bot.loadModules(path.resolve(__dirname, 'Modules'));
addCommands(bot);

// === LOGIN ===
Log.info(`Bot | Logging in...`);

bot.login(TOKEN).catch((err) => {
  Log.error('Bot | Unable to log in');
  Log.error(err);
  process.exit(err.code);
});

module.exports = bot;
