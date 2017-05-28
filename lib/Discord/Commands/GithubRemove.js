const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const GithubUrlParser = require('../../Github/GithubRepoParser');

class GithubRemoveCommand extends Command {

  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'remove',
      summary: 'Remove repo events from the channel.',
      usage: 'remove [repo]',
      examples: [
        'remove',
        'remove private/repo',
      ],
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initialize'],
    });
  }

  async run(msg, args) {
    let channelid = msg.channel.id;
    let conf = ChannelConfig.FindByChannel(channelid);
    let repo = args[0] ? GithubUrlParser.Parse(args[0].toLowerCase()) : {};
    let repoFound = repo && !!repo.repo;

    if (!conf.repos || !conf.repos[0]) {
      return this.commandError(msg, 'This channel doesn\'t have any github events!');
    }

    if (conf.repos.length > 1 && repo.repo) repoFound = conf.repos.filter(e => e.toLowerCase() === repo.repo.toLowerCase())[0];
    else if (conf.repos.length === 1) repoFound = conf.repos[0];

    if (args[0] && !repoFound) {
      return this.commandError(msg, `This channel doesn't have github events for **${repo.repo || args[0]}**!`);
    } else if (conf.repos.length && conf.repos.length > 1 && !repoFound) {
      return this.commandError(msg, `Specify what github repo event to remove! Current repos: ${conf.repos.map(e => `**${e}**`).join(', ')}`);
    }

    const workingMsg = await msg.channel.send({
      embed: {
        color: 0xFB9738,
        title: `\`${repoFound}\`: ⚙ Working...`,
      },
    });

    return conf.deleteRepo(repoFound).then(() => {
      let embed = this._successMessage(repoFound);
      return workingMsg.edit({ embed });
    }).catch((err) => {
      Log.error(err);
      return this.commandError(msg, `An error occurred while trying to remove repository events for **${repoFound}** in this channel.\n\`${err}\``);
    });
  }

}

module.exports = GithubRemoveCommand;
