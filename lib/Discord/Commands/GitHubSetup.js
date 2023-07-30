const { CommandInteraction } = require('discord.js');
const uuid = require('uuid');
const Command = require('../Command');
const redis = require('../../Util/redis');

class GitHubSetupCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'setup',
      summary: "Register GitHub repo's events on the channel.",
    };

    this.setConf({
      permLevel: 1,
      guildOnly: true,
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const id = uuid.v4();

    await redis.setHash(
      'setup',
      id,
      {
        channel_id: interaction.channel.id,
        channel_name: interaction.channel.name,
        guild_name: interaction.guild.name,
      },
      60 * 30
    );

    const ttl = Math.floor(Date.now() / 1000) + (await redis.ttl('setup', id));

    await interaction.reply({
      embeds: [
        {
          color: 0x84f139,
          description: [
            `[Click here](${process.env.WEB_HOST}/setup/${id}) to setup the repository.`,
            `The link will expire <t:${ttl}:R>.`,
            '',
            `If you'd rather not use the GitHub integration, you may set up a webhook to ${process.env.WEB_HOST}/hook/channels/${interaction.channel.id} instead.`,
            'You may use a single webhook for up to 10 comma-separated channel IDs.',
            'View your channel config to see the required webhook secret. All channels in the webhook will need to use the same secret.',
          ].join('\n'),
        },
      ],
      ephemeral: true,
    });
  }
}

module.exports = GitHubSetupCommand;
