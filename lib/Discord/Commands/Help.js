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
      aliases: ['h', 'init', 'remove'],
      msgTrigger: true,
    });
  }

  async run(msg) {
    msg.reply(
      [
        'Yappy now uses slash commands! Use `/` to see available commands.',
        'To setup repositories, use `/setup`. To configure the filtering options, use `/conf filter`.',
      ].join('\n')
    );
  }
}

module.exports = HelpCommand;
