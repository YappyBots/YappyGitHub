const ChannelConf = require('../../lib/ChannelConf');
const Log = require('../../lib/Logger').Logger;

module.exports = (bot) => (msg, command, args) => {

  let channelid = msg.channel.id;
  let repo = args[0];
  let conf = ChannelConf.find('channel_id', channelid)

  msg.channel.sendMessage(':gear: Working...');

  if (conf) {
    return msg.channel.sendMessage(':x: This channel already has events for a github repo!');
  } else if (!msg.member.permissions.hasPermission('ADMINISTRATOR')) {
    return msg.channel.sendMessage(':x: Insuficient permissions! You must have administrator permissions to initialize repository events!');
  }

  ChannelConf.add(channelid, repo).then(() => {
    msg.channel.sendMessage([
      `:white_check_mark: Successfully initialized repository events in this channel for **${repo}**.`,
      `The repo must a webhook pointing to <http://discordjsrewritetrello-datitisev.rhcloud.com/> with every event except for \`watch\` and \`fork\`, they are buggy for some reason :/`
    ]);
  }).catch(err => {
    Log.error(err);
    msg.channel.sendMessage(`:x: An error occurred while trying to initialize repository events for **${repo}** in this channel.\n\`${err}\``);
  });

}
