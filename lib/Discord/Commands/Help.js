const Command = require('../Command');

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
    let commandName = args[0];
    if (!commandName) {
      let commands = this.bot.commands;
      let commandsForEveryone = commands.filter(e => !e.conf.permLevel || e.conf.permLevel === 0);
      let commandsForAdmin = commands.filter(e => e.conf.permLevel === 1);
      let commandsForOwner = commands.filter(e => e.conf.permLevel === 2);

      let embed = new this.embed()
      .setColor('#84F139')
      .setTitle(`Commands List`)
      .setDescription(`Use \`${this.bot.prefix}help <command>\` for details\n\u200B`)
      .setFooter(this.bot.user.username, this.bot.user.avatarURL)
      .addField('__Public__', commandsForEveryone.map(command => {
        let help = command.help;
        return `\`${help.name}\`: ${help.summary || help.description}`;
      }).join('\n'));

      if (msg.client.permissions(msg) > 0 && commandsForAdmin.size) {
        embed.addField('__Admin__', commandsForAdmin.map(command => {
          let help = command.help;
          return `\`${help.name}\`: ${help.summary || help.description}`;
        }).join('\n'));
      }
      if (msg.client.permissions(msg) > 1 && commandsForOwner.size) {
        embed.addField('__Owner__', commandsForOwner.map(command => {
          let help = command.help;
          return `\`${help.name}\`: ${help.summary || help.description}`;
        }).join('\n'));
      }

      return msg.channel.send({ embed });
    } else if (commandName) {
      let command = this.bot.commands.get(commandName) || (this.bot.aliases.has(commandName) ? this.bot.commands.get(this.bot.aliases.get(commandName)) : null);
      if (!command) return this.commandError(msg, `Command \`${commandName}\` doesn't exist`);

      let embed = new this.embed()
      .setColor('#84F139')
      .setTitle(`Command  \`${command.help.name}\``)
      .setDescription(`${command.help.description || command.help.summary}\n\u200B`)
      .setFooter(this.bot.user.username, this.bot.user.avatarURL)
      .addField('Usage', `\`${this.bot.prefix}${command.help.usage}\``);

      if (command.conf.aliases && command.conf.aliases.length) embed.addField('Aliases', command.conf.aliases.map(e => `\`${e}\``).join(', '), true);
      if (command.help.examples && command.help.examples.length) {
        embed.addField('Examples', command.help.examples.map(e => `\`${this.bot.prefix}${e}\``).join('\n'), true);
      }
      embed.addField('Permission', `${this._permLevelToWord(command.conf.permLevel)}\n\u200B`);

      return msg.channel.send({ embed });
    }
  }
}

module.exports = HelpCommand;
