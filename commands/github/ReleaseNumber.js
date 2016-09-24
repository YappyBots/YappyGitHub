const github = require('../../Github/GithubEvents').github;
const Util = require('../../lib/Util');
const Log = require('../../lib/Logger').Logger;
const moment = require('moment');

module.exports = bot => (msg, command, args) => {

  let release = args[0];

  github.repos.getReleases({
    user: 'hydrabolt',
    repo: 'discord.js',
    perPage: 99
  }, (err, res) => {
    if (err) err = JSON.parse(err);
    if (err && err.message !== "Not Found") throw new Error(`Unable to get release ${release} from Github\n ${err}`, `github`, err);

    let releaseObj = Util.Search(res, release)[0];

    if (!releaseObj) {
      return msg.channel.sendMessage(`Couldn't find release \`${release}\``);
    }

    github.repos.getRelease({
      user: 'hydrabolt',
      repo: 'discord.js',
      id: releaseObj.id
    }, (err, release) => {
      if (err && err.message !== "Not Found") throw new Error(`Unable to get release ${release} from Github\n ${err}`, `github`, err);
      if (err && err.message == "Not Found") {
        return msg.channel.sendMessage(`Unable to get release ${releaseObj.tag}: Release doesn't exist`);
      }

      let message = [
        `**RELEASE ${release.name}**`,
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
