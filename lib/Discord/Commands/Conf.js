const capitalize = require('lodash/capitalize');
const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Guild = require('../../Models/Guild');
const EventHandler = require('../../GitHub/EventHandler');

const bools = ['no', 'yes'];
const filters = ['users', 'branches', 'events', 'repos'];

const Actions = {
  INVALID: -1,
  DISABLE: 1,
  ENABLE: 2,
  VIEW: 3,
};

class ConfCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: 'conf',
      summary: 'configure some settings for this channel/server',
      description:
        'Configure some settings for this channel or all current existing channels in this server',
      usage: 'conf [view|get|set|filter] [key] [value] ["--global"|"-g"]',
      examples: [
        'conf view',
        'conf get prefix',
        'conf set repo datitisev/DiscordBot-Yappy',
        'conf set prefix g. --global',
        'conf filter events ignore issues/opened',
        'conf filter events enable issues/update',
        'conf filter users blacklist',
        'conf filter branches allow master',
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

    const channelConf = await Channel.findOrCreate(msg.channel, [
      'repos',
      'org',
    ]);
    const serverConf = await Guild.findOrCreate(msg.guild);

    if (['view', 'get', 'set', 'filter'].includes(action)) {
      return this[`_${action}`](msg, args, channelConf, serverConf);
    }
  }

  _view(msg, args, channelConf, serverConf) {
    const { guild, channel } = msg;
    let embed = new this.embed()
      .setColor('#FB9738')
      .setAuthor(guild.name, guild.iconURL());

    if (args.includes('--global') || args.includes('-g')) {
      return channel.send(
        embed
          .addField(
            'Prefix',
            serverConf.get('prefix')
              ? `\`${serverConf.get('prefix')}\u200B\``
              : '`G! \u200B`',
            true
          )
          .addField('Repo', this.format(serverConf.get('repo')), true)
      );
    }

    return channel.send(
      embed
        .setDescription(`This is your current channel's configuration.`)
        .addField(
          'Initialized Repos',
          this.format(channelConf.getRepos()),
          true
        )
        .addField('Initialized Org', this.format(channelConf.getOrg()), true)
        .addField('Repo (repo)', this.format(channelConf.get('repo')), true)
        .addField(
          'Use Embed (useEmbed)',
          this.format(channelConf.get('useEmbed'), true),
          true
        )
        .addField(
          'Ignore Unknown Events (ignoreUnknown)',
          this.format(channelConf.get('ignoreUnknown'), true),
          true
        )
        .addField(
          `Events [${channelConf.get('eventsType')}]`,
          this.format(channelConf.get('eventsList')),
          true
        )
        .addField(
          `Users [${channelConf.get('usersType')}]`,
          this.format(channelConf.get('usersList')),
          true
        )
        .addField(
          `Branches [${channelConf.get('branchesType')}]`,
          this.format(channelConf.get('branchesList')),
          true
        )
        .addField(
          `Repositories [${channelConf.get('reposType')}]`,
          this.format(channelConf.get('reposList')),
          true
        )
    );
  }

  _get(msg, args, channelConf, serverConf) {
    const { guild, channel } = msg;
    const key = args.filter((e) => !e.includes('-'))[1];
    const conf =
      args.includes('--global') || args.includes('-g')
        ? serverConf
        : channelConf;

    let value = channelConf.get(key);

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
      .addField(key, this.format(value));

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

    if (filters.includes(key) || key.endsWith('List') || key.endsWith('Type')) {
      return this.commandError(
        'Use the `conf filter` command to modify these options'
      );
    }

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
        Log.error(err);

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

  async _filter(msg, [, obj, cmd, ...args], conf) {
    if (!filters.includes(obj)) {
      return this.commandError(
        msg,
        `Correct Usage: \`${this.bot.prefix}conf filter [users|branches|events] [whitelist|blacklist|add|remove] [item]\``,
        'Incorrect usage'
      );
    }

    const type = conf.get(`${obj}Type`);
    let list = conf.get(`${obj}List`) || [];

    // set filtering to whitelist or blacklist
    if (/^(whitelist|blacklist)$/i.test(cmd)) {
      if (type === cmd) {
        return this.commandError(
          msg,
          `The filtering mode of ${obj} is already set to ${type}`,
          'Nothing was updated'
        );
      }

      await conf.set(`${obj}Type`, cmd.toLowerCase()).save();

      return msg.channel.send({
        embed: new this.embed()
          .setColor('#84F139')
          .setDescription(
            `Successfully updated #${msg.channel.name}'s filtering mode for ${obj} to ${cmd}`
          ),
      });
    }

    const action =
      (cmd &&
        (/^(add)$/i.test(cmd)
          ? Actions.ENABLE
          : /^(remove|rm)$/i.test(cmd) && Actions.DISABLE)) ||
      Actions.INVALID;
    const item = args.join(' ').toLowerCase();

    // if add, add to whitelist/blacklist list
    if (action === Actions.ENABLE && !list.includes(item)) list.push(item);
    else if (action === Actions.DISABLE) list = list.filter((e) => e !== item);

    if (!cmd || action === Actions.INVALID) {
      // show available events for events
      if (obj === 'events' && cmd === 'list') {
        let embed = new this.embed().setTitle('List of available events');
        const events = Array.from(EventHandler.eventsList.keys()).filter(
          (e) => e !== 'Unknown'
        );

        for (let i = 0; i < events.length; i += 3) {
          embed = embed.addField(
            '\u200B',
            events
              .slice(i, i + 3)
              .map((e) => `• ${e.replace('-', '/')}`)
              .join('\n') || '\u200B',
            true
          );
        }

        return msg.channel.send(embed);
      }

      const embed = new this.embed().setTitle(
        `#${msg.channel.name}'s ${type}ed ${obj}`
      );

      if (!list || !list.length)
        embed.setDescription(`No ${type}ed ${obj} found.`);

      list.forEach((e) => embed.addField(e, '\u200B', true));

      return msg.channel.send(embed);
    }

    return conf
      .set(`${obj}List`, list)
      .save()
      .then(() => {
        const embed = new this.embed()
          .setColor('#84F139')
          .setTitle(
            `Successfully updated #${msg.channel.name}'s ${type}ed ${obj}`
          )
          .setDescription([
            `${action === Actions.ENABLE ? 'Added' : 'Removed'} \`${item}\`.`,
            '',
            list.length ? '' : `No ${obj} are ${type}ed.`,
          ]);

        list.forEach((e) => embed.addField(e, '\u200B', true));

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
