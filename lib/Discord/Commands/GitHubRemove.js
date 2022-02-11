const Command = require('../Command');
const Channel = require('../../Models/Channel');
const ChannelRepo = require('../../Models/ChannelRepo');
const GitHubUrlParser = require('../../GitHub/GitHubRepoParser');
const { CommandInteraction } = require('discord.js');

class GitHubRemoveCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'remove',
      summary: "Unregister GitHub repo's events on the channel.",
      usage: 'remove [repo]',
      examples: ['remove', 'remove private/repo'],
    };

    this.setConf({
      permLevel: 1,
    });
  }

  getSlashCommand() {
    return super
      .getSlashCommand()
      .addStringOption((option) =>
        option
          .setName('repo')
          .setDescription(
            'The name or URL of the corresponding GitHub repository.'
          )
      );
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    await interaction.deferReply();

    const repoArg = interaction.options.getString('repo');
    const repo = GitHubUrlParser.Parse(repoArg) || {};

    const channelid = interaction.channel.id;
    const conf = await Channel.findOrCreate(interaction.channel, ['repos']);
    const repos = conf && conf.getRepos();
    let repoFound = repo && !!repo.repo;

    if (!repos || !repos[0]) {
      return this.commandError(
        interaction,
        "This channel doesn't have any GitHub events!"
      );
    }

    if (repos.length > 1 && repo.repo)
      repoFound = repos.find(
        (e) => e.toLowerCase() === repo.repo.toLowerCase()
      );
    else if (repos.length === 1) repoFound = repos[0];

    if (repoArg && !repoFound) {
      return this.commandError(
        interaction,
        `This channel doesn't have GitHub events for **${
          repo.repo || repoArg
        }**!`
      );
    } else if (repos.length && repos.length > 1 && !repoFound) {
      return this.commandError(
        interaction,
        `Specify what GitHub repo event to remove! Current repos: ${repos
          .map((e) => `**${e}**`)
          .join(', ')}`
      );
    }

    await interaction.editReply({
      embeds: [
        {
          color: 0xfb9738,
          title: `\`${repoFound}\`: ⚙ Working...`,
        },
      ],
    });

    return ChannelRepo.where('channel_id', channelid)
      .where('name', repoFound)
      .destroy()
      .then(() => {
        return interaction.editReply({
          embeds: [this._successMessage(repoFound)],
        });
      })
      .catch((err) => {
        Log.error(err);
        return this.commandError(
          interaction,
          `An error occurred while trying to remove repository events for **${repoFound}** in this channel.\n\`${err}\``
        );
      });
  }

  _successMessage(repo) {
    return {
      color: 0x84f139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${repo}\`: Successfully removed repository events`,
    };
  }
}

module.exports = GitHubRemoveCommand;
