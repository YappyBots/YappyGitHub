const Command = require('../lib/Structures/Command');
const Log = require('../lib/Logger').Logger;
const moment = require('moment');
const pack = require('../package.json');
const DiscordJS = require('discord.js');

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
    let TextChannels = bot.channels.filter(e => e.type !== 'voice').size;
    let VoiceChannels = bot.channels.filter(e => e.type === 'voice').size;
    let Dependencies = new Map();
    Dependencies.set('moment', pack.dependencies.moment.split('^')[1]);
    let dependencies = [
      `Moment v${Dependencies.get('moment')}`,
    ].join(`\n${' '.repeat(17)}`);

    let message = [
      `# STATISTICS`,
      `Uptime         : ${GetUptime(bot)}`,
      `Booted         : ${Booted.date} @ ${Booted.time}`,
      `Memory Usage   : ${MemoryUsage}`,
      ``,
      `# SERVING`,
      `Guilds         : ${bot.guilds.size}`,
      `Channels       : ${bot.channels.size} (${TextChannels} text, ${VoiceChannels} voice)`,
      `Users          : ${bot.users.size}`,
      ``,
      `# BOT INFORMATION`,
      `Author(s)      : ${pack.author.replace(/<\S+[@]\S+[.]\S+>/g, '')}`,
      `Contributor(s) : ${pack.contributors ? pack.contributors.join(', ').replace(/<\S+[@]\S+[.]\S+>/g, '') : 'None'}`,
      `Discord.JS	 : v${DiscordJS.version}`,
      `Dependencies   : ${dependencies}`,
    ];

    msg.channel.sendCode('LDIF', message).catch(Log.error);
  }
}

module.exports = StatsCommand;
