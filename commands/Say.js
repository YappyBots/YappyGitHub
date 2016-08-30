const Log = require('../lib/Logger').Logger;

const Say = (msg, command, args) => {

  msg.channel.sendMessage(args.join(' ')).then(() => msg.delete()).catch(err => Log.error(err));

}

module.exports = bot => Say;
