const Command = require('../Command');
const Discord = require('discord.js');

class AnnounceCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: 'announce',
      description: 'announce something to all server owners',
      usage: 'announce <announcement>',
    };
    this.setConf({
      permLevel: 2,
    });
  }
  run(msg, args) {
    let message = args.join(' ');
    let owners = this.bot.guilds.map(e => e.owner).filter((e, i, o) => o.indexOf(e) === i);

    for (let owner of owners) {
      if (!owner) return;

      let embed = new Discord.RichEmbed()
      .setAuthor(msg.author.username, msg.author.avatarURL)
      .setColor(0xFB5432)
      .setTitle(`Announcement to all servers using Yappy`)
      .setDescription([
        `\u200B`,
        message,
        `\u200B`,
      ].join('\n'))
      .addTimestamp();

      return owner.sendEmbed(embed);
    }
  }
}

module.exports = AnnounceCommand;
