const Log = require('../lib/Logger').Logger;

const Prefix = 'T!';

const Help = msg => {

  let message = [
    '**DiscordJS Rewrite Trello**',
    'A bot that sends new activity on board to <#219479229979426816>',
    '',
    `Prefix: \`${Prefix}\` or <@!219218963647823872>`,
    '',
    'Commands:',
    '  • \`cards\` : shows a list of all cards',
    '  • \`cards search <query>\` : returns cards matching the query provided and their short link',
    '  • \`members\` : shows a list of all members in the board',
    '  • \`members search <query>\` : returns members matching the query provided and their profile link',
    '  • \`clean\` : cleans the bot\'s messages',
    '  • \`help\` : sends you this help :)',
  ];

  msg.author.sendMessage(message.join('\n')).catch(Log.error);

  if (msg.guild) {
    msg.channel.sendMessage(`<@!${msg.author.id}>, help has been sent to your DM!`).then(message => {
      setTimeout(() => {
        message.delete();
      }, 8000);
    })
  }

}

module.exports = bot => Help;
