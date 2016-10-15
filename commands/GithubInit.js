const Command = require('../lib/Structures/Command');
const ChannelConf = require('../lib/ChannelConf');
const Log = require('../lib/Logger').Logger;
const Github = require('../Github/GithubEvents').github;
const GithubUrlParser = require('../lib/Util/GithubUrlParser');
const GithubCache = require('../lib/Util/GithubCache');

class GithubInitCommand extends Command {

  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'init',
      summary: 'Initialize repo events on the channel.',
      description: 'Initialize repo events on the channel.\n= Insert "private" as 2nd argument if the repo is private',
      usage: 'init <repo> [private]',
      examples: [
        'init datitisev/OhPlease-Yappy',
        'init https://github.com/datitisev/DiscordBot-Yappy',
        'init Private/Repo private'
      ]
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initialize']
    });
  }

  run(msg, args) {

    let channelid = msg.channel.id;
    let repo = args[0];
    let isPrivate = args[1] && (args[1].toLowerCase() == 'private');
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

    if (isPrivate || GithubCache.exists(repository.repo)) {
      GithubCache.add(repository.repo);

      ChannelConf.add(channelid, repo).then(() => {
        let message = this._successMessage(repository.repo);
        msg.channel.sendMessage(message);
      }).catch(err => {
        Log.error(err);
        msg.channel.sendMessage(`❌ An error occurred while trying to initialize repository events for private repo **${repo}** in this channel.\n\`${err}\``);
      });

      return false;
    }

    if (!repoName || !repoUser) {
      msg.channel.sendMessage(`❌ Invalid repository: **${repo}**`);
      return;
    }

    Github.repos.get({
      user: repoUser,
      repo: repoName
    }, (err, res) => {
      let errorMessage = err && err.message || null;

      if (errorMessage) {
        try {
          errorMessage = JSON.parse(err.message).message;
        } catch (e) {}
      }

      if (errorMessage && errorMessage !== "Not Found") return msg.channel.sendMessage(`Unable to get repository info for \`${repo}\`\n ${err}`);
      if (errorMessage && errorMessage == "Not Found") {
        return msg.channel.sendMessage(`❌ Unable to initialize! The repository \`${repository.repo}\` doesn't exist!`);
      }

      GithubCache.add(repository.repo);

      ChannelConf.add(channelid, repo).then(() => {
        let message = this._successMessage(repository.repo);
        msg.channel.sendMessage(message);
      }).catch(err => {
        Log.error(err);
        msg.channel.sendMessage(`❌ An error occurred while trying to initialize repository events for **${repo}** in this channel.\n\`${err}\``);
      });

    });

  }

  _successMessage(repo) {
    return [
      `✅ Successfully initialized repository events in this channel for **${repo}**.`,
      `The repo must a webhook pointing to <http://discordjsrewritetrello-datitisev.rhcloud.com/>`
    ])
  }

}

module.exports = GithubInitCommand;
