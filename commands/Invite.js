const Command = require('../lib/Structures/Command');

const message = [
  'To invite Yappy to your server: https://discordapp.com/oauth2/authorize?client_id=219218963647823872&scope=bot&permissions=67439616',
  '',
  '__Instructions__:',
  '  1. Create webhook to https://www.yappybots.ga',
  '    - Select any events you want to get updates for!',
  '  2. Run `G! init user/repo` in the channel where you want to get the events',
  '',
  '__Official Server__',
  '**<http://discord.gg/HHqndMG>**'
];

class InviteCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'invite',
      description: 'invite yappy to your server and some instructions',
      usage: 'invite'
    }
  }

  run(msg, args) {
    msg.channel.sendMessage(message);
  }
}

module.exports = InviteCommand;
