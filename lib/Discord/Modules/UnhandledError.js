const Module = require('../Module');

class UnhandledErrorModule extends Module {
  run(msg, args, next, middleware, error) {
    if (!error) return;
    let embed = this.textToEmbed(`Yappy, the GitLab Monitor - Unhandled Error: \`${middleware ? middleware.constructor.name : msg.cleanContent}\``, '', '#CE0814');
    if (typeof error === 'string') embed.setDescription(error);

    return msg.channel.send({ embed });
  }
}

module.exports = UnhandledErrorModule;
