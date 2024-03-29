const Command = require('../Command');

class DeployCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: 'deploy',
      description: 'deploy slash commands',
    };
    this.setConf({
      permLevel: 2,
      msgTrigger: true,
    });
  }
  async run(msg, args) {
    const env = args[0] || process.env.NODE_ENV;
    const isDev = env !== 'production';

    try {
      await this.bot.registerCommands(env);
    } catch (e) {
      Log.error(e);

      return msg.channel.send('❌ Failed to deploy commands');
    }

    return msg.channel.send({
      embeds: [
        new this.embed().setTitle(
          `Deployed ${isDev ? '*SERVER*' : '*GLOBAL*'} Commands`
        ),
      ],
    });
  }
}

module.exports = DeployCommand;
