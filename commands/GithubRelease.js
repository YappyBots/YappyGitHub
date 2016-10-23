const Command = require('../lib/Structures/Command');
const github = require('../Github/GithubEvents').github;
const ServerConf = require('../lib/ServerConf');
const Util = require('../lib/Util');
const Log = require('../lib/Logger').Logger;
const moment = require('moment');

class GithubReleaseCommand extends Command {

  constructor(bot) {
    super(bot);

    this.setHelp({
      name: 'release',
      description: 'Get info about a release',
      usage: 'release <tag|query>',
      examples: [
        'release 9',
        'release 8.2',
        'release 9.3'
      ]
    });
  }

  run(msg, args) {

    let release = args[0];
    let repository = ServerConf.GetGuild(msg.guild).repo;
    if (!repository) return msg.channel.sendMessage(`Global repository hasn't been configured. Please tell the server owner that they need to do \`G! conf set repo <user/repo>\`.`);

    repository = repository.split('/');
    let user = repository[0];
    let repo = repository[1];

    if (!release) release = 'latest';

    github.repos.getReleases({
      user, repo,
      perPage: 99
    }, (err, res) => {
      if (err) err = JSON.parse(err);
      if (err && err.message !== "Not Found") throw new Error(`Unable to get release ${issueNumber} from \`${repository.join('/')}\`\n ${err}`, `github`, err);
      if (err && err.message == "Not Found") {
        return msg.channel.sendMessage(`Unable to get issue #${issueNumber} from \`${repository.join('/')}\`: Issue doesn't exist`);
      }

      let releaseObj = Util.Search(res, release)[0];

      if (!releaseObj) {
        return msg.channel.sendMessage(`Couldn't find release \`${release}\` in ${repository.join('/')}`);
      }

      github.repos.getRelease({
        user: 'hydrabolt',
        repo: 'discord.js',
        id: releaseObj.id
      }, (err, release) => {
        if (err && err.message !== "Not Found") throw new Error(`Unable to get release ${release} from ${repository.join('/')}\n ${err}`, `github`, err);
        if (err && err.message == "Not Found") {
          return msg.channel.sendMessage(`Unable to get release ${releaseObj.tag} from ${repository.join('/')}: Release doesn't exist`);
        }

        let message = [
          `**RELEASE ${release.name} IN ${repository.join('/')}**`,
          `<${release.html_url}>`,
          ``,
          '```xl',
          `${Util.Pad('Title', 12)}: ${release.name}`,
          `${Util.Pad('Tag', 12)}: ${release.tag_name}`,
          `${Util.Pad('Author', 12)}: ${release.author ? release.author.login : 'Unknown'}`,
          `${Util.Pad('Pre-release', 12)}: ${release.prerelease ? 'Yes' : 'No'}`,
          `${Util.Pad('Created', 12)}: ${moment(release.published_at).fromNow()}`,
          `${Util.Pad('Body', 12)}: ${release.body.slice(1, 300).replace(/\n/g, '\n              ')}${release.body.length > 300 ? '...' : ''}`,
          '```'
        ];

        msg.channel.sendMessage(message).catch(Log.error);
      })
    });

  }

}

module.exports = GithubReleaseCommand;
