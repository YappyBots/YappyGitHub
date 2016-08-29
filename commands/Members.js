const Log = require('../lib/Logger').Logger;
const Trello = require('../lib/Cache');

const Members = (msg, command, args) => {

  Trello.Members().then(members => {
    let message = [`**ALL MEMBERS**`, ``];

    if (!members.length) {
      message.push(`No members found in DiscordJS Rewrite Board!`);
    }

    members.forEach(member => {
      message.push(` - ${member.fullName} (<https://trello.com/${member.username}>)`);
    });

    return msg.channel.sendMessage(message.join('\n'));
  }).catch(err => Log.error(err));

}

module.exports = bot => Members;
