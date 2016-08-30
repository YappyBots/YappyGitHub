const Log = require('../lib/Logger').Logger;

const Say = (msg, command, args) => {

  if (msg.author.id !== '175008284263186437') return false;

  msg.channel.sendMessage(args.join(' ')).then(() => msg.delete()).catch(err => Log.error(err));

}

module.exports = bot => Say;
