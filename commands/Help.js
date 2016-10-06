const Log = require('../lib/Logger').Logger;
const Command = require('../lib/Structures/Command');
const Pad = require('../lib/Util').Pad;

class HelpCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'help',
      description: 'you all need some help',
      usage: 'help [command]'
    }

    this.props.conf.aliases = ['support'];
  }

  run(msg, args) {

    if (!args[0]) {

      msg.channel.sendMessage([
        '**```ini',
        `[ Commands List ]`,
        ``,
        `Use ?help <command> for details`,
        ``,
        ...this.bot.commands.map(command => {
          return `${Pad(command.help.name, 8)} = ${command.help.description}`;
        }),
        '```**'
      ]);

    } else {

      let command = args[0];
      if (!this.bot.commands.has(command)) return false;
      command = this.bot.commands.get(command);
      msg.channel.sendMessage([
        '**```ini',
        `[ Command: ${command.help.name} ]`,
        ``,
        `Description`,
        `= ${command.help.description}`,
        ``,
        `Usage`,
        `= G! ${command.help.usage}`,
        ``,
        `Aliases`,
        command.conf.aliases && command.conf.aliases.length ? command.conf.aliases.map(e => {
          return `= ${e}`
        }).join('\n') : `= N/A`,
        ``,
        `Examples`,
        command.help.examples && command.help.examples.length ? command.help.examples.map(e => {
          return `= G! ${e}`;
        }).join('\n') : `= N/A`,
        '```**'
      ]);

    }

  }
}

module.exports = HelpCommand;
