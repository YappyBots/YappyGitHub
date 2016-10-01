const HelpMessage = [
  '**Yappy, the Github Monitor**',
  'Created by @datitisev#4934 with `discord.js`',
  '',
  '__**Util**__:',
  '  • `help` - a help command... yeah :P',
  '  • `invite` - how to invite the bot and set up github events!',
  '  • `clean` - cleans the bot\'s messages found in the last 100 messages',
  '  • `ping` - uh... ping? pong!',
  '  • `stats` - shows the stats of the bot... what else?',
  '',
  '__**Github**__:',
  '  • `issues search <query>` - search issues by any field in the global repo',
  '  • `issue <number>` - gives info about that specific issue in the global repo',
  '  • `pr search <query>` - search pull requests by any field in the global repo',
  '  • `pr <number>` - gives info about that specific pr in the global repo',
  '  • `release <query>` - gives info about a release that matches that query in its tag in the global repo',
  '',
  '__**Admin**__:',
  '  • `conf [view]` - views the server\'s config',
  '  • `conf get [key]` - gets a specific config key in the server\'s config',
  '  • `conf set <key> [value]` - sets the key to the value, `repo`\'s value may be none to disable',
  '  • `init <repo>` - initialize repo events on channel',
  '  • `remove` - remove repo events on channel',
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
