const capitalize = require('lodash/capitalize');
const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Guild = require('../../Models/Guild');
const EventHandler = require('../../GitHub/EventHandler');

const bools = ['no', 'yes'];
const filters = ['users', 'branches', 'events', 'repos'];

const Actions = {
  INVALID: -1,
  REMOVE: 1,
  ADD: 2,
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
        'conf set repo YappyBots/YappyGitHub',
        'conf filter events add issues/opened',
        'conf filter events remove issues/update',
        'conf filter users blacklist',
        'conf filter branches add master',
      ],
    };
    this.setConf({
      guildOnly: true,
      permLevel: 1,
      ephemeral: true,
    });
  }

  getSlashCommand() {
    return super
      .getSlashCommand()
      .addSubcommand((subcommand) =>
        subcommand
          .setName('filter')
          .setDescription(
            'Configure filtering for specific users, branches, or events'
          )
          .addStringOption((option) =>
            option
              .setName('type')
              .setDescription('Choose what object to configuring filtering for')
              .addChoices(
                ...['events', 'users', 'branches'].map((v) => ({
                  name: v,
                  value: v,
                }))
              )
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName('action')
              .setDescription('Action to perform')
              .addChoices(
                { name: 'Turn into Blacklist', value: 'blacklist' },
                { name: 'Turn into Whitelist', value: 'whitelist' },
                { name: 'Add Item', value: 'add' },
                { name: 'Remove Item', value: 'remove' },
                { name: 'View Options (Events Only)', value: 'list' }
              )
          )
          .addStringOption(
            (option) =>
              option
                .setName('item')
                .setDescription('Item to add/remove from the list')
            // .setAutocomplete(true)
          )
      )
      .addSubcommandGroup((subcommand) =>
        subcommand
          .setName('option')
          .setDescription('View or modify the existing configuration')
          .addSubcommand((subcommand) =>
            subcommand
              .setName('channel')
              .setDescription('View/modify the configuration for this channel')
              .addStringOption((option) =>
                option
                  .setName('item')
                  .setDescription('Config item to view/change')
                  .addChoices(
                    ...Channel.validKeys.map((v) => ({ name: v, value: v }))
                  )
              )
              .addStringOption((option) =>
                option.setName('value').setDescription('New value for config')
              )
          )
          .addSubcommand((subcommand) =>
            subcommand
              .setName('guild')
              .setDescription('View/modify the configuration for this server')
              .addStringOption((option) =>
                option
                  .setName('item')
                  .setDescription('Config item to view/change')
                  .addChoices(
                    ...Guild.validKeys.map((v) => ({ name: v, value: v }))
                  )
              )
              .addStringOption((option) =>
                option.setName('value').setDescription('New value for config')
              )
          )
      );
  }

  async run(interaction) {
    const subcommand = interaction.options.getSubcommand(true);
    const subcommandGroup = interaction.options.getSubcommandGroup(false);

    await interaction.deferReply({ ephemeral: true });

    const channelConf = await Channel.findOrCreate(interaction.channel, [
      'connections',
    ]);
    const serverConf = await Guild.findOrCreate(interaction.guild);

    if (subcommandGroup === 'option') {
      return this._option(interaction, channelConf, serverConf);
    } else if (subcommand === 'filter') {
      return this._filter(interaction, channelConf);
    }
  }

  _option(interaction, channelConf, serverConf) {
    const subcommand = interaction.options.getSubcommand(true);
    const key = interaction.options.getString('item');
    const value = interaction.options.getString('value');

    const conf = subcommand === 'guild' ? serverConf : channelConf;

    if (!key) return this._view(interaction, subcommand, conf);
    if (!value) return this._get(interaction, key, subcommand, conf);
    return this._set(interaction, key, value, subcommand, conf);
  }

  _view(interaction, type, conf) {
    const { guild, channel } = interaction;
    let embed = new this.embed()
      .setColor('#FB9738')
      .setAuthor(guild.name, guild.iconURL());

    if (type === 'guild') {
      embed = embed.addField('Repo', this.format(conf.get('repo')), true);
    } else {
      embed = embed
        .setDescription(`This is your current channel's configuration.`)
        .addField('GitHub', this.format(conf.getConnections()), true)
        .addField('Repo (repo)', this.format(conf.get('repo')), true)
        .addField(
          'Use Embed (useEmbed)',
          this.format(conf.get('useEmbed'), true),
          true
        )
        .addField(
          'Ignore Unknown Events (ignoreUnknown)',
          this.format(conf.get('ignoreUnknown'), true),
          true
        )
        .addField(
          `Events [${conf.get('eventsType')}]`,
          this.format(conf.get('eventsList')),
          true
        )
        .addField(
          `Users [${conf.get('usersType')}]`,
          this.format(conf.get('usersList')),
          true
        )
        .addField(
          `Branches [${conf.get('branchesType')}]`,
          this.format(conf.get('branchesList')),
          true
        )
        .addField(
          `Repositories [${conf.get('reposType')}]`,
          this.format(conf.get('reposList')),
          true
        );
    }

    return interaction.editReply({ embeds: [embed], ephemeral: true });
  }

  _get(interaction, key, type, conf) {
    const { guild, channel } = interaction;
    const value = conf.get(key);

    let embed = new this.embed()
      .setColor('#FB9738')
      .setAuthor({
        name:
          type === 'channel' ? `${guild.name} #${channel.name}` : guild.name,
        iconURL: guild.iconURL(),
      })
      .setDescription(
        `This is your current ${
          type === 'channel' ? 'channel' : 'server'
        }'s configuration.`
      )
      .addField(key, this.format(value));

    return interaction.editReply({ embeds: [embed], ephemeral: true });
  }

  _set(interaction, key, value, type, conf) {
    const { guild, channel } = interaction;
    const validKeys = conf.constructor.validKeys;
    const arrRegex = /,\s*/;

    if (arrRegex.test(value)) value = value.split(arrRegex);

    if (typeof value === 'string' && bools.includes(value.toLowerCase()))
      value = bools.indexOf(value.toLowerCase());

    if (filters.includes(key) || key.endsWith('List') || key.endsWith('Type')) {
      return this.commandError(
        'Use the `conf filter` command to modify these options'
      );
    }

    const embedData = {
      author:
        type === 'channel' ? `${guild.name} #${channel.name}` : guild.name,
      confName: type === 'channel' ? 'channel' : 'server',
    };

    if (!validKeys.includes(key)) {
      const embed = new this.embed()
        .setColor('#CE0814')
        .setAuthor({
          name:
            type === 'channel' ? `${guild.name} #${channel.name}` : guild.name,
          iconURL: guild.iconURL(),
        })
        .setDescription(
          [
            `An error occured when trying to set ${embedData.confName}'s configuration`,
            '',
            `The key \`${key}\` is invalid.`,
            `Valid configuration keys: \`${validKeys.join('`, `')}\``,
          ].join('\n')
        );
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    return conf
      .set(key, value)
      .save()
      .then(() => {
        const embed = new this.embed()
          .setColor('#84F139')
          .setAuthor({
            name:
              type === 'channel'
                ? `${guild.name} #${channel.name}`
                : guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `Successfully updated ${embedData.confName}'s configuration`
          )
          .addField(
            key,
            this.format(value, conf.casts && conf.casts[key] === 'boolean')
          );

        return interaction.editReply({ embeds: [embed] });
      })
      .catch((err) => {
        Log.error(err);

        const embed = new this.embed()
          .setColor('#CE0814')
          .setAuthor({
            name:
              type === 'channel'
                ? `${guild.name} #${channel.name}`
                : guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            [
              `An error occured when trying to update ${embedData.confName}'s configuration`,
              '```js',
              err,
              '```',
            ].join('\n')
          )
          .addField(key, value);

        return interaction.editReply({ embeds: [embed] });
      });
  }

  async _filter(interaction, conf) {
    const obj = interaction.options.getString('type', true);
    const actionOpt = interaction.options.getString('action');
    const item = interaction.options.getString('item');

    const type = conf.get(`${obj}Type`);
    let list = conf.get(`${obj}List`) || [];

    // set filtering to whitelist or blacklist
    if (/^(whitelist|blacklist)$/i.test(actionOpt)) {
      if (type === actionOpt) {
        return this.commandError(
          interaction,
          `The filtering mode of ${obj} is already set to ${type}`,
          'Nothing was updated'
        );
      }

      await conf.set(`${obj}Type`, actionOpt.toLowerCase()).save();

      const embed = new this.embed()
        .setColor('#84F139')
        .setDescription(
          `Successfully updated #${interaction.channel.name}'s filtering mode for ${obj} to ${actionOpt}`
        );

      return interaction.editReply({ embeds: [embed] });
    }

    const action = Actions[actionOpt?.toUpperCase()] || Actions.INVALID;

    if (!action || action === Actions.INVALID) {
      // show available events for events
      if (obj === 'events' && actionOpt === 'list') {
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

        return interaction.editReply({ embeds: [embed] });
      }

      const embed = new this.embed().setTitle(
        `#${interaction.channel.name}'s ${type}ed ${obj}`
      );

      if (!list || !list.length)
        embed.setDescription(`No ${type}ed ${obj} found.`);

      list.forEach((e) => embed.addField(e, '\u200B', true));

      return interaction.editReply({ embeds: [embed] });
    }

    // if add, add to whitelist/blacklist list
    if (!item)
      return this.commandError(
        interaction,
        'Please provide the item when adding/removing from the list.'
      );

    if (action === Actions.ADD && !list.includes(item)) list.push(item);
    else if (action === Actions.REMOVE) list = list.filter((e) => e !== item);

    return conf
      .set(`${obj}List`, list)
      .save()
      .then(() => {
        const embed = new this.embed()
          .setColor('#84F139')
          .setTitle(
            `Successfully updated #${interaction.channel.name}'s ${type}ed ${obj}`
          )
          .setDescription(
            [
              `${action === Actions.ADD ? 'Added' : 'Removed'} \`${item}\`.`,
              '',
              list.length ? '' : `No ${obj} are ${type}ed.`,
            ].join('\n')
          );

        list.forEach((e) => embed.addField(e, '\u200B', true));

        return interaction.editReply({ embeds: [embed] });
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
