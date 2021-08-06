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

  run(msg, args, next, command) {
    const bot = this.bot;
    const perms = bot.permissions(msg);
    let cmd;

    if (bot.commands.has(command)) {
      cmd = bot.commands.get(command);
    } else if (bot.aliases.has(command)) {
      cmd = bot.commands.get(bot.aliases.get(command));
    } else {
      return next();
    }

    const hasPermission = perms >= cmd.conf.permLevel;

    logger.message(msg);

    Log.addBreadcrumb({
      category: 'discord',
      data: {
        command: cmd.props.help.name,
        message: msg.content,
        channel: msg.channel.id,
      },
      level: 'info',
    });

    if (!hasPermission)
      return cmd.commandError(
        msg,
        `Insufficient permissions! Must be **${cmd._permLevelToWord(
          cmd.conf.permLevel
        )}** or higher`
      );

    if (cmd.conf.guildOnly) {
      return cmd.commandError(msg, `This is a guild only command.`);
    }

    try {
      let commandRun = cmd.run(msg, args);
      if (commandRun && commandRun.catch) {
        commandRun.catch((e) => {
          logger.error(msg, e);
          return cmd.commandError(msg, e);
        });
      }
    } catch (e) {
      logger.error(msg, e);
      cmd.commandError(msg, e);
    }
  }
}

module.exports = RunCommandModule;
