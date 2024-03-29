const Module = require('../Module');
const Logger = require('@YappyBots/addons').discord.logger;
let logger;

class RunCommandModule extends Module {
  constructor(bot) {
    super(bot);
    logger = new Logger(bot, 'command');
  }

  get priority() {
    return 10;
  }

  run(interaction, next) {
    const command = interaction.commandName;

    const bot = this.bot;
    const perms = bot.permissions(interaction);
    const cmd =
      bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));

    if (!cmd) {
      return next();
    }

    const hasPermission = perms >= cmd.conf.permLevel;

    // logger.message(msg); // TODO

    Log.addBreadcrumb({
      category: 'discord.command',
      type: 'user',
      message: `${interaction} @ <#${interaction.channel?.id}>`,
    });

    // Only use for owner-only commands. They should only be accessible in a single server.
    if (!hasPermission && cmd.conf.permLevel >= 2)
      return cmd.commandError(
        interaction,
        `Insufficient permissions! Must be **${cmd._permLevelToWord(
          cmd.conf.permLevel
        )}** or higher`
      );

    if (cmd.conf.guildOnly && !interaction.inGuild()) {
      return cmd.commandError(interaction, `This is a guild only command.`);
    }

    try {
      let commandRun = cmd.run(interaction);
      if (commandRun && commandRun.catch) {
        commandRun.catch((e) => {
          logger.error(interaction, e);
          return cmd.commandError(interaction, e);
        });
      }
    } catch (e) {
      logger.error(interaction, e);
      cmd.commandError(interaction, e);
    }
  }
}

module.exports = RunCommandModule;
