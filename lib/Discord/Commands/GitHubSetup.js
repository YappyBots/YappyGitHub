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

    await interaction.reply({
      embeds: [
        {
          color: 0x84f139,
          description: `Visit ${process.env.WEB_HOST}/setup/${id} to setup the repository.`,
        },
      ],
      ephemeral: true,
    });
  }
}

module.exports = GitHubSetupCommand;
