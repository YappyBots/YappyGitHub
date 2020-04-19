const Command = require('../Command');
const Channel = require('../../Models/Channel');
const ChannelRepo = require('../../Models/ChannelRepo');
const GithubUrlParser = require('../../Github/GithubRepoParser');

class GithubRemoveCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'remove',
      summary: 'Remove repo events from the channel.',
      usage: 'remove [repo]',
      examples: ['remove', 'remove private/repo'],
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initialize'],
    });
  }

  async run(msg, args) {
    const channelid = msg.channel.id;
    const conf = await Channel.find(channelid, ['repos']);
    const repo = args[0] ? GithubUrlParser.Parse(args[0].toLowerCase()) : {};
    const repos = conf && conf.getRepos();
    let repoFound = repo && !!repo.repo;

    if (!repos || !repos[0]) {
      return this.commandError(
        msg,
        "This channel doesn't have any github events!"
      );
    }

    if (repos.length > 1 && repo.repo)
      repoFound = repos.find(
        (e) => e.toLowerCase() === repo.repo.toLowerCase()
      );
    else if (repos.length === 1) repoFound = repos[0];

    if (args[0] && !repoFound) {
      return this.commandError(
        msg,
        `This channel doesn't have github events for **${
          repo.repo || args[0]
        }**!`
      );
    } else if (repos.length && repos.length > 1 && !repoFound) {
      return this.commandError(
        msg,
        `Specify what github repo event to remove! Current repos: ${repos
          .map((e) => `**${e}**`)
          .join(', ')}`
      );
    }

    const workingMsg = await msg.channel.send({
      embed: {
        color: 0xfb9738,
        title: `\`${repoFound}\`: ⚙ Working...`,
      },
    });

    return ChannelRepo.where('channel_id', channelid)
      .where('name', repoFound)
      .destroy()
      .then(() => {
        let embed = this._successMessage(repoFound);
        return workingMsg.edit({ embed });
      })
      .catch((err) => {
        Log.error(err);
        return this.commandError(
          msg,
          `An error occurred while trying to remove repository events for **${repoFound}** in this channel.\n\`${err}\``
        );
      });
  }

  _successMessage(repo) {
    return {
      color: 0x84f139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${repo}\`: Successfully removed repository events`,
    };
  }
}

module.exports = GithubRemoveCommand;
