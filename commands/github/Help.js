const HelpMessage = [
  '**Yappy, the Github Monitor**',
  'Created by @datitisev#4934 with `discord.js`',
  '',
  'Commands:',
  '  • `init <repo>` - initialize repo events on channel, administrator only',
  '  • `remove` - remove repo events on channel, administrator only',
  '',
  'Repo must have a webhook pointing to <http://discordjsrewritetrello-datitisev.rhcloud.com/> with all events desired but `watch` and `fork`, they are buggy for some reason.'
];

module.exports = (bot) => (msg, command, args) => {
  let isGuild = !!msg.guild;

  if (isGuild) {
    msg.author.sendMessage(HelpMessage).then(() => {
      return msg.reply('help has been sent to your PM');
    }).then((message) => {
      setTimeout(() => message.delete(), 8000);
    });
  } else {
    msg.channel.sendMessage(HelpMessage);
  }
}
