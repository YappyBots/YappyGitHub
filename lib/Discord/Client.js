const Discord = require('discord.js');
const DiscordClient = Discord.Client;
const WebcordUser = require('Webcord').User;
const fs = require('fs');
const Log = require('../Util/Log');

class Client extends DiscordClient {

  constructor(opts = {}, ...args) {
    super(opts, ...args);

    this.commands = new Discord.Collection();
    this.aliases = new Discord.Collection();

    this.prefix = opts.prefix || '';
    this.name = opts.name || 'Unknown';
    this.config = {
      owner: '175008284263186437',
    };
  }

  login(...args) {
    this._webcordUser = new WebcordUser(args[0], true);
    return super.login(...args);
  }

  loadCommands(cwd) {
    fs.readdir(cwd, (err, files) => {
      if (err) {
        this.emit('error', err);
        return this;
      }

      if (!files.length) {
        Log.info(`No Commands Loaded.`);
        return this;
      }

      files.forEach(f => {
        try {
          let Command = require(`./Commands/${f}`);

          Command = new Command(this);
          Log.info(`=> Command: Loading ${Command.help.name}. 👌`);
          Command.props.help.file = f;

          this.commands.set(Command.help.name, Command);

          Command.conf.aliases.forEach(alias => {
            this.aliases.set(alias, Command.help.name);
          });
        } catch (error) {
          this.emit('error', `Command ${f}  | `, error);
        }
      });
      return this;
    });
  }

  reloadCommand(command) {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(`./Commands/${command}`)];
        Log.info(`=> Command: Reloading ${command} 👌`);
        let cmd = require(`./Commands/${command}`);
        let Command = new cmd(this);
        Command.props.help.file = command;
        this.commands.set(Command.help.name, Command);
        Command.conf.aliases.forEach(alias => {
          this.aliases.set(alias, Command.help.name);
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

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

  runCommand(msg) {
    if (!msg.content.startsWith(this.prefix)) return false;

    let content = msg.content.replace(this.prefix, '');
    let command = content.split(' ')[0];
    let args = content.split(' ').slice(1);
    let perms = this.permissions(msg);

    let cmd;

    if (this.commands.has(command)) {
      cmd = this.commands.get(command);
    } else if (this.aliases.has(command)) {
      cmd = this.commands.get(this.aliases.get(command));
    }

    if (cmd) {
      this.emit('runCommand', msg);
      if (perms < cmd.conf.permLevel) return false;

      try {
        let commandRun = cmd.run(msg, args);
        if (commandRun && commandRun.catch) {
          commandRun.catch(e => this.emit('error', e));
        }
      } catch (e) {
        this.emit('error', e);
      }
    }

    return this;
  }

  permissions(msg) {
    /* This function should resolve to an ELEVATION level which
    is then sent to the command handler for verification*/
    let permlvl = 0;

    if (msg.member && msg.member.hasPermission(`ADMINISTRATOR`)) permlvl = 1;
    if (this.config.owner === msg.author.id) permlvl = 2;

    return permlvl;
  }

  generateArgs(strOrArgs = '') {
    let str = Array.isArray(strOrArgs) ? strOrArgs.join(' ') : strOrArgs;
    let y = str.match(/[^\s'']+|'([^']*)'|'([^']*)'/g);
    if (y === null) return str.split(' ');
    return y.map(e => e.replace(/'/g, ``));
  }

  embed(title, text, color, fields) {
    let embed = {
      title,
      description: text,
      color: color ? parseInt(`0x${color}`, 16) : `0x${color}`,
      fields: [],
    };
    if (fields && !Array.isArray(fields)) {
      Object.keys(fields).forEach(fieldName => {
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
}

module.exports = Client;
