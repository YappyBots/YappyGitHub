const moment = require('moment');
const DiscordJS = require('discord.js');
const Command = require('../Command');
const pack = require('../../../package.json');

require('moment-duration-format');

const unit = ['', 'K', 'M', 'G', 'T', 'P'];
const GetUptime = bot => moment.duration(bot.uptime).format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]');
const bytesToSize = (input, precision) => {
  let index = Math.floor(Math.log(input) / Math.log(1024));
  if (unit >= unit.length) return `${input} B`;
  let msg = `${(input / Math.pow(1024, index)).toFixed(precision)} ${unit[index]}B`;
  return msg;
};

class StatsCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: 'stats',
      description: 'Shows some stats of the bot... what else?',
      usage: 'stats',
    };
    this.setConf({
      aliases: ['info'],
    });
  }
  run(msg) {
    let bot = this.bot;
    let MemoryUsage = bytesToSize(process.memoryUsage().heapUsed, 3);
    let Booted = bot.booted;
    let Channels = bot.channels;
    let TextChannels = Channels.filter(e => e.type !== 'voice').size;
    let VoiceChannels = Channels.filter(e => e.type === 'voice').size;

    const embed = {
      color: 0xFD9827,
      author: {
        name: bot.user.username,
        icon_url: bot.user.avatarURL,
      },
      description: '**Yappy Stats**',
      fields: [
        {
          name: '❯ Uptime',
          value: GetUptime(bot),
          inline: true,
        },
        {
          name: '❯ Booted',
          value: `${Booted.date} ${Booted.time}`,
          inline: true,
        },
        {
          name: '❯ Memory Usage',
          value: MemoryUsage,
          inline: true,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: false,
        },
        {
          name: '❯ Guilds',
          value: bot.guilds.size,
          inline: true,
        },
        {
          name: '❯ Channels',
          value: `${Channels.size} (${TextChannels} text, ${VoiceChannels} voice)`,
          inline: true,
        },
        {
          name: '❯ Users',
          value: bot.users.size,
          inline: true,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: false,
        },
        {
          name: '❯ Author',
          value: pack.author.replace(/<\S+[@]\S+[.]\S+>/g, ''),
          inline: true,
        },
        {
          name: '❯ Version',
          value: pack.version,
          inline: true,
        },
        {
          name: '❯ DiscordJS',
          value: `v${DiscordJS.version}`,
          inline: true,
        },
      ],
    };

    // return msg.channel.sendCode('LDIF', message);
    return msg.channel.send({ embed });
  }
}

module.exports = StatsCommand;
