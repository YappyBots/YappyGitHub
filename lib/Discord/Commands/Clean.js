const Command = require('../Command');

class CleanCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'clean',
      description: 'clean the messages of the bot found in the number provided',
      usage: 'clean [number=10]',
      examples: [
        'clean',
        'clean 14',
      ],
    };

    this.setConf({
      permLevel: 1,
    });
  }

  run(msg, args) {
    let messageCount = args[0] && !isNaN(args[0]) ? Number(args[0]) : 10;

    msg.channel.fetchMessages({
      limit: 50,
    }).then(messages => {
      let msgs = messages.filter(e => e.author.equals(this.bot.user));
      let i = 1;
      for (let [, message] of msgs) {
        if (i > messageCount) break;
        message.delete();
        i++;
      }
    });
  }
}


module.exports = CleanCommand;
