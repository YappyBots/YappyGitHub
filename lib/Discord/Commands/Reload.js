const Command = require('../Command');

class ReloadCommand extends Command {
  constructor(bot) {
    super(bot);
    this.setHelp({
      name: 'reload',
      description: 'reloads a command, duh',
      usage: 'reload <command>',
      examples: ['reload stats', 'reload test'],
    });
    this.setConf({
      permLevel: 2,
    });
  }

  getSlashCommand() {
    return super.getSlashCommand().addStringOption((option) =>
      option
        .setName('command')
        .setDescription('The name of the command to reload')
        .addChoices(...['all', ...this.bot.commands.keys()].map((v) => ({ name: v, value: v })))
        .setRequired(true)
    );
  }

  async run(interaction) {
    const arg = interaction.options.getString('command');
    const bot = this.bot;
    const command = bot.commands.get(arg);

    await interaction.deferReply({ ephemeral: true });

    if (arg === 'all') {
      return this.reloadAllCommands(interaction).catch((err) =>
        this.sendError(`all`, err, interaction)
      );
    } else if (!arg) {
      return this.errorUsage(interaction);
    } else if (!command) {
      return interaction.editReply(`❌ Command \`${arg}\` doesn't exist`);
    }

    const fileName = command ? command.help.file : arg;
    const cmdName = command ? command.help.name : arg;

    return bot
      .reloadCommand(fileName)
      .then(() =>
        interaction.editReply(`✅ Successfully Reloaded Command \`${cmdName}\``)
      )
      .catch((e) => this.sendError(cmdName, e, interaction));
  }

  sendError(t, e, interaction) {
    let content = [
      `❌ Unable To Reload \`${t}\``,
      '```js',
      e.stack ? e.stack.replace(this._path, `.`) : e,
      '```',
    ];

    return interaction.editReply(content);
  }

  async reloadAllCommands(interaction) {
    for (const [, command] of this.bot.commands) {
      const cmdName = command.help.file || command.help.name;

      try {
        await this.bot.reloadCommand(cmdName);
      } catch (err) {
        this.sendError(cmdName, err, interaction);
      }
    }

    return interaction.editReply(`✅ Successfully Reloaded All Commands`);
  }
}

module.exports = ReloadCommand;
