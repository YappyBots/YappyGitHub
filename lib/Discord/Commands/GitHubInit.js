const { CommandInteraction } = require('discord.js');
const Command = require('../Command');
const Channel = require('../../Models/Channel');
const GitHub = require('../../GitHub');
const GitHubUrlParser = require('../../GitHub/GitHubRepoParser');

class GitHubInitCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'init',
      summary: "Register GitHub repo's events on the channel.",
      description:
        'Initialize repo events on the channel.\n= Insert "private" as 2nd argument if the repo is private',
      usage: 'init <repo> [private]',
      examples: [
        'init datitisev/OhPlease-Yappy',
        'init https://github.com/datitisev/DiscordBot-Yappy',
        'init Private/Repo private',
      ],
    };

    this.setConf({
      permLevel: 1,
      guildOnly: true,
      aliases: ['initialize'],
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
          .setRequired(true)
      )
      .addBooleanOption((option) =>
        option
          .setName('private')
          .setDescription(
            'Is repository private? Disables repository lookup that check existences & avoids user error.'
          )
      );
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const repo = interaction.options.getString('repo');
    const isPrivate = interaction.options.getBoolean('private');

    const repository = GitHubUrlParser.Parse(repo) || {};

    const repoName = repository.name;
    const repoUser = repository.owner;
    if (!repository || !repoName || !repoUser)
      return this.errorUsage(interaction);
    const repoFullName = repository.repo && repository.repo.toLowerCase();

    await interaction.reply({
      embeds: [
        {
          color: 0xfb9738,
          title: `\`${repo}\`: ⚙ Working...`,
        },
      ],
    });

    const conf = await Channel.findOrCreate(interaction.channel, ['repos']);

    if (isPrivate) {
      // GitHubCache.add(repository.repo);
      const doc = conf.getRepos().includes(repoFullName);

      if (doc)
        return this.commandError(
          interaction,
          `Repository \`${repository.repo}\` is already initialized in this channel`
        );

      return conf.addRepo(repoFullName).then(() => {
        return interaction.editReply({
          embeds: [this._successMessage(repository.repo)],
        });
      });
    }

    let data;

    try {
      data = await GitHub.getRepo(repoFullName);
    } catch (err) {
      const errorMessage = err && err.message ? err.message : err || null;

      if (errorMessage && errorMessage !== 'Not Found')
        return this.commandError(
          interaction,
          `Unable to get repository info for \`${repo}\`\n${err}`
        );

      return this.commandError(
        interaction,
        `Unable to initialize! The repository \`${repository.repo}\` doesn't exist or is private!`
      );
    }

    const repoActualName = data.full_name;
    const doc = conf.getRepos().includes(repoActualName);

    if (doc)
      return this.commandError(
        interaction,
        `Repository \`${repoActualName}\` is already initialized in this channel`
      );

    await conf.addRepo(repoFullName);

    return interaction.editReply({
      embeds: [this._successMessage(repository.repo)],
    });
  }

  _successMessage(repo) {
    return {
      color: 0x84f139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${repo}\`: Successfully initialized repository events`,
      description:
        'The repository must a webhook pointing to <https://www.yappybots.tk/github>',
    };
  }
}

module.exports = GitHubInitCommand;
