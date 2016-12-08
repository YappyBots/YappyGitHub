const Command = require('../lib/Structures/Command');
const ServerConf = require('../lib/ServerConf');
const Log = require('../lib/Logger').Logger;
const Util = require('../lib/Util');
const Owner = '175008284263186437';

class ConfCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'conf',
      description: 'configure some settings for this server',
      usage: 'conf [view/get/set] [key] [value]',
      examples: [
        'conf view',
        'conf get prefix',
        'conf set repo datitisev/DiscordBot-Yappy',
        'conf set prefix g.'
      ]
    };

    this.setConf({
      permLevel: 1,
      guildOnly: true,
      aliases: ['config']
    });
  }

  run(msg, args) {
    let action = args[0] || 'view';
    let conf = ServerConf.GetGuild(msg.guild);
    args = this.generateArgs(args);

    if (action === 'view') {
      let message = [
        '```xl',
        `${msg.guild.name.toUpperCase()}'s Configuration`,
        `This is your current server's configuration.`,
        `Name: ${msg.guild.name}`,
        `Owner: ${msg.guild.owner.user.username}`,
        ``,
        `${Util.Pad('prefix', 10)}: '${conf.prefix}'`,
        `${Util.Pad('repo', 10)}: ${conf.repo || 'None'}`,
        '```'
      ];
      msg.channel.sendMessage(message);
    } else if (action === 'set') {
      let key = args[1];
      let value = args.slice(2, 3).join(' ');
      
      Log.debug(`Args: [${args.join(', ')}]. Key: ${key}. Value: ${value}`);

      conf.set(key, value).then(success => {
        msg.channel.sendMessage(success);
      }).catch(error => {
        msg.channel.sendMessage(error);
      });
    } else if (action === 'get') {
      let key = args[1];

      msg.reply(`Configuration key \`${key}\` currently set to \`${conf[key]}\``);
    }
  }
  
  generateArgs(strOrArgs = '') {
    let str = Array.isArray(strOrArgs) ? strOrArgs.join(' ') : strOrArgs;
    let y = str.match(/[^\s'']+|'([^']*)'|'([^']*)'/g);
    if (y === null) return str.split(' ');
    return y.map(e => e.replace(/'/g, ``));
  }
}

module.exports = ConfCommand;
