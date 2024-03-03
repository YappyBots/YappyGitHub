const Module = require('../Module');

class UnhandledErrorModule extends Module {
  run(interaction, next, middleware, error) {
    const func =
      interaction.deferred || interaction.replied ? 'editReply' : 'reply';

    if (!error) {
      return interaction[func]('An unknown error occurred', {
        ephemeral: true,
      });
    }

    let embed = this.textToEmbed(
      `Yappy, the GitHub Monitor - Unhandled Error: \`${
        middleware ? middleware.constructor.name : interaction.commandName
      }\``,
      '',
      '#CE0814'
    );
    if (typeof error === 'string') embed.setDescription(error);

    return interaction[func]({ embeds: [embed] }, { ephemeral: true });
  }
}

module.exports = UnhandledErrorModule;
