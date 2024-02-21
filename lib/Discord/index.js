const path = require('path');
const {
  GatewayIntentBits,
  Options,
  Partials,
  Colors,
  Events,
} = require('discord.js');

const Client = require('./Client');
const Log = require('../Util/Log');

const { addCommands } = require('@YappyBots/addons').discord.commands;
const bot = new Client({
  name: 'Yappy, the GitHub Monitor',
  allowedMentions: { repliedUser: true },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
  owner: process.env.DISCORD_OWNER_ID,
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    ReactionManager: 0,
    MessageManager: 50,
    GuildMemberManager: {
      maxSize: 100,
      keepOverLimit: (member) => member.id === bot.user.id,
    },
  }),
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

bot.on(Events.ClientReady, () => {
  Log.info('Bot | Logged In');
  logger.log('Logged in', null, Colors.Green);
  initialization(bot);
});

bot.on('disconnect', (e) => {
  Log.warn(`Bot | Disconnected (${e.code}).`);
  logger.log('Disconnected', e.code, Colors.Orange);
});

bot.on(Events.Error, (e) => {
  Log.error(e);
  logger.log(e.message || 'An error occurred', e.stack || e, Colors.Red);
});

bot.on(Events.Warn, (e) => {
  Log.warn(e);
  logger.log(e.message || 'Warning', e.stack || e, Colors.Orange);
});

bot.on(Events.MessageCreate, async (message) => {
  if (!bot.application?.owner) await bot.application?.fetch();

  await bot.runCommandMessage(message);
});

bot.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await bot.runCommand(interaction);
  } catch (e) {
    bot.emit('error', e);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
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
  setTimeout(() => process.exit(Number.isInteger(err?.code) ? err.code : 1), 3000);
});

module.exports = bot;
