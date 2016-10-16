const now = require('performance-now');
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
    const startTime = now();

    return msg.channel.sendMessage(`Pinging...`).then(message => {
      const endTime = now();
      let difference = (endTime - startTime).toFixed(3);
      if (difference > 999) {
        difference = difference / 1000;
      }
      return message.edit(`Ping, Pong! Took ${difference} ${message.createdTimestamp - oldTime > 999 ? 's' : 'ms'}`);
    });
  }
}


module.exports = PingCommand;
