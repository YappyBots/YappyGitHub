const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const ServerConfig = require('../../Models/ServerConfig');

class ConfCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: 'conf',
      summary: 'configure some settings for this channel/server',
      description: 'Configure some settings for this channel or all current existing channels in this server',
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
    const action = args.filter(e => !e.includes('-'))[0] || 'view';
    const serverConf = ServerConfig.get(msg.guild.id);
    const channelConf = ChannelConfig.findByChannel(msg.channel.id);

    if (action === 'view') return this._view(msg, args, channelConf, serverConf);
    if (action === 'get') return this._get(msg, args, channelConf, serverConf);
    if (action === 'set') return this._set(msg, args, channelConf, serverConf);
  }

  _view(msg, args, channelConf, serverConf) {
    const { guild, channel } = msg;
    if (args.includes('--global') || args.includes('-g')) {
      let embed = new this.embed()
      .setColor('#FB9738')
      .setAuthor(guild.name, guild.iconURL)
      .setDescription(`This is your current server's configuration.`)
      .addField('Prefix', serverConf.prefix ? `\`${serverConf.prefix}\u200B\`` : '`GL! \u200B`', true);
      return msg.channel.send({ embed });
    } else {
      let embed = new this.embed()
      .setColor('#FB9738')
      .setAuthor(`${guild.name} #${channel.name}`, guild.iconURL)
      .setDescription(`This is your current channel's configuration.`)
      .addField('Repos (repos)', channelConf.repos[0] ? channelConf.repos.map(e => `\`${e}\``).join(', ') : 'None', true)
      .addField('Repo (repo)', channelConf.repo ? `\`${channelConf.repo}\u200B\`` : 'None', true)
      .addField('Use Embed (embed)', channelConf.embed ? `Yes` : 'No', true)
      .addField('Disabled Events (disabledEvents)', channelConf.disabledEvents && channelConf.disabledEvents.length ? channelConf.disabledEvents.map(e => `\`${e}\``).join(', ') : 'None', true)
      .addField('Ignored Users (ignoredUsers)', channelConf.ignoredUsers && !!channelConf.ignoredUsers.length ? channelConf.ignoredUsers.map(e => `\`${e}\``).join(', ') : 'None', true)
      .addField('Ignored Branches (ignoredBranches)', channelConf.ignoredBranches && !!channelConf.ignoredBranches.length ? channelConf.ignoredBranches.map(e => `\`${e}\``).join(', ') : 'None', true);
      return msg.channel.send({ embed });
    }
  }

  _get(msg, args, channelConf, serverConf) {
    const { guild, channel } = msg;
    const key = args.filter(e => !e.includes('-'))[1];
    const conf = (args.includes('--global') || args.includes('-g')) ? serverConf : channelConf;

    let embed = new this.embed()
    .setColor('#FB9738')
    .setAuthor(conf === channelConf ? `${guild.name} #${channel.name}` : guild.name, guild.iconURL)
    .setDescription(`This is your current ${conf === channelConf ? 'channel' : 'server'}'s configuration.`)
    .addField(key, `\`${Array.isArray(channelConf[key]) ? (conf[key][0] ? conf[key].join('`, `') : 'None') : conf[key]}\u200B\``);
    return msg.channel.send({ embed });
  }

  _set(msg, a, channelConf, serverConf) {
    const { guild, channel } = msg;
    const args = this.generateArgs(a);
    const key = args.filter(e => !e.includes('-'))[1];
    const conf = (args.includes('--global') || args.includes('-g')) ? serverConf : channelConf;
    const validKeys = ((args.includes('--global') || args.includes('-g')) ? ServerConfig : ChannelConfig).validKeys;
    let value = args.filter(e => !e.includes('-g')).slice(2, 20).join(' ');
    if (key !== 'prefix' && value.includes(', ')) value = value.split(', ');
    if (!Array.isArray(value) && (key === 'ignoredUsers' || key === 'ignoredBranches' || key === 'disabledEvents')) value = value ? [value] : [];
    const embedData = {
      author: conf === channelConf ? `${guild.name} #${channel.name}` : guild.name,
      confName: conf === channelConf ? 'channel' : 'server',
    };
    if (!validKeys.includes(key)) {
      const embed = new this.embed()
      .setColor('#CE0814')
      .setAuthor(embedData.author, guild.iconURL)
      .setDescription([
        `An error occured when trying to set ${embedData.confName}'s configuration`,
        '',
        `The key \`${key}\` is invalid.`,
        `Valid configuration keys: \`${validKeys.join('`, `')}\``,
      ].join('\n'));
      return msg.channel.send({ embed });
    }

    return conf.set(key, value).then(() => {
      const embed = new this.embed()
      .setColor('#84F139')
      .setAuthor(embedData.author, guild.iconURL)
      .setDescription(`Successfully updated ${embedData.confName}'s configuration`)
      .addField(key, `\`${Array.isArray(value) ? value.join('`, `') : value}\u200B\``);
      return msg.channel.send({ embed });
    }).catch(err => {
      const embed = new this.embed()
      .setColor('#CE0814')
      .setAuthor(embedData.author, guild.iconURL)
      .setDescription([
        `An error occured when trying to update ${embedData.confName}'s configuration`,
        '```js',
        err,
        '```',
      ].join('\n'))
      .addField(key, value);
      return msg.channel.send({ embed });
    });
  }
}

module.exports = ConfCommand;
