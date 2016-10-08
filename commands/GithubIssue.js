const Command = require('../lib/Structures/Command');
const github = require('../Github/GithubEvents').github;
const ServerConf = require('../lib/ServerConf');
const Util = require('../lib/Util');
const Log = require('../lib/Logger').Logger;

class GithubIssue extends Command {

  constructor(bot) {
    super(bot);

    this.setHelp({
      name: 'issue',
      description: 'Search issues or get info about specific issue',
      usage: 'issue <search|number> [query] [p(page)]',
      examples: [
        'issue 5',
        'issue search client',
        'issue search no voice p2'
      ]
    });

    this.setConf({
      aliases: ['issues']
    });
  }

  run(msg, args) {
    if (!args[0]) return msg.channel.sendMessage(`G! help issue`);

    if (args[0] == 'search') {
      this._search(msg, args);
    } else if (args.length == 1) {
      this._issue(msg, args);
    }
  }

  _issue(msg, args) {

    let issueNumber = parseInt(args[0]);

    let repository = ServerConf.grab(msg.guild).repo;
    if (!repository) return msg.channel.sendMessage(`Global repository hasn't been configured. Please tell the server owner that they need to do \`G! conf set repo <user/repo>\`.`);

    repository = repository.split('/');
    let user = repository[0];
    let repo = repository[1];

    github.issues.get({
      user, repo,
      number: issueNumber
    }, (err, res) => {
      err = JSON.parse(err);

      if (err && err.message !== "Not Found") throw new Error(`Unable to get issue #${issueNumber} from \`${repository.join('/')}\`\n ${err}`, `github`, err);
      if (err && err.message == "Not Found") {
        return msg.channel.sendMessage(`Unable to get issue #${issueNumber} from \`${repository.join('/')}\`: Issue doesn't exist`);
      }

      if (res.html_url.indexOf('pull') >= 0) return msg.channel.sendMessage(`G! pr ${issueNumber}`);

      let message = [
        `**ISSUE #${issueNumber} IN ${repository.join('/')}**`,
        `<${res.html_url}>`,
        ``,
        '```xl',
        `${Util.Pad('Title', 10)}: ${res.title}`,
        `${Util.Pad('Author', 10)}: ${res.user ? res.user.login : 'Unknown'}`,
        `${Util.Pad('Status', 10)}: ${res.state === 'open' ? 'Open' : 'Closed'}`,
        `${Util.Pad('Assignee', 10)}: ${res.assignee ? res.assignee.login : 'None'}`,
        `${Util.Pad('Milestone', 10)}: ${res.milestone ? res.milestone.title : 'None'}`,
        `${Util.Pad('Labels', 10)}: ${res.labels && res.labels.length ? res.labels.map(e => e.name).join(', ') : 'None'}`,
        `${Util.Pad('Comments', 10)}: ${res.comments}`,
        '```'
      ];

      if (msg.author.equals(bot.user)) return msg.edit(message.join('\n')).catch(e => { throw e });

      msg.channel.sendMessage(message);
    });

  }

  _search(msg, args) {

    let page = args[args.length - 1].indexOf('p') == 0 ? parseInt(args[args.length - 1].slice(1)) : 1;
    let query = args.slice(1).join(' ').replace(`p${page}`, '');

    if (!query) return false;

    let repository = ServerConf.grab(msg.guild).repo;
    if (!repository) return msg.channel.sendMessage(`Global repository hasn't been configured. Please tell the server owner that they need to do \`G! conf set repo <user/repo>\`.`);

    repository = repository.split('/');

    github.search.issues({
      q: query + `+repo:${repository.join('/')}`
    }, (err, res) => {
      if (err) throw err;

      res.items = res.items.filter(e => e.html_url.indexOf('/pull/') < 0);

      let pagination = Util.Paginate(res.items, page, 10);

      let message = [
        `**ISSUES FOUND FOR QUERY \`${query}\` IN ${repository.join('/')}**`,
        `Page ${pagination.page || pagination.maxPage} of ${pagination.maxPage}`,
        ''
      ];

      pagination.items.forEach(issue => {
        message.push(`- **#${issue.number}** ${issue.title} (<${issue.html_url}>)`);
      });

      if (!pagination.items || !pagination.items.length) message.push(`No issues found for that query in ${repository.join('/')} :/`)

      msg.channel.sendMessage(message);
    });

  }

}

module.exports = GithubIssue;
