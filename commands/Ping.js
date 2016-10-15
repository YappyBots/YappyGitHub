const Command = require('../lib/Structures/Command');

class PingCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'ping',
      description: 'ping, pong',
      usage: 'ping'
    }
  }

  run(msg, args) {
    let currentTime = msg.createdTimestamp;
    msg.channel.sendMessage(`Pinging...`).then(message => {
      let difference = currentTime - message.createdTimestamp;
      if (difference > 999) {
        difference = difference / 1000;
      }
      return message.edit(`Ping, Pong! Took ${difference} ${currentTime - message.createdTimestamp > 999 ? 's' : 'ms'}`);
    }).catch(console.error);
  }
}


module.exports = PingCommand;
