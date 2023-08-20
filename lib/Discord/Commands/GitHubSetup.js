const { CommandInteraction } = require('discord.js');
const uuid = require('uuid');
const Command = require('../Command');
const redis = require('../../Util/redis');
const cache = require('../../Util/cache');

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

    cache.channels.expire(interaction.channel.id);

    const ttl = Math.floor(Date.now() / 1000) + (await redis.ttl('setup', id));

    await interaction.reply({
      embeds: [
        {
          color: 0x84f139,
          description: [
            `[Click here](${process.env.WEB_HOST}/setup/${id}) to setup the repository. The link will expire <t:${ttl}:R>.`,
            '',
            `The GitHub app is the preferred method of integration. However, you may visit ${process.env.WEB_HOST}/hook/channels/${interaction.channel.id} for instructions on configuring webhooks directly.`,
          ].join('\n'),
        },
      ],
      ephemeral: true,
    });
  }
}

module.exports = GitHubSetupCommand;
