
const Command = require('../lib/Structures/Command');
const ChannelConf = require('../lib/ChannelConf');
const Log = require('../lib/Logger').Logger;
const Owner = '175008284263186437';

class GithubAnnounceCommand extends Command {

  constructor(bot) {
    super(bot);

    this.setHelp({
      name: 'announce',
      description: 'Announce a message to all channels with Github events',
      usage: 'announce <text>'
    });

    this.setConf({
      permLevel: 2
    });
  }

  run(msg, args) {
    if (msg.author.id !== Owner) return false;
    let bot = this.bot;

    let message = args.join(' ');
    let channels = ChannelConf.array();

    if (!message) return false;

    for (let prop in channels) {
      if (!channels.hasOwnProperty(prop)) return false;

      let config = channels[prop];
      let channel = bot.channels.get(config.channel_id);

      if (!channel) return false;

      channel.sendMessage([
        `**👉 Announcement from @${msg.author.username}#${msg.author.discriminator}**`,
        '',
        '```xl',
        message,
        '```'
      ]);
    }
  }

}

module.exports = GithubAnnounceCommand;
