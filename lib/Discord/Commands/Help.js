const Command = require('../Command');
const Pad = require('../../Util/Pad');

class HelpCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: 'help',
      description: 'you all need some help',
      usage: 'help [command]',
    };
    this.props.conf.aliases = ['support'];
  }
  run(msg, args) {
    if (!args[0]) {
      let commands = this.bot.commands;
      let commandsForEveryone = commands.filter(e => !e.conf.permLevel || e.conf.permLevel === 0);
      let commandsForAdmin = commands.filter(e => e.conf.permLevel === 1);
      let commandsForOwner = commands.filter(e => e.conf.permLevel === 2);
      let message = [
        `[ Commands List ]`,
        ``,
        `Use \`${this.bot.prefix}help <command>\` for details`,
        ``,
        `PUBLIC`,
        ...commandsForEveryone.map(command => {
          let help = command.help;
          return `${Pad(command.help.name, 8)} = ${help.summary || help.description}`;
        }),
      ];
      if (msg.client.permissions(msg) > 0 && commandsForAdmin.size) {
        message = message.concat([
          ``,
          `ADMIN`,
          ...commandsForAdmin.map(command => {
            let help = command.help;
            return `${Pad(command.help.name, 8)} = ${help.summary || help.description}`;
          }),
        ]);
      }
      if (msg.client.permissions(msg) > 1 && commandsForOwner.size) {
        message = message.concat([
          ``,
          `OWNER`,
          ...commandsForOwner.map(command => {
            let help = command.help;
            return `${Pad(command.help.name, 8)} = ${help.summary || help.description}`;
          }),
        ]);
      }

      msg.channel.sendMessage([
        '```ini',
        ...message,
        '```',
      ]);
    } else {
      let command = args[0];
      if (!this.bot.commands.has(command)) return false;
      command = this.bot.commands.get(command);
      msg.channel.sendMessage([
        '```ini',
        `[ Command: ${command.help.name} ]`,
        ``,
        `Description`,
        `= ${command.help.description || command.help.summary}`,
        ``,
        `Usage`,
        `= ${this.bot.prefix}${command.help.usage}`,
        [
          command.conf.aliases && command.conf.aliases.length ? [``, `Aliases`, command.conf.aliases.map(e => `= ${e}`).join('\n'), ``].join('\n') : ``,
          command.help.examples && command.help.examples.length ? [``, `Examples`, command.help.examples.map(e => `= ${this.bot.prefix}${e}`).join('\n'), ``].join('\n') : ``,
        ].join(''),
        `Permission`,
        `= ${this._permLevelToWord(command.conf.permLevel)}`,
        '```',
      ]);
    }
  }
}

module.exports = HelpCommand;
