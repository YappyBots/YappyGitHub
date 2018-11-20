const Command = require('../lib/Structures/Command');
const ChannelConf = require('../lib/ChannelConf');
const Log = require('../lib/Logger').Logger;

class GithubRemoveCommand extends Command {

  constructor(bot) {
    super(bot);

    this.setHelp({
      name: 'remove',
      description: 'Remove Github repo events on the channel',
      usage: 'remove'
    });

    this.setConf({
      permLevel: 1
    });
  }

  run(msg, args) {

    let channelid = msg.channel.id;
    let conf = ChannelConf.FindByChannel(channelid);
    let repo = args[0];

    msg.channel.send('⚙ Working...');

    if (!conf || !conf[0]) {
      return msg.channel.send('❌ This channel doesn\'t have any github events!');
    } else if (msg.member && !msg.member.permissions.hasPermission('ADMINISTRATOR') && msg.author.id !== this.bot.config.owner) {
      return msg.channel.send('❌ Insuficient permissions! You must have administrator permissions to delete repository events!');
    }

    if (conf.length > 1 && repo) {
      conf = conf.filter(e => e.repo === repo)[0];
    } else if (conf.length === 1) conf = conf[0];

    if (!conf) {
      return msg.channel.send(`❌ This channel doesn\'t have github events for **${repo}**!`);
    } else if (conf.length && conf.length > 1) {
      return msg.channel.send(`❌ Specify what github repo event to remove! You can remove ${conf.map(e => `**${e.repo}**`).join(', ')}`);
    }

    return conf.delete().then(() => {
      msg.channel.send(`✅ Successfully removed repository events in this channel for **${conf.repo}**.`);
    }).catch(err => {
      Log.error(err);
      msg.channel.send(`❌ An error occurred while trying to remove repository events for **${conf.repo}** in this channel.\n\`${err}\``);
    });

  }

}

module.exports = GithubRemoveCommand;
