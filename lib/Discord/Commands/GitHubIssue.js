const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Guild = require('../../Models/Guild');
const GitHub = require('../../GitHub');
const Log = require('../../Util/Log');

class GitHubIssue extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'issue',
      description: 'Search issues or get info about specific issue',
      usage: 'issue <search|#> [query] [p(page)]',
      examples: ['issue 5', 'issue search error', 'issue search event p2'],
    };

    this.setConf({
      guildOnly: true,
      aliases: ['issues'],
    });
  }

  getSlashCommand() {
    return super
      .getSlashCommand()
      .addSubcommand((subcommand) =>
        subcommand
          .setName('info')
          .setDescription(
            'Retrieve info for an issue in the GitHub repository.'
          )
          .addIntegerOption((option) =>
            option
              .setName('number')
              .setDescription(
                "The number of the GitHub issue for the channel's configured repository."
              )
              .setRequired(true)
              .setMinValue(1)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('search')
          .setDescription('Search issues in GitHub repository.')
          .addStringOption((option) =>
            option
              .setName('query')
              .setDescription('Search query')
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName('page')
              .setDescription('Specify page of issues')
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

    if (subcommand === 'info') return this.issue(interaction, repo);
    if (subcommand === 'search') return this.search(interaction, repo);

    return this.errorUsage(interaction);
  }

  async issue(interaction, repository) {
    const issueNumber = interaction.options.getInteger('number', true);

    await interaction.deferReply();

    try {
      const issue = await GitHub.getRepoIssue(repository, issueNumber);

      const body = issue.body;
      const [, imageUrl] = /!\[(?:.*?)\]\((.*?)\)/.exec(body) || [];

      const embed = new this.embed()
        .setTitle(`Issue \`#${issue.number}\` - ${issue.title}`)
        .setURL(issue.html_url)
        .setDescription(
          (body || '')
            .replace(/<!--([\w\W]+?)-->/g, '')
            .trim()
            .slice(0, 2040)
        )
        .setColor('#84F139')
        .addField('Status', issue.state === 'open' ? 'Open' : 'Closed', true)
        .addField(
          'Labels',
          issue.labels?.length
            ? issue.labels.map((e) => `[\`${e.name}\`](${e.url})`).join(', ')
            : 'None',
          true
        )
        .addField(
          'Milestone',
          issue.milestone
            ? `[${issue.milestone.title}](${issue.milestone.html_url})`
            : 'None',
          true
        )
        .addField(
          'Assignee',
          issue.assignee
            ? `[${issue.assignee.login}](${issue.assignee.html_url})`
            : 'None',
          true
        )
        .addField('Comments', String(issue.comments) || '?', true)
        .setFooter(repository, this.bot.user.avatarURL());

      if (imageUrl)
        embed.setImage(
          imageUrl.startsWith('/')
            ? `https://github.com/${repository}/${imageUrl}`
            : imageUrl
        );

      if (issue.user)
        embed.setAuthor({
          name: issue.user.login,
          iconURL: issue.user.avatar_url,
          url: issue.user.html_url,
        });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const errorTitle = `Issue \`#${issueNumber}\``;

      return this.commandError(
        interaction,
        err.message !== 'Not Found'
          ? err
          : "Issue doesn't exist or repo is private",
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
      q: `${query}+repo:${repository}+type:issue`,
    })
      .then((results) => {
        const totalPages = Math.ceil(results.total_count / per_page);

        const embed = new this.embed({
          title: `Issues - search \`${query}\``,
          description: '\u200B',
        })
          .setColor('#84F139')
          .setFooter(`${repository} ; page ${page} / ${totalPages}`);

        if (results.items?.length) {
          results.items.forEach((issue) => {
            embed.description += `\n– [**\`#${issue.number}\`**](${issue.html_url}) ${issue.title}`;
          });
        } else {
          embed.setDescription('No issues found');
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

module.exports = GitHubIssue;
