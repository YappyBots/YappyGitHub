const Command = require('../lib/Structures/Command');
const github = require('../Github/GithubEvents').github;
const ServerConf = require('../lib/ServerConf');
const Util = require('../lib/Util');
const Log = require('../lib/Logger').Logger;

class GithubPullRequestCommand extends Command {

  constructor(bot) {
    super(bot);

    this.setHelp({
      name: 'pr',
      description: 'Search pull requests or get info about specific PR',
      usage: 'pr <search|number> [query] [p(page)]',
      examples: [
        'pr 5',
        'pr search webhooks',
        'pr search voice p2'
      ]
    });

    this.setConf({
      aliases: ['pull']
    })
  }

  run(msg, args) {
    if (!args[0]) return msg.channel.sendMessage(`G! help pr`);

    if (args[0] == 'search') {
      this._search(msg, args);
    } else if (args.length == 1) {
      this._pr(msg, args);
    }
  }

  _pr(msg, args) {

    let prNumber = parseInt(args[0]);
    let repository = ServerConf.grab(msg.guild).repo;
    if (!repository) return msg.channel.sendMessage(`Global repository hasn't been configured. Please tell the server owner that they need to do \`G! conf set repo <user/repo>\`.`);

    repository = repository.split('/');
    let user = repository[0];
    let repo = repository[1];

    github.pullRequests.get({
      user, repo,
      number: prNumber
    }, (err, res) => {
      if (err || !res.commits_url) return msg.channel.sendMessage(`G! issue ${prNumber}`);

      let message = [
        `**PULL REQUEST #${prNumber} IN ${repository.join('/')}**`,
        `<${res.html_url}>`,
        ``,
        '```xl',
        `${Util.Pad('Title', 10)}: ${res.title}`,
        `${Util.Pad('Author', 10)}: ${res.user ? res.user.login : 'Unknown'}`,
        `${Util.Pad('Status', 10)}: ${res.state === 'open' ? 'Open': 'Closed'}`,
        `${Util.Pad('Merged', 10)}: ${res.merged ? 'Yes' : 'No'}`,
        `${Util.Pad('Assignee', 10)}: ${res.assignee ? res.assignee.login : 'None'}`,
        `${Util.Pad('Milestone', 10)}: ${res.milestone ? res.milestone.title : 'None'}`,
        `${Util.Pad('Labels', 10)}: ${res.labels && res.labels.length ? res.labels.map(e => e.name).join(', ') : 'None'}`,
        `${Util.Pad('Comments', 10)}: ${res.comments}`,
        `${Util.Pad('Commits', 10)}: ${res.commits}`,
        `${Util.Pad('Changes', 10)}: +${res.additions} | -${res.deletions} (${res.changed_files} changed files)`,
        '```'
      ];

      if (msg.author.equals(msg.client.user)) return msg.edit(message.join('\n')).catch(e => { throw e });

      msg.channel.sendMessage(message);
    });

  }

  _search(msg, args) {

    let page = args[args.length - 1].indexOf('p') == 0 ? parseInt(args[args.length - 1].slice(1)) : 1;
    let query = args.slice(1).join(' ').replace(`p${page}`, '');
    let repository = ServerConf.grab(msg.guild).repo;
    if (!repository) return msg.channel.sendMessage(`Global repository hasn't been configured. Please tell the server owner that they need to do \`G! conf set repo <user/repo>\`.`);

    repository = repository.split('/');

    github.search.issues({
      q: query + `+repo:${repository.join('/')}`
    }, (err, res) => {
      if (err) throw err;

      res.items = res.items.filter(e => e.html_url.indexOf('/pull/') >= 0);

      let pagination = Util.Paginate(res.items, page || 1, 10);

      let message = [
        `**PULL REQUESTS FOUND FOR QUERY \`${query}\` IN ${repository.join('/')}**`,
        `Page ${pagination.page} of ${pagination.maxPage}`,
        ''
      ];

      pagination.items.forEach(pr => {
        message.push(`- **#${pr.number}** ${pr.title} (<${pr.html_url}>)`);
      });

      if (!pagination.items || !pagination.items.length) message.push(`No pull requests found for that query in ${repository.join('/')} :/`)

      msg.channel.sendMessage(message);
    });

  }
}

module.exports = GithubPullRequestCommand;
