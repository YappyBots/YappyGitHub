const Command = require('../Command');
const Channel = require('../../Models/Channel');
const GitHub = require('../../GitHub');
const Log = require('../../Util/Log');

class GitHubInitOrgCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'initorg',
      summary:
        'Initialize all repo events from an organization on the channel.',
      usage: 'initorg <repo>',
      examples: ['initorg YappyBots', 'initorg Discord'],
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initializeorg'],
    });
  }

  getSlashCommand() {
    return super
      .getSlashCommand()
      .addStringOption((option) =>
        option
          .setName('org')
          .setDescription(
            'The name or URL of the corresponding GitHub organization.'
          )
          .setRequired(true)
      );
  }

  async run(interaction) {
    const org = interaction.options.getString('org');
    const organization = /^(?:https?:\/\/)?(?:github.com\/)?(.+)$/.exec(org);
    const orgName = organization && organization[0];

    if (!orgName) return this.errorUsage(msg);

    const workingMsg = await interaction.reply({
      embeds: [
        {
          color: 0xfb9738,
          title: `\`${orgName}\`: ⚙ Working...`,
        },
      ],
    });

    const conf = await Channel.findOrCreate(interaction.channel, ['org']);

    let orgData;

    try {
      orgData = await GitHub.getOrg(orgName);
    } catch (err) {
      const errorMessage = err && err.message ? err.message : err || null;

      if (errorMessage && errorMessage !== 'Not Found') {
        Log.error(err);

        return this.commandError(
          interaction,
          `Unable to get organization info for \`${orgName}\`\n${err}`
        );
      }

      return this.commandError(
        interaction,
        `Unable to initialize! The organization \`${orgName}\` doesn't exist!`
      );
    }

    const login = (orgData.login && orgData.login.toLowerCase()) || orgName;

    if (login === conf.getOrg()) return;

    await conf.addOrg(login);

    return interaction.editReply({
      embeds: [this._successMessage(orgName)],
    });
  }

  _successMessage(org) {
    return {
      color: 0x84f139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${org}\`: Successfully initialized organization events`,
      description:
        'The repositories and/or organization must have a webhook pointing to <https://www.yappybots.tk/github>',
    };
  }
}

module.exports = GitHubInitOrgCommand;
