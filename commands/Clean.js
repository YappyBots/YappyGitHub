const Log = require('../lib/Logger').Logger;
const Command = require('../lib/Structures/Command');

class CleanCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'clean',
      description: 'clean the messages of the bot found in the number provided',
      usage: 'clean [number=100]',
      examples: [
        'clean',
        'clean 14'
      ]
    };
  }

  run(msg, args) {
    let messagesToClean = args[0] && !isNaN(args[0]) ? Number(args[0]) : 100;

    msg.channel.fetchMessages({
      limit: messagesToClean
    }).then(messages => {
      messages.filter(e => e.author.equals(this.bot.user)).forEach(message => {
        return message.delete();
      });
    });
  }
}


module.exports = CleanCommand;
