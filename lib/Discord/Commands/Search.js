const Command = require('../Command');
const Github = require('../../Github');
const moment = require('moment');

const getType = type => {
  if (/^(repository|repositories|repos|repo)$/im.test(type)) return 'repos';
  if (/^(users|user)$/im.test(type)) return 'users';
};

class GithubSearch extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'search',
      description:
        'Search repos and users.\nType can be any of the following: `repos`, `repositories`, `users`, and a few more.',
      usage: 'search <repos|users> <query>',
      examples: ['search repos yappygithub', 'search users datitisev'],
    };
  }

  run(msg, args) {
    if (args.length >= 2) return this.search(msg, args);

    return this.errorUsage(msg);
  }

  search(msg, args) {
    const type = getType(args[0]);
    const query = args.slice(1).join(' ');

    if (!type || !query) return this.errorUsage(msg);

    return Github.search(type, query).then(data => {
      const { total_count: total, incomplete_results, items } = data;

      if ((!total || total === 0) && !incomplete_results) {
        this.commandError(
          msg,
          'No results found',
          `Search \`${query}\` of \`${type}\``
        );
      } else if (total === 0 && incomplete_results) {
        this.commandError(
          msg,
          "GitHub didn't find all results, and no results were found",
          `Search \`${query}\` of \`${type}\``
        );
      } else {
        if (items[0].type === 'User')
          return this.users({ msg, type, query, data });
        if (items[0].default_branch)
          return this.repos({ msg, type, query, data });
        return this.commandError(
          msg,
          'Unknown items were returned from the search',
          `Search \`${query}\` of \`${type}\``
        );
      }
    });
  }

  users({ msg, data }) {
    const item = data.items[0];

    return Github.getUserByID(item.id).then(user => {
      const embed = new this.embed({
        title: user.login,
        url: user.html_url,
        color: 0x84f139,
        description: `${user.bio || '\u200B'}\n`,
        thumbnail: {
          url: user.avatar_url,
        },
        timestamp: Date.now(),
      });

      embed
        .addField('Name', user.name || user.login, true)
        .addField('Company', user.company || 'None', true)
        .addField('Repos', user.public_repos || 'Unknown', true)
        .addField(
          'Since',
          moment(user.created_at).format('MMMM Do, YYYY. h:mm A'),
          true
        );

      return msg.channel.send({ embed });
    });
  }

  repos({ msg, data }) {
    const repo = data.items[0];

    const embed = new this.embed({
      title: repo.full_name,
      url: repo.html_url,
      color: 0x84f139,
      description: `${repo.description || '\u200B'}\n`,
      thumbnail: {
        url: repo.owner.avatar_url,
      },
      timestamp: Date.now(),
    });

    embed
      .addField(
        repo.owner.type,
        repo.owner
          ? `[${repo.owner.name || repo.owner.login}](${repo.owner.html_url})`
          : 'Unknown',
        true
      )
      .addField('Stars', repo.stargazers_count, true)
      .addField('Forks', repo.forks, true)
      .addField(
        'Open Issues',
        repo.has_issues ? repo.open_issues : 'Disabled',
        true
      )
      .addField('Language', repo.language || 'Unknown', true);

    return msg.channel.send({ embed });
  }
}

module.exports = GithubSearch;
