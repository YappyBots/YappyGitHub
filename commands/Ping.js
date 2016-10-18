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

  run(msg) {
    const startTime = now();

    return msg.channel.sendMessage(`Pinging...`).then(message => {
      const endTime = now();
      let difference = (endTime - startTime).toFixed(3);
      let moreThanOneSecond = endTime - startTime > 999;
      if (moreThanOneSecond) {
        difference = (difference / 1000).toFixed(3);
      }
      return message.edit(`Ping, Pong! Took ${difference} ${moreThanOneSecond ? 's' : 'ms'}`);
    });
  }
}


module.exports = PingCommand;
