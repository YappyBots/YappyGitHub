const github = require('../../Github/GithubEvents')._gh.github;
const Util = require('../../lib/Util');
const Log = require('../../lib/Logger').Logger;

module.exports = bot => (msg, command, args) => {

  let page = args[args.length - 1].indexOf('p') == 0 ? parseInt(args[args.length - 1].slice(1)) : 1;
  let query = args.slice(1).join(' ').replace(`p${page}`, '');

  github.search.issues({
    q: query + '+repo:hydrabolt/discord.js'
  }, (err, res) => {
    if (err) throw err;

    res.items = res.items.filter(e => e.html_url.indexOf('/pull/') < 0);

    let pagination = Util.Paginate(res.items, page, 10);

    let message = [
      `**ISSUES FOUND FOR QUERY \`${query}\`**`,
      `Page ${pagination.page || pagination.maxPage} of ${pagination.maxPage}`,
      ''
    ];

    pagination.items.forEach(issue => {
      message.push(`- **#${issue.number}** ${issue.title} (<${issue.html_url}>)`);
    });

    if (!pagination.items || !pagination.items.length) message.push('No issues found for that query :/')

    msg.channel.sendMessage(message);
  });

}
