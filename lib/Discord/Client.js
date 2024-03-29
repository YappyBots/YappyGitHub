const Discord = require('discord.js');
const DiscordClient = Discord.Client;
const fs = require('fs');
const Log = require('../Util/Log');
const redis = require('../Util/redis');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

/**
 * @typedef {external:ClientOptions} ClientOptions
 * @property {String} owner discord bot's owner user id
 * @property {String} [name] discord bot's name
 */

/**
 * Yappy's custom Discord client
 * @extends {external:Client}
 */
class Client extends DiscordClient {
  /**
   * The main hub for interacting with the Discord API, and the starting point for any bot.
   * @param {ClientOptions}
   */
  constructor(opts = {}, ...args) {
    super(opts, ...args);

    /**
     * Discord bot's commands
     * @type {Collection}
     */
    this.commands = new Discord.Collection();

    /**
     * Discord bot's middleware
     * @type {Collection}
     */
    this.middleware = new Discord.Collection();

    /**
     * Discord bot's command aliases
     * @type {Collection}
     */
    this.aliases = new Discord.Collection();

    /**
     * Discord bot's name
     * @type {String}
     */
    this.name = opts.name || 'Unknown';

    this.config = {
      owner: opts.owner,
    };
  }

  /**
   * Load commands from directory
   * @param {String} cwd path to commands directory
   */
  loadCommands(cwd) {
    fs.readdir(cwd, (err, files) => {
      if (err) {
        this.emit('error', err);
        return this;
      }

      if (!files.length) {
        Log.info(`Command | No Commands Loaded.`);
        return this;
      }

      files.forEach((f) => {
        try {
          this.addCommand(require(`./Commands/${f}`), f);
        } catch (error) {
          this.emit('error', `Command | ${f}`, error);
          Log.error(error);
        }
      });
      return this;
    });
  }

  /**
   * Register command
   * @param {Command} Cmd
   * @param {String} file
   */
  addCommand(Cmd, file) {
    try {
      const command = new Cmd(this);
      Log.debug(`Command | Loading ${command.help.name}.`);
      if (file) command.props.help.file = file;

      this.commands.set(command.help.name, command);

      command.conf.aliases.forEach((alias) => {
        this.aliases.set(alias, command.help.name);
      });
    } catch (error) {
      this.emit('error', `Command | ${file || Cmd.name}`, error);
    }
  }

  /**
   * Load modules from directory
   * @param {String} cwd path to modules directory
   */
  loadModules(cwd) {
    fs.readdir(cwd, (err, files) => {
      if (err) {
        this.emit('error', err);
        return this;
      }

      if (!files.length) {
        Log.info(`Module | No Modules Loaded.`);
        return this;
      }

      files.forEach((f) => {
        try {
          const module = new (require(`./Modules/${f}`))(this);
          const name = module.constructor.name.replace('Module', '');

          Log.debug(`Module | Loading ${name}. 👌`);

          this.middleware.set(name, module);
        } catch (error) {
          this.emit('error', `Module | ${f}`, error);
        }
      });
      return this;
    });
  }

  /**
   * Reload command
   * @param {String} command command to reload
   * @return {Promise}
   */
  reloadCommand(command) {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(`./Commands/${command}`)];
        Log.debug(`Command | Reloading ${command} 👌`);
        let cmd = require(`./Commands/${command}`);
        let Command = new cmd(this);
        Command.props.help.file = command;
        this.commands.set(Command.help.name, Command);
        Command.conf.aliases.forEach((alias) => {
          this.aliases.set(alias, Command.help.name);
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Reload file
   * @param {String} file path of file to reload
   * @return {Promise<any>}
   */
  async reloadFile(file) {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(file)];
        let thing = require(file);
        resolve(thing);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Message event handling, uses modules (aka middleware)
   * @param {Message} msg
   * @return {Client}
   */
  async runCommand(interaction) {
    if (!interaction.isCommand()) return;

    const middleware = Array.from(this.middleware.values()).sort(
      (a, b) => b.priority - a.priority
    );
    let i = 0;

    const handleErr = (err, currentMiddleware) => {
      Log.error(err);

      return middleware[middleware.length - 1].run(
        interaction,
        next,
        currentMiddleware,
        err
      );
    };

    const next = (err) => {
      const currentMiddleware = middleware[i] || middleware[i - 1];
      const nextMiddleware = middleware[i++];
      if (err) return handleErr(err, currentMiddleware);
      if (nextMiddleware) {
        try {
          const thisMiddleware = nextMiddleware.run(interaction, next);
          if (
            thisMiddleware?.catch &&
            typeof thisMiddleware.catch === 'function'
          ) {
            thisMiddleware.catch((e) =>
              handleErr(e, nextMiddleware || currentMiddleware)
            );
          }
        } catch (e) {
          handleErr(e, nextMiddleware || currentMiddleware);
        }
      }
    };

    next();

    return this;
  }

  async runCommandMessage(msg) {
    if (msg.author?.id !== this.config.owner) return;

    if (!msg.mentions.has(this.user)) return;

    const content = this.getMsgContent(msg);
    const command = content.split(' ')[0].toLowerCase();
    const args = content.split(' ').slice(1);

    const cmd =
      this.commands.get(command) ||
      this.commands.get(this.aliases.get(command));

    if (!cmd?.conf?.msgTrigger) return;

    try {
      let commandRun = cmd.run(msg, args);
      if (commandRun && commandRun.catch) {
        commandRun.catch((e) => cmd.commandError(msg, e));
      }
    } catch (e) {
      cmd.commandError(msg, e);
    }
  }

  commandError(interaction, cmd, err) {
    this.emit('error', err);
    return interaction.reply(
      [
        `❌ An unexpected error occurred when trying to run command \`${cmd.help.name}\``,
        `\`${err}\``,
      ].join('\n'),
      { ephemeral: true }
    );
  }

  /**
   * Remove mention from message content
   * @param  {Message} message    Message
   * @return {String}        Message content without mention
   */
  getMsgContent(message) {
    const { content, mentions } = message;

    return content.replace(new RegExp(`^<@!?${this.user.id}>\\s*`), '');
  }

  permissions(interaction) {
    /* This function should resolve to an ELEVATION level which
    is then sent to the command handler for verification*/
    let permlvl = 0;

    if (
      interaction.memberPermissions &&
      interaction.memberPermissions.has(
        Discord.PermissionsBitField.Flags.Administrator
      )
    )
      permlvl = 1;
    if (this.config.owner === interaction.user.id) permlvl = 2;

    return permlvl;
  }

  generateArgs(strOrArgs = '') {
    let str = Array.isArray(strOrArgs) ? strOrArgs.join(' ') : strOrArgs;
    let y = str.match(/[^\s'']+|'([^']*)'|'([^']*)'/g);
    if (y === null) return str.split(' ');
    return y.map((e) => e.replace(/'/g, ``));
  }

  embed(title, text, color, fields) {
    let embed = {
      title,
      description: text,
      color: color ? parseInt(`0x${color}`, 16) : `0x${color}`,
      fields: [],
    };
    if (fields && !Array.isArray(fields)) {
      Object.keys(fields).forEach((fieldName) => {
        embed.fields.push({
          name: fieldName,
          value: fields[fieldName],
        });
      });
    } else if (fields && Array.isArray(fields)) {
      embed.fields = fields;
    }
    return embed;
  }

  registerCommands(env = process.env.NODE_ENV) {
    const commands = this.commands.filter((cmd) => !cmd.conf.msgTrigger);
    const globalCommands = commands.filter((cmd) => cmd.conf.permLevel !== 2);
    const ownerCommands = commands.filter((cmd) => cmd.conf.permLevel === 2);

    const isDev = env !== 'production';

    const ownerCommandsRoute = Routes.applicationGuildCommands(
      String(process.env.DISCORD_CLIENT_ID),
      process.env.DISCORD_OWNER_SERVER
    );
    const globalCommandsRoute = Routes.applicationCommands(
      String(process.env.DISCORD_CLIENT_ID)
    );

    Log.verbose(
      `Registering ${ownerCommands.size} owner commands @ ${ownerCommandsRoute}`
    );
    Log.verbose(
      `Registering ${globalCommands.size} global commands @ ${
        isDev ? ownerCommandsRoute : globalCommandsRoute
      }`
    );

    if (isDev) {
      return rest.put(ownerCommandsRoute, {
        body: [...ownerCommands, ...globalCommands].map(([, cmd]) =>
          cmd.getSlashCommand()
        ),
      });
    } else {
      return Promise.all([
        rest.put(ownerCommandsRoute, {
          body: ownerCommands.map((cmd) => cmd.getSlashCommand()),
        }),

        rest.put(globalCommandsRoute, {
          body: globalCommands.map((cmd) => cmd.getSlashCommand()),
        }),
      ]);
    }
  }

  async getApproxGuildCount() {
    const cached = await redis.get('bot', 'guildCount');

    if (cached) return cached;

    const { approximate_guild_count } = await rest.get(
      Routes.currentApplication()
    );

    // cache for 12 hours
    await redis.set('bot', 'guildCount', approximate_guild_count, 12 * 60 * 60);

    return approximate_guild_count;
  }
}

module.exports = Client;
