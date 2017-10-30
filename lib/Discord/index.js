const path = require('path');
const Client = require('./Client');
const Log = require('../Util/Log');
const bot = new Client({
  name: 'Yappy, the Github Monitor',
  disableEveryone: true,
  disabledEvents: [
    'CHANNEL_UPDATE',
    'GUILD_UPDATE',
    'GUILD_BAN_ADD',
    'GUILD_BAN_REMOVE',
    'GUILD_EMOJIS_UPDATE',
    'GUILD_MEMBER_ADD',
    'GUILD_MEMBER_REMOVE',
    'GUILD_MEMBER_UPDATE',
    'GUILD_MEMBERS_CHUNK',
    'GUILD_ROLE_CREATE',
    'GUILD_ROLE_UPDATE',
    'GUILD_ROLE_DELETE',
    'MESSAGE_UPDATE',
    'MESSAGE_DELETE',
    'MESSAGE_DELETE_BULK',
    'PRESENCE_UPDATE',
    'TYPING_START',
    'USER_SETTINGS_UPDATE',
    'USER_UPDATE',
    'VOICE_STATE_UPDATE',
    'VOICE_SERVER_UPDATE',
  ],
  owner: '175008284263186437',
  prefix: 'GB! ',
});
const TOKEN = process.env.DISCORD_TOKEN;

const { ChannelConfig, ServerConfig } = require('../Models');

bot.booted = {
  date: new Date().toLocaleDateString(),
  time: new Date().toLocaleTimeString(),
};

bot.statuses = ['Online', 'Connecting', 'Reconnecting', 'Idle', 'Nearly', 'Offline'];
bot.statusColors = ['lightgreen', 'orange', 'orange', 'orange', 'green', 'red'];

bot.on('ready', () => {
  Log.info('Bot | Logged In');
  ChannelConfig.init(bot);
  ServerConfig.init(bot);
});

bot.on('disconnect', (e) => Log.warn(`Bot | Disconnected (${e.code}).`));
bot.on('error', Log.error);
bot.on('warn', Log.warn);

bot.on('message', (msg) => {
  try {
    bot.runCommand(msg);
  } catch (e) {
    bot.emit('error', e);
  }
});

bot.on('runCommand', Log.message);

bot.loadCommands(path.resolve(__dirname, 'Commands'));
bot.loadModules(path.resolve(__dirname, 'Modules'));


// === LOGIN ===
Log.info(`Bot | Logging in with prefix ${bot.prefix}...`);

bot.login(TOKEN).catch((err) => {
  Log.error('Bot: Unable to log in');
  Log.error(err);
  process.exit(err.code);
});

module.exports = bot;
