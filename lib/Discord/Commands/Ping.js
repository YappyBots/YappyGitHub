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
  run(interaction) {
    const startTime = now();
    return interaction.reply(`⏱ Pinging...`).then(() => {
      const endTime = now();

      let difference = (endTime - startTime).toFixed(0);
      if (difference > 1000) difference = (difference / 1000).toFixed(0);
      let differenceText = endTime - startTime > 999 ? 's' : 'ms';

      return interaction.editReply(
        `⏱ Ping, Pong! Took ${difference} ${differenceText}`
      );
    });
  }
}

module.exports = PingCommand;
