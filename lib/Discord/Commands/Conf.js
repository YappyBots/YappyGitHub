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
        'conf set prefix g. --global'
      ],
    };
  }
  run(msg, args) {
    let guild = msg.guild;
    let channel = msg.channel;
    let action = args[0] || 'view';
    let serverConfs = guild.channels.map(e => ChannelConfig.FindByChannel(e.id));
    let channelConf = serverConfs.filter(e => e.channelId === msg.channel.id)[0];

    if (action === 'view') {
      let embed = new Discord.RichEmbed()
      .setColor('#FB9738')
      .setAuthor(`${guild.name} #${channel.name}`, guild.iconURL)
      .setDescription([
        `This is your current channel's configuration.`,
      ].join('\n'))
      .addField('prefix', channelConf.prefix ? `\`${channelConf.prefix}\u200B\`` : '`G! \u200B`', true)
      .addField('repo', channelConf.repos.map(e => `\`${e}\``).join(', '), true);
      return msg.channel.sendEmbed(embed);
    }
  }
}

module.exports = ConfCommand;
