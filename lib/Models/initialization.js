const Guild = require('./Guild');
const Channel = require('./Channel');

const loaded = { guilds: false, channels: false };

module.exports = async (bot) => {
  if (!loaded.guilds) {
    loaded.guilds = true;

    bot.on('guildDelete', async (guild) => {
      if (!guild || !guild.available) return;

      await Guild.delete(guild, false);
    });
  }

  if (!loaded.channels) {
    loaded.channels = true;

    bot.on('channelDelete', async (channel) => {
      if (!channel || channel.type !== 'text') return;

      await Channel.delete(channel, false);
    });
  }
};
