const now = require('performance-now');
const Command = require('../Command');

class PingCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: 'ping',
      description: 'ping, pong',
      usage: 'ping',
    };
  }
  run(msg) {
    const startTime = now();
    return msg.channel.send(`⏱ Pinging...`).then(message => {
      const endTime = now();
      let difference = (endTime - startTime).toFixed(0);
      if (difference > 1000) difference = (difference / 1000).toFixed(0);
      let differenceText = (endTime - startTime) > 999 ? 's' : 'ms';
      return message.edit(`⏱ Ping, Pong! Took ${difference} ${differenceText}`);
    });
  }
}

module.exports = PingCommand;
