const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const Discord = require('discord.js');

class ConfCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: 'conf',
      description: 'configure some settings for this server/channel',
      usage: 'conf [view/get/set] [key] [value] ["--global"|"-g"]',
      examples: [
        'conf view',
        'conf get prefix',
        'conf set repo datitisev/DiscordBot-Yappy',
        'conf set prefix g. --global',
      ],
    };
    this.setConf({
      permLevel: 1,
    });
  }
  run(msg, args) {
    let guild = msg.guild;
    let action = args[0] || 'view';
    let serverConfs = guild.channels.filter(e => e.type === 'text').map(e => ChannelConfig.FindByChannel(e.id));
    let channelConf = serverConfs.filter(e => e.channelId === msg.channel.id)[0];

    if (action === 'view') return this._view(msg, channelConf);
    if (action === 'get') return this._get(msg, args, channelConf);
    if (action === 'set') return this._set(msg, args);
  }

  _view(msg, channelConf) {
    let { guild, channel } = msg;
    let embed = new Discord.RichEmbed()
    .setColor('#FB9738')
    .setAuthor(`${guild.name} #${channel.name}`, guild.iconURL)
    .setDescription(`This is your current channel's configuration.`)
    .addField('Prefix', channelConf.prefix ? `\`${channelConf.prefix}\u200B\`` : '`G! \u200B`', true)
    .addField('Repos', channelConf.repos[0] ? channelConf.repos.map(e => `\`${e}\``).join(', ') : 'None', true);
    return msg.channel.sendEmbed(embed);
  }

  _get(msg, a, channelConf) {
    let { guild, channel } = msg;
    let args = this.generateArgs(a);
    let key = args[1];

    let embed = new Discord.RichEmbed()
    .setColor('#FB9738')
    .setAuthor(`${guild.name} #${channel.name}`, guild.iconURL)
    .setDescription(`This is your current channel's configuration.`)
    .addField(key, `\`${Array.isArray(channelConf[key]) ? (channelConf[key][0] ? channelConf[key].join(', ') : 'None') : channelConf[key]}\u200B\``);
    return msg.channel.sendEmbed(embed);
  }
}

module.exports = ConfCommand;
