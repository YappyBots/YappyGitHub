const Log = require('../lib/Logger').Logger;
const Command = require('../lib/Structures/Command');

class SayCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'say',
      description: 'the bot says the text you want it to say',
      usage: 'say <text>',
      examples: [
        'say Mermelada',
        'say I am Yappy! Nice to meet you!'
      ]
    };
  }

  run(msg, args) {
    msg.channel.sendMessage(args.join(' '))
    .then(msg.delete.bind(msg));
  }
}


module.exports = SayCommand;
