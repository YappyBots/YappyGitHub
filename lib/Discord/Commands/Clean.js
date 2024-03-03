const { CommandInteraction } = require('discord.js');
const Command = require('../Command');

class CleanCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'clean',
      description:
        'Clean 10 messages (by default) sent by the bot, found in the last 50 messages in the channel.',
      usage: 'clean [number=10]',
      examples: ['clean', 'clean 14'],
    };

    this.setConf({
      permLevel: 1,
    });
  }

  getSlashCommand() {
    return super
      .getSlashCommand()
      .addIntegerOption((option) =>
        option
          .setName('count')
          .setDescription('The number of messages to clean.')
          .setMinValue(1)
      );
  }

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const messageCount = interaction.options.getInteger('count') || 10;

    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({
      limit: 50,
    });

    const msgs = messages.filter((e) => e.author.equals(this.bot.user));
    let i = 0;
    for (let [, message] of msgs) {
      if (i >= messageCount) break;
      message.delete();
      i++;
    }

    await interaction.editReply(`Done. Deleted ${i} messages`);
  }
}

module.exports = CleanCommand;
