const Command = require('../Command');

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
  async run(msg, args) {
    let announcement = args.join(' ');
    let owners = this.bot.guilds.map(e => e.owner).filter((e, i, o) => o.indexOf(e) === i);
    let messagedOwners = [];
    let message = await msg.channel.send({
      embed:
      {
        title: 'Announce',
        color: 0xFB5432,
        description: 'Announcing message....',
        timestamp: new Date(),
      },
    });
    for (let owner of owners) {
      if (!owner) return;
      if (messagedOwners.includes(owner.id)) return;
      messagedOwners.push(owner.id);
      let embed = new this.embed()
      .setAuthor(msg.author.username, msg.author.avatarURL)
      .setColor(0xFB5432)
      .setTitle(`Announcement to all server owners of servers using Yappy Github`)
      .setDescription([
        `\u200B`,
        announcement,
        `\u200B`,
      ].join('\n'))
      .setTimestamp();
      await owner.send({ embed });
    }
    // await message.delete();
    return message.edit({
      embed: {
        title: 'Announce',
        color: 0x1F9523,
        description: 'Successfully announced!',
        timestamp: new Date(),
      },
    });
  }
}

module.exports = AnnounceCommand;
