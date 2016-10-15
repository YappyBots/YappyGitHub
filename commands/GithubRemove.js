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
    let conf = ChannelConf.find('channel_id', channelid);

    msg.channel.sendMessage('⚙ Working...');

    if (!conf) {
      return msg.channel.sendMessage('❌ This channel doesn\'t have any github events!');
    } else if (msg.member && !msg.member.permissions.hasPermission('ADMINISTRATOR') && !msg.author.id !== msg.config.owner) {
      return msg.channel.sendMessage('❌ Insuficient permissions! You must have administrator permissions to delete repository events!');
    }

    conf.delete().then(() => {
      msg.channel.sendMessage(`✅ Successfully removed repository events in this channel for **${conf.repo}**.`);
    }).catch(err => {
      Log.error(err);
      msg.channel.sendMessage(`❌ An error occurred while trying to remove repository events for **${conf.repo}** in this channel.\n\`${err}\``);
    });

  }

}

module.exports = GithubRemoveCommand;
