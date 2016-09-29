const ChannelConf = require('../../lib/ChannelConf');
const Log = require('../../lib/Logger').Logger;
const Owner = '175008284263186437';

module.exports = (bot) => (msg, command, args) => {
  if (msg.author.id !== Owner) return false;

  let message = args.join(' ');
  let channels = ChannelConf.array();

  Log.debug(`Message: ${message}`);
  Log.debug(`Channels: ${channels}`);

  if (!message) return false;

  for (let prop in channels) {
    if (!channels.hasOwnProperty(prop)) return false;

    let config = channels[prop];
    let channel = bot.channels.get(config.channel_id);

    if (!channel) return false;

    channel.sendMessage([
      `**👉 Announcement for ${channel.guild.name.toUpperCase()}** from @${msg.author.username}#${msg.author.discriminator}`,
      '',
      '```xl',
      message,
      '```'
    ]);
  }

}
