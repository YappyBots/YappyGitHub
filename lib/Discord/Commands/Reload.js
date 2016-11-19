const Command = require('../Command');
const fs = require('fs');
const path = require('path');

class ReloadCommand extends Command {
  constructor(bot) {
    super(bot);
    this.setHelp({
      name: 'reload',
      description: 'reloads a command, duh',
      usage: 'reload <command>',
      examples: [
        'reload stats',
        'reload test',
      ],
    });
    this.setConf({
      permLevel: 2,
      aliases: ['r'],
    });
  }
  run(msg, args) {
    let argName = args[0] ? args[0].toLowerCase() : null;
    let bot = this.bot;
    let command = bot.commands.get(argName);
    if (argName === 'all') {
      return this.reloadAllCommands(msg).catch((err) => {
        return this.sendError(`all`, null, err, msg);
      });
      return;
    } else if (!command && bot.aliases.has(argName)) {
      command = bot.commands.get(bot.aliases.get(argName));
    } else if (!argName) {
      return msg.channel.sendMessage(`❌ No command provided`);
    } else if (!command) {
      return msg.channel.sendMessage(`❌ Command \`${argName}\` doesn't exist`);
    }
    let fileName = command ? command.help.file : args[0];
    let cmdName = command ? command.help.name : args[0];

    msg.channel.sendMessage(`⚙ Reloading Command \`${cmdName}\`...`).then(m => {
      bot.reloadCommand(fileName).then(() => {
        m.edit(`✅ Successfully Reloaded Command \`${cmdName}\``);
      }).catch(e => this.sendError(cmdName, m, e));
    });
  }
  sendError(t, m, e, msg) {
    let content = [
      `❌ Unable To Reload \`${t}\``,
      '```js',
      e.stack,
      '```',
    ];
    if (!!m) {
      return m.edit(content);
    } else {
      return msg.channel.sendMessage(content);
    }
  }
  async reloadAllCommands(msg) {
    let m = await msg.channel.sendMessage(`⚙ Reloading All Commands...`);
    this.bot.commands.forEach(async (command, i, o) => {
      await this.bot.reloadCommand(command.help.name);
    });
    return m.edit(`✅ Successfully Reloaded All Commands`);
  }
}

module.exports = ReloadCommand;