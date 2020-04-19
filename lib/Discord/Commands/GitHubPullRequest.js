const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Guild = require('../../Models/Guild');
const GitHub = require('../../GitHub');

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
      aliases: [
        'prs',
        'pull',
        'pulls',
      ],
    });
  }

  async run(msg, args) {
    const repo =
      (await Channel.find(msg.channel.id)).get('repo') ||
      (await Guild.find(msg.guild.id)).get('repo');

    if (!repo)
      return this.commandError(
        msg,
        GitHub.Constants.Errors.NO_REPO_CONFIGURED(this)
      );

    if (args.length === 1) return this.pr(msg, repo, args);
    if (args[0] === 'search' && args.length > 1)
      return this.search(msg, repo, args);

    return this.errorUsage(msg);
  }

  async pr(msg, repository, args) {
    const prNumber = Number(args[0].replace(/#/g, ''));

    if (!prNumber) return this.errorUsage(msg);

    try {
      const pr = await GitHub.getRepoPR(repository, prNumber);

      const body = pr.body;
      const [, imageUrl] = /!\[(?:.*?)\]\((.*?)\)/.exec(body) || [];

      const embed = new this.embed()
        .setTitle(`PR \`#${pr.number}\` - ${pr.title}`)
        .setURL(pr.html_url)
        .setAuthor(pr.user.login, pr.user.avatar_url, pr.user.html_url)
        .setDescription(
          (body || '')
            .replace(/<!--([\w\W]+?)-->/g, '')
            .trim()
            .slice(0, 2040)
        )
        .setColor('#84F139')
        .addField('Status', pr.state === 'open' ? 'Open' : 'Closed', true)
        .addField('Merged', pr.merged ? 'Yes' : 'No', true)
        .addField(
          'Labels',
          pr.labels.length
            ? pr.labels.map((e) => `[\`${e.name}\`](${e.url})`).join(', ')
            : 'None',
          true
        )
        .addField(
          'Milestone',
          pr.milestone
            ? `[${pr.milestone.title}](${pr.milestone.html_url})`
            : 'None',
          true
        )
        .addField(
          'Assignee',
          pr.assignee
            ? `[${pr.assignee.login}](${pr.assignee.html_url})`
            : 'None',
          true
        )
        .addField('Comments', pr.comments, true)
        .addField('Commits', pr.commits, true)
        .addField(
          'Changes',
          `+${pr.additions} | -${pr.deletions} (${pr.changed_files} changed files)`,
          true
        )
        .setFooter(repository, this.bot.user.avatarURL());
      if (imageUrl)
        embed.setImage(
          imageUrl.startsWith('/')
            ? `https://github.com/${repository}/${imageUrl}`
            : imageUrl
        );

      return msg.channel.send({
        embed,
      });
    } catch (err) {
      const errorTitle = `PR \`#${prNumber}\``;

      Log.error(err);

      return this.commandError(
        msg,
        err.code !== 404 ? err : "PR doesn't exist",
        errorTitle,
        repository
      );
    }
  }

  async search(msg, repository, args) {
    const page =
      args[args.length - 1].indexOf('p') === 0
        ? parseInt(args[args.length - 1].slice(1))
        : 1;
    const query = args.slice(1).join(' ').replace(`p${page}`, '');

    if (!query) return this.errorUsage(msg);

    const per_page = 10;

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
          .setFooter(`${repository} ; page ${page} / ${totalPages}`);

        if (results.items.length) {
          results.items.forEach((pr) => {
            embed.description += `\n– [**\`#${pr.number}\`**](${pr.html_url}) ${pr.title}`;
          });
        } else {
          embed.setDescription('No PRs found');
        }

        return msg.channel.send({ embed });
      })
      .catch((err) => {
        if (GitHub.isGitHubError(err)) {
          const error = GitHub.getGitHubError(err);
          return this.commandError(
            msg,
            error.errors[0] ? error.errors[0].message : '',
            `${GitHub.Constants.HOST} | ${error.message}`,
            repository
          );
        } else {
          return this.commandError(msg, err);
        }
      });
  }
}

module.exports = GitHubPullRequest;
