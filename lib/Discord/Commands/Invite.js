const Command = require('../Command');

class InviteCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'invite',
      description: 'Get invite link for the bot',
    };
  }

  run(interaction) {
    const botInviteLink =
      'https://discordapp.com/oauth2/authorize?permissions=67193856&scope=bot&client_id=219218963647823872';
    const serverInviteLink = 'http://discord.gg/HHqndMG';

    return interaction.reply({
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
      ephemeral: true,
    });
  }
}

module.exports = InviteCommand;
