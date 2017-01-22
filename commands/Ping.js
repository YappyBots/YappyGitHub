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

    return msg.channel.sendMessage(`Pinging...`).then(message => {
      const startTime = msg.createdTimestamp;
      const endTime = message.createdTimestamp;
      let difference = (endTime - startTime).toFixed(2);
      let moreThanOneSecond = endTime - startTime > 999;
      if (moreThanOneSecond) {
        difference = (difference / 1000).toFixed(2);
      }
      return message.edit(`Ping, Pong! Took ${difference} ${moreThanOneSecond ? 's' : 'ms'}`);
    });
  }
}


module.exports = PingCommand;
