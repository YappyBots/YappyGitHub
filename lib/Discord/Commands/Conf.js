const capitalize = require('lodash/capitalize');
const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Guild = require('../../Models/Guild');

const bools = ['no', 'yes'];

class ConfCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: 'conf',
      summary: 'configure some settings for this channel/server',
      description:
        'Configure some settings for this channel or all current existing channels in this server',
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

  async run(msg, args) {
    const action = (
      args.filter((e) => !e.includes('-'))[0] || 'view'
    ).toLowerCase();

    const channelConf = await Channel.find(msg.channel.id, [
      'guild',
      'repos',
      'org',
    ]);
    const serverConf = channelConf.related('guild');

    if (['view', 'get', 'set'].includes(action))
      this[`_${action}`](msg, args, channelConf, serverConf);
  }

  _view(msg, args, channelConf, serverConf) {
    const { guild, channel } = msg;
    if (args.includes('--global') || args.includes('-g')) {
      let embed = new this.embed()
        .setColor('#FB9738')
        .setAuthor(guild.name, guild.iconURL())
        .setDescription(`This is your current server's configuration.`)
        .addField(
          'Prefix',
          serverConf.get('prefix')
            ? `\`${serverConf.get('prefix')}\u200B\``
            : '`GB! \u200B`',
          true
        );
      return msg.channel.send({ embed });
    } else {
      let embed = new this.embed()
        .setColor('#FB9738')
        .setAuthor(`${guild.name} #${channel.name}`, guild.iconURL())
        .setDescription(`This is your current channel's configuration.`)
        .addField('Repos', this.formatArrayOutput(channelConf.getRepos()), true)
        .addField('Organization', this.format(channelConf.getOrg()), true)
        .addField('Repo (repo)', this.format(channelConf.get('repo')), true)
        .addField(
          'Use Embed (useEmbed)',
          this.format(channelConf.get('useEmbed'), true),
          true
        )
        .addField(
          'Disabled Events (disabledEvents)',
          this.formatArrayOutput(channelConf.get('disabledEvents')),
          true
        )
        .addField(
          'Ignored Users (ignoredUsers)',
          this.formatArrayOutput(channelConf.get('ignoredUsers')),
          true
        )
        .addField(
          'Ignored Branches (ignoredBranches)',
          this.formatArrayOutput(channelConf.get('ignoredBranches')),
          true
        )
        .addField(
          'Ignored Repos (ignoredRepos)',
          this.formatArrayOutput(channelConf.get('ignoredRepos')),
          true
        );
      return msg.channel.send({ embed });
    }
  }

  _get(msg, args, channelConf, serverConf) {
    const { guild, channel } = msg;
    const key = args.filter((e) => !e.includes('-'))[1];
    const conf =
      args.includes('--global') || args.includes('-g')
        ? serverConf
        : channelConf;

    let value = channelConf.get(key);

    if (key === 'repos') value = channelConf.getRepos();

    let embed = new this.embed()
      .setColor('#FB9738')
      .setAuthor(
        conf === channelConf ? `${guild.name} #${channel.name}` : guild.name,
        guild.iconURL()
      )
      .setDescription(
        `This is your current ${
          conf === channelConf ? 'channel' : 'server'
        }'s configuration.`
      )
      .addField(
        key,
        `\`${
          Array.isArray(value)
            ? this.formatArrayOutput(value).replace(/(^\`|\`$)/g, '')
            : value
        }\u200B\``
      );

    return msg.channel.send({ embed });
  }

  _set(msg, a, channelConf, serverConf) {
    const { guild, channel } = msg;
    const args = this.generateArgs(a);
    const key = args.filter((e) => !e.includes('-'))[1];
    const conf =
      args.includes('--global') || args.includes('-g')
        ? serverConf
        : channelConf;

    const validKeys = (args.includes('--global') || args.includes('-g')
      ? Guild
      : Channel
    ).validKeys;

    let value = args
      .filter((e) => !e.includes('-g'))
      .slice(2)
      .join(' ');

    if (key !== 'prefix' && value.includes(', ')) value = value.split(', ');

    if (typeof value === 'string' && bools.includes(value.toLowerCase()))
      value = bools.indexOf(value.toLowerCase());

    if (
      !Array.isArray(value) &&
      (key === 'ignoredUsers' ||
        key === 'ignoredBranches' ||
        key === 'ignoredRepos' ||
        key === 'disabledEvents')
    )
      value = value ? [value] : [];

    const embedData = {
      author:
        conf === channelConf ? `${guild.name} #${channel.name}` : guild.name,
      confName: conf === channelConf ? 'channel' : 'server',
    };

    if (!validKeys.includes(key)) {
      const embed = new this.embed()
        .setColor('#CE0814')
        .setAuthor(embedData.author, guild.iconURL())
        .setDescription(
          [
            `An error occured when trying to set ${embedData.confName}'s configuration`,
            '',
            `The key \`${key}\` is invalid.`,
            `Valid configuration keys: \`${validKeys.join('`, `')}\``,
          ].join('\n')
        );
      return msg.channel.send({ embed });
    }

    return conf
      .set(key, value)
      .save()
      .then(() => {
        const embed = new this.embed()
          .setColor('#84F139')
          .setAuthor(embedData.author, guild.iconURL())
          .setDescription(
            `Successfully updated ${embedData.confName}'s configuration`
          )
          .addField(
            key,
            this.format(value, conf.casts && conf.casts[key] === 'boolean')
          );
        return msg.channel.send({ embed });
      })
      .catch((err) => {
        const embed = new this.embed()
          .setColor('#CE0814')
          .setAuthor(embedData.author, guild.iconURL())
          .setDescription(
            [
              `An error occured when trying to update ${embedData.confName}'s configuration`,
              '```js',
              err,
              '```',
            ].join('\n')
          )
          .addField(key, value);
        return msg.channel.send({ embed });
      });
  }

  format(val, isBoolean) {
    if (isBoolean) {
      return capitalize(bools[val] || bools[Number(String(val) === 'true')]);
    }

    return (
      (Array.isArray(val) && this.formatArrayOutput(val)) ||
      (val && `\`${val}\u200B\``) ||
      'None'
    );
  }

  formatArrayOutput(arr) {
    return arr && arr.length ? arr.map((e) => `\`${e}\``).join(', ') : 'None';
  }
}

module.exports = ConfCommand;
