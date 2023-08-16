const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Guild = require('../../Models/Guild');
const GitHub = require('../../GitHub');
const markdown = require('../../Util/markdown');

class GitHubPullRequest extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'pr',
      description: 'Search PRs or get info about specific PR',
      usage: 'pr <search|#> [query] [p(page)]',
      examples: ['pr 5', 'pr search error', 'pr search event p2'],
    };

    this.setConf({
      guildOnly: true,
      aliases: ['prs', 'pull', 'pulls'],
    });
  }

  getSlashCommand() {
    return super
      .getSlashCommand()
      .addSubcommand((subcommand) =>
        subcommand
          .setName('info')
          .setDescription('Retrieve info for an PR in the GitHub repository.')
          .addIntegerOption((option) =>
            option
              .setName('number')
              .setDescription(
                "The number of the GitHub PR for the channel's configured repository."
              )
              .setRequired(true)
              .setMinValue(1)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('search')
          .setDescription('Search PRs in GitHub repository.')
          .addStringOption((option) =>
            option
              .setName('query')
              .setDescription('Search query')
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName('page')
              .setDescription('Specify page of PRs')
              .setMinValue(1)
          )
      );
  }

  async run(interaction) {
    const repo =
      (await Channel.findOrCreate(interaction.channel)).get('repo') ||
      (await Guild.findOrCreate(interaction.guild)).get('repo');

    const subcommand = interaction.options.getSubcommand();

    if (!repo)
      return this.commandError(
        interaction,
        GitHub.Constants.Errors.NO_REPO_CONFIGURED
      );

    if (subcommand === 'info') return this.pr(interaction, repo);
    if (subcommand === 'search') return this.search(interaction, repo);

    return this.errorUsage(interaction);
  }

  async pr(interaction, repository) {
    const prNumber = interaction.options.getInteger('number', true);

    await interaction.deferReply();

    try {
      const pr = await GitHub.getRepoPR(repository, prNumber);

      const body = pr.body;
      const [, imageUrl] = /!\[(?:.*?)\]\((.*?)\)/.exec(body) || [];

      const embed = new this.embed()
        .setTitle(`PR \`#${pr.number}\` - ${pr.title}`)
        .setURL(pr.html_url)
        .setDescription(markdown.convert(body, 500))
        .setColor('#84F139')
        .addFields([
          {
            name: 'Status',
            value: pr.state === 'open' ? 'Open' : 'Closed',
            inline: true,
          },
          {
            name: 'Merged',
            value: pr.merged ? 'Yes' : 'No',
            inline: true,
          },
          {
            name: 'Labels',
            value: pr.labels.length
              ? pr.labels
                  .map(
                    (e) =>
                      `[\`${e.name}\`](${e.url.replace(
                        'api.github.com/repos',
                        'github.com'
                      )})`
                  )
                  .join(', ')
              : 'None',
            inline: true,
          },
          {
            name: 'Milestone',
            value: pr.milestone
              ? `[${pr.milestone.title}](${pr.milestone.html_url})`
              : 'None',
            inline: true,
          },
          {
            name: 'Assignee',
            value: pr.assignee
              ? `[${pr.assignee.login}](${pr.assignee.html_url})`
              : 'None',
            inline: true,
          },
          {
            name: 'Comments',
            value: String(pr.comments),
            inline: true,
          },
          {
            name: 'Commits',
            value: String(pr.commits),
            inline: true,
          },
          {
            name: 'Changes',
            value: `+${pr.additions} | -${pr.deletions} (${pr.changed_files} changed files)`,
            inline: true,
          },
        ])
        .setFooter({
          text: repository,
          iconURL: this.bot.user.avatarURL(),
        });

      if (imageUrl)
        embed.setImage(
          imageUrl.startsWith('/')
            ? `https://github.com/${repository}/${imageUrl}`
            : imageUrl
        );

      if (pr.user)
        embed.setAuthor({
          name: pr.user.login,
          iconURL: pr.user.avatar_url,
          url: pr.user.html_url,
        });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const errorTitle = `PR \`#${prNumber}\``;

      return this.commandError(
        interaction,
        err.status !== 404 ? err : "PR doesn't exist or repo is private",
        errorTitle,
        repository
      );
    }
  }

  async search(interaction, repository) {
    const query = interaction.options.getString('query', true);
    const page = interaction.options.getInteger('page') || 1;
    const per_page = 10;

    await interaction.deferReply();

    return GitHub.search('issuesAndPullRequests', {
      page,
      per_page,
      q: `${query}+repo:${repository}+type:pr`,
    })
      .then((results) => {
        const totalPages = Math.ceil(results.total_count / per_page);

        const embed = new this.embed({
          title: `PRs - search \`${query}\``,
          description: '\u200B',
        })
          .setColor('#84F139')
          .setFooter({
            text: `${repository} ; page ${page} / ${totalPages}`,
          });

        if (results.items.length) {
          embed.setDescription(
            results.items
              .map(
                (pr) => `– [**\`#${pr.number}\`**](${pr.html_url}) ${pr.title}`
              )
              .join('\n')
          );
        } else {
          embed.setDescription('No PRs found');
        }

        return interaction.editReply({ embeds: [embed] });
      })
      .catch((err) => {
        if (GitHub.isGitHubError(err)) {
          const error = GitHub.getGitHubError(err);
          return this.commandError(
            interaction,
            error.errors[0]?.message || '',
            `${GitHub.Constants.HOST} | ${error.message}`,
            repository
          );
        } else {
          return this.commandError(interaction, err);
        }
      });
  }
}

module.exports = GitHubPullRequest;
