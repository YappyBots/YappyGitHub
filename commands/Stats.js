const Command = require('../lib/Structures/Command');
const Log = require('../lib/Logger').Logger;
const BotCache = require('../lib/BotCache');
const moment = require('moment');
const pack = require('../package.json');
const DiscordJS = require('discord.js');

require('moment-duration-format');

const unit = ['', 'K', 'M', 'G', 'T', 'P'];
const GetUptime = bot => {
  return moment.duration(bot.uptime).format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]');
};
const bytesToSize = (input, precision) => {
	let index = Math.floor(Math.log(input) / Math.log(1024));
	if (unit >= unit.length) return input + ' B';
	return (input / Math.pow(1024, index)).toFixed(precision) + ' ' + unit[index] + 'B';
}

class StatsCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'stats',
      description: 'Shows some stats of the bot... what else?',
      usage: 'stats'
    }

    this.setConf({
      aliases: ['info']
    });
  }

  run(msg, args) {
    let bot = this.bot;

    let MemoryUsage = bytesToSize(process.memoryUsage().rss, 3);
    let MessagesSeen = BotCache._MessagesSeen.size;
    let MessagesSent = BotCache._MessagesSent.size + 1;
    let MessagesSeenHour = BotCache.SeenMessages.size;
    let MessagesSentHour = BotCache.SentMessages.size + 1;
    let CommandsRun = BotCache.CommandsRun.size;
    let Booted = bot.booted;

    let TextChannels = bot.channels.filter(e => e.type !== 'voice').size;
    let VoiceChannels = bot.channels.filter(e => e.type === 'voice').size;

    let Dependencies = new Map();
    Dependencies.set('moment', pack.dependencies['moment'].split('^')[1]);
    Dependencies.set('mongoose', pack.dependencies['mongoose'].split('^')[1]);
    Dependencies.set('socket.io', pack.dependencies['socket.io'].split('^')[1]);
    Dependencies.set('chalk', pack.dependencies['chalk'].split('^')[1]);
    Dependencies.set('express', pack.dependencies['express'].split('^')[1]);

    let dependencies = [
      [
        `Moment v${Dependencies.get('moment')}`,
        `Mongoose v${Dependencies.get('mongoose')}`,
        `Socket.IO v${Dependencies.get('socket.io')}`
      ].join(', '),
      [
        `Chalk v${Dependencies.get('chalk')}`,
        `ExpressJS v${Dependencies.get('express')}`
      ].join(', ')
    ].join('\n' + ' '.repeat(17))

    let message = [
      `# STATISTICS`,
      `Uptime         : ${GetUptime(bot)}`,
      `Booted         : ${Booted.date} @ ${Booted.time}`,
      `Memory Usage   : ${MemoryUsage}`,
      `Messages Seen  : ${MessagesSeen}`,
      `Messages Sent  : ${MessagesSent}`,
      ``,
      `# SERVING`,
      `Guilds         : ${bot.guilds.size}`,
      `Channels       : ${bot.channels.size} (${TextChannels} text, ${VoiceChannels} voice)`,
      `Users          : ${bot.users.size}`,
      ``,
      `# BOT INFORMATION`,
      `Author(s)      : ${pack.author.replace(/<\S+[@]\S+[.]\S+>/g, '')}`,
      `Contributor(s) : ${pack.contributors || 'None'}`,
      `Discord.JS	 : v${DiscordJS.version}`,
      `Dependencies   : ${dependencies}`
    ];

    msg.channel.sendCode('LDIF', message).catch(Log.error);
  }
}

module.exports = StatsCommand;
