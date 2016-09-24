const github = require('../../Github/GithubEvents').github;
const Util = require('../../lib/Util');
const Log = require('../../lib/Logger').Logger;

module.exports = bot => (msg, command, args) => {

  let page = args[args.length - 1].indexOf('p') == 0 ? parseInt(args[args.length - 1].slice(1)) : 1;
  let query = args.slice(1).join(' ').replace(`p${page}`, '');

  github.search.issues({
    q: query + '+repo:hydrabolt/discord.js'
  }, (err, res) => {
    if (err) throw err;

    res.items = res.items.filter(e => e.html_url.indexOf('/pull/') >= 0);

    let pagination = Util.Paginate(res.items, page || 1, 10);

    let message = [
      `**PULL REQUESTS FOUND FOR QUERY \`${query}\`**`,
      `Page ${pagination.page} of ${pagination.maxPage}`,
      ''
    ];

    pagination.items.forEach(pr => {
      message.push(`- **#${pr.number}** ${pr.title} (<${pr.html_url}>)`);
    });

    if (!pagination.items || !pagination.items.length) message.push('No pull requests found for that query :/')

    msg.channel.sendMessage(message);
  });

}
