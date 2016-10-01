const github = require('../../Github/GithubEvents').github;
const ServerConf = require('../../lib/ServerConf');
const Util = require('../../lib/Util');
const Log = require('../../lib/Logger').Logger;

module.exports = bot => (msg, command, args) => {

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

    if (msg.author.equals(bot.user)) return msg.edit(message.join('\n')).catch(e => { throw e });

    msg.channel.sendMessage(message);
  });

}
