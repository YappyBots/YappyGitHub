const ChannelConf = require('../../lib/ChannelConf');
const Log = require('../../lib/Logger').Logger;
const Github = require('../../Github/GithubEvents').github;
const GithubUrlParser = require('../../lib/Util/GithubUrlParser');

module.exports = (bot) => (msg, command, args) => {

  let channelid = msg.channel.id;
  let repo = args[0];
  let conf = ChannelConf.find('channel_id', channelid);

  msg.channel.sendMessage('⚙ Working...');

  if (conf) {
    return msg.channel.sendMessage('❌ This channel already has events for a github repo!');
  } else if (msg.member && !msg.member.permissions.hasPermission('ADMINISTRATOR')) {
    return msg.channel.sendMessage('❌ Insuficient permissions! You must have administrator permissions to initialize repository events!');
  }

  let repository = GithubUrlParser.Parse(repo);

  if (!repository) return msg.channel.sendMessage('❌ Error! \`${repo}\` is an invalid Github repository resolvable.');

  let repoName = repository.name;
  let repoUser = repository.owner;

  Github.repos.get({
    user: repoUser,
    repo: repoName
  }, (err, res) => {

    let errorMessage = err && err.message ? JSON.parse(err.message).message : null;

    if (errorMessage && errorMessage !== "Not Found") return msg.channel.sendMessage(`Unable to get repository info for \`${repo}\`\n ${err}`);
    if (errorMessage && errorMessage == "Not Found") {
      return msg.channel.sendMessage(`❌ Unable to initialize! The repository \`${repository.repo}\` doesn't exist!`);
    }

    ChannelConf.add(channelid, repo).then(() => {
      msg.channel.sendMessage([
        `✅ Successfully initialized repository events in this channel for **${repository.repo}**.`,
        `The repo must a webhook pointing to <http://discordjsrewritetrello-datitisev.rhcloud.com/> with every event except for \`watch\` and \`fork\`, they are buggy for some reason :/`
      ]);
    }).catch(err => {
      Log.error(err);
      msg.channel.sendMessage(`❌ An error occurred while trying to initialize repository events for **${repo}** in this channel.\n\`${err}\``);
    });

  });

}
