const Module = require('../Module');

class UnhandledErrorModule extends Module {
  run(interaction, next, middleware, error) {
    if (!error) {
      return interaction.reply('An unknown error occurred', { ephemeral: true })
    }

    let embed = this.textToEmbed(
      `Yappy, the GitHub Monitor - Unhandled Error: \`${
        middleware ? middleware.constructor.name : interaction.commandName
      }\``,
      '',
      '#CE0814'
    );
    if (typeof error === 'string') embed.setDescription(error);

    return interaction.reply({ embeds: [embed] });
  }
}

module.exports = UnhandledErrorModule;
