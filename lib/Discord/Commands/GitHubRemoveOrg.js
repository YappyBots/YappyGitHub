const Command = require('../Command');
const ChannelOrg = require('../../Models/ChannelOrg');

class GitHubRemoveOrgCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'removeorg',
      summary: 'Remove the initialized organization on the channel.',
      usage: 'removeorg <repo>',
      examples: ['removeorg YappyBots', 'removeorg Discord'],
    };

    this.setConf({
      permLevel: 1,
      guildOnly: true,
    });
  }

  getSlashCommand() {
    return super
      .getSlashCommand()
      .addStringOption((option) =>
        option
          .setName('org')
          .setDescription('The name of the corresponding GitHub organization.')
      );
  }

  async run(interaction) {
    await interaction.deferReply();

    const org = interaction.options.getString('org');

    const channelid = interaction.channel.id;
    const conf = await ChannelOrg.find(channelid);

    if (!conf) {
      return this.commandError(
        interaction,
        "This channel doesn't have any organization events!"
      );
    }

    return conf
      .destroy()
      .then(() =>
        interaction.editReply({
          embeds: [this._successMessage(org)],
        })
      )
      .catch((err) => {
        Log.error(err);

        return this.commandError(
          interaction,
          `An error occurred while trying to remove organization events for **${org}** in this channel.\n\`${err}\``
        );
      });
  }

  _successMessage(org) {
    return {
      color: 0x84f139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${org}\`: Successfully removed organization events`,
    };
  }
}

module.exports = GitHubRemoveOrgCommand;
