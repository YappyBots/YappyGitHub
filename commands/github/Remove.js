const ChannelConf = require('../../lib/ChannelConf');
const Log = require('../../lib/Logger').Logger;

module.exports = (bot) => (msg, command, args) => {

  let channelid = msg.channel.id;
  let conf = ChannelConf.find('channel_id', channelid)

  msg.channel.sendMessage(':gear: Working...');

  if (!conf) {
    return msg.channel.sendMessage(':x: This channel doesn\'t have any github events!');
  } else if (!msg.member.permissions.hasPermission('ADMINISTRATOR')) {
    return msg.channel.sendMessage(':x: Insuficient permissions! You must have administrator permissions to delete repository events!');
  }

  ChannelConf.delete(conf.channel_id).then(() => {
    msg.channel.sendMessage(`:white_check_mark: Successfully removed repository events in this channel for **${conf.repo}**.`);
  }).catch(err => {
    Log.error(err);
    msg.channel.sendMessage(`:x: An error occurred while trying to remove repository events for **${conf.repo}** in this channel.\n\`${err}\``);
  });

}
