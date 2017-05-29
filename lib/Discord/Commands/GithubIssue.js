const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const Github = require('../../Github');

class GitlabIssue extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'issue',
      description: 'Search issues or get info about specific issue',
      usage: 'issue <search|#> [query] [p(page)]',
      examples: [
        'issue 5',
        'issue search error',
        'issue search event p2',
      ],
    };

    this.setConf({
      aliases: ['issues'],
    });
  }

  run(msg, args) {
    if (args.length === 1) return this.issue(msg, args);
    if (args[0] === 'search' && args.length > 1) return this.search(msg, args);

    return this.errorUsage(msg);
  }

  issue(msg, args) {
    const issueNumber = Number(args[0].replace(/#/g, ''));
    const repository = ChannelConfig.findByChannel(msg.channel.id).repo;
    if (!repository) return this.commandError(msg, Github.Constants.Errors.NO_REPO_CONFIGURED(this));
    if (!issueNumber) return this.errorUsage(msg);

    return Github.getRepoIssue(repository, issueNumber)
    .then(issue => {
      const body = issue.body;
      const [, imageUrl] = /!\[(?:.*?)\]\((.*?)\)/.exec(body) || [];

      const embed = new this.embed()
      .setTitle(`Issue \`#${issue.number}\` - ${issue.title}`)
      .setURL(issue.html_url)
      .setDescription(body ? `\u200B\n${body.slice(0, 2040)}\n\u200B` : '')
      .setColor('#84F139')
      .addField('Status', issue.state === 'open' ? 'Open' : 'Closed', true)
      .addField('Labels', issue.labels.length ? issue.labels.map(e => `[\`${e.name}\`](${e.url})`).join(', ') : 'None', true)
      .addField('Milestone', issue.milestone ? `[${issue.milestone.title}](${issue.milestone.html_url})` : 'None', true)
      .addField('Author', issue.user ? `[${issue.user.login}](${issue.user.html_url})` : 'Unknown', true)
      .addField('Assignee', issue.assignee ? `[${issue.assignee.login}](${issue.assignee.html_url})` : 'None', true)
      .addField('Comments', issue.comments, true)
      .setFooter(repository, this.bot.user.avatarURL);
      if (imageUrl) embed.setImage(imageUrl.startsWith('/') ? `https://github.com/${repository}/${imageUrl}` : imageUrl);

      return msg.channel.send({ embed });
    }).catch(err => {
      const errorTitle = `Issue \`#${issueNumber}\``;
      Log.error(err);
      return this.commandError(msg, err.message !== 'Not Found' ? err : 'Issue doesn\'t exist', errorTitle, repository);
    });
  }
}

module.exports = GitlabIssue;
