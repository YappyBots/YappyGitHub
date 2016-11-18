const path = require('path');
const Client = require('./Client');
const Log = require('../Util/Log');
const bot = new Client({
  name: 'Yappy, the Github Monitor',
  disableEveryone: true,
  disabledEvents: [
    'typingStart',
    'typingStop',
    'userUpdate',
    'voiceStateUpdate',
    'channelCreate',
    'channelDelete',
    'channelPinsUpdate',
    'channelUpdate',
    'guildBanAdd',
    'guildBanRemove',
    'guildEmojiCreate',
    'guildEmojiDelete',
    'guildEmojiUpdate',
    'guildMemberAdd',
    'guildMemberAvailable',
    'guildMemberRemove',
    'guildMembersChunk',
    'guildMemberSpeaking',
    'guildMemberUpdate',
    'guildUnavailable',
    'guildUpdate',
    'messageDelete',
    'messageDeleteBulk',
    'messageUpdate',
    'presenceUpdate',
    'roleCreate',
    'roleDelete',
    'roleUpdate',
    'userUpdate',
    'voiceStateUpdate',
    'debug',
    'warn'
  ],
});
const TOKEN = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.YAPPY_GITHUB_DISCORD;

bot.on('ready', () => {
  Log.info('=> Bot: Logged In');
  bot.booted = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  };
});
bot.on('error', Log.error);

bot.on('message', (msg) => {
  try {
    bot.runCommand(msg);
  } catch (e) {
    bot.emit('error', e);
  }
});
bot.on('runCommand', Log.message);

bot.loadCommands(path.resolve(__dirname, 'Commands'));

// === LOGIN ===

Log.info('=> Bot: Logging in...');
bot.login(TOKEN).catch((err) => {
  Log.error('=> Bot: Unable to log in');
  Log.error(err);
});

module.exports = bot;
