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
        'remove all',
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
    let repo = args[0] ? GithubUrlParser.Parse(args[0].toLowerCase()).repo : null;
    let repoFound = !!repo;

    msg.channel.sendMessage('⚙ Working...');

    if (msg.member && !msg.member.permissions.hasPermission('ADMINISTRATOR') && !msg.author.id !== this.bot.config.owner) {
      return msg.channel.sendMessage('❌ Insuficient permissions! You must have administrator permissions to remove repository events!');
    } else if (!conf.repos || !conf.repos[0]) {
      return msg.channel.sendMessage('❌ This channel doesn\'t have any github events!');
    }

    if (conf.repos.length > 1 && repo) repoFound = conf.repos.filter(e => e === repo)[0]; else if (conf.repos.length === 1) repoFound = conf.repos[0];

    if (!repoFound) {
      return msg.channel.sendMessage(`❌ This channel doesn't have github events for **${repo || args[0]}**!`);
    } else if (conf.repos.length && conf.repos.length > 1 && !repoFound) {
      return msg.channel.sendMessage(`❌ Specify what github repo event to remove! Current repos: ${conf.repos.map(e => `**${e}**`).join(', ')}`);
    }

    return conf.deleteRepo(repoFound).then(() => {
      msg.channel.sendMessage(`✅ Successfully removed repository events in this channel for **${repoFound}**.`);
    }).catch((err) => {
      Log.error(err);
      msg.channel.sendMessage(`❌ An error occurred while trying to remove repository events for **${repoFound}** in this channel.\n\`${err}\``);
    });
  }

}

module.exports = GithubRemoveCommand;
