const Command = require('../Command');

class HelpCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'help',
      summary:
        'Obsolete command. Yappy now uses slash commands! Use `/` to see available commands.',
    };

    this.setConf({
      aliases: ['h'],
      msgTrigger: true,
    });
  }

  async run(msg) {
    msg.reply(
      'Yappy now uses slash commands! Use `/` to see available commands.'
    );
  }
}

module.exports = HelpCommand;
