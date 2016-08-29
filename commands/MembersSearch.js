const Log = require('../lib/Logger').Logger;
const Trello = require('../lib/Cache');

const MembersSearch = (msg, command, args) => {
  args.shift();
  let search = args.join(' ');

  Trello.Search(search, ['members']).then(data => {
    let message = [`**MEMBER RESULTS**`, ``];
    let members = data.members;

    if (!members.length) {
      message.push(`No members found for the query \`${search}\``);
    }

    members.forEach(member => {
      message.push(` - ${member.fullName} (<https://trello.com/${member.username}>)`);
    });

    return msg.channel.sendMessage(message.join('\n'));
  }).catch(err => Log.error(err));
}

module.exports = bot => MembersSearch;
