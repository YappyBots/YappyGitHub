const Command = require('../Command');

class InviteCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'invite',
      description: 'get invite link',
      usage: 'clean',
    };
  }

  run(msg) {
    const botInviteLink =
      'https://discordapp.com/oauth2/authorize?permissions=67193856&scope=bot&client_id=219218963647823872';
    const serverInviteLink = 'http://discord.gg/HHqndMG';

    return msg.author
      .send({
        embeds: [
          {
            title: 'Yappy, the GitHub Monitor',
            description: [
              '__Invite Link__:',
              `**<${botInviteLink}>**`,
              '',
              '__Official Server__:',
              `**<${serverInviteLink}>**`,
            ].join('\n'),
            color: 0x84f139,
            thumbnail: {
              url: this.bot.user.avatarURL(),
            },
          },
        ],
      })
      .then(() =>
        msg.channel.send({
          embeds: [
            {
              title: 'Yappy, the GitHub Monitor',
              description: '📬 Sent invite link!',
            },
          ],
        })
      );
  }
}

module.exports = InviteCommand;
