const Discord = require('discord.js');
const fs = require('fs');
const Log = require('./lib/Logger').Logger;
const ServerConf = require('./lib/ServerConf');
const Util = require('./lib/Util');
const GithubPrefix = `G! `;

const StartsWithPrefix = (msg) => {
  let prefix = ServerConf.grab(msg.guild).prefix;

  if (prefix && msg.content.startsWith(prefix)) return true;

  return msg.content.startsWith(GithubPrefix) || msg.content.startsWith(`<@!${msg.client.user.id}> `) || msg.content.startsWith(`<@${msg.client.user.id}> `)
}
const RemovePrefix = (msg) => {

  let content = msg.content.replace(`<@${msg.client.user.id}> ` , '').replace(`<@!${msg.client.user.id}> `, '');
  let CustomPrefix = ServerConf.grab(msg.guild).prefix;

  if (content.startsWith(GithubPrefix)) {
    content = content.replace(GithubPrefix, '')
  } else if (content.startsWith(CustomPrefix)) {
    content = content.replace(CustomPrefix, '');
  }

  return content;
}
const RunCommand = (msg) => {
  if (!StartsWithPrefix(msg)) return false;

  let bot = msg.client;
  let content = RemovePrefix(msg);
  let command = content.split(' ')[0];
  let args = content.split(' ').slice(1);
  let perms = bot.permissions(msg);

  let cmd;

  if (bot.commands.has(command)) {
    cmd = bot.commands.get(command)
  } else if (bot.aliases.has(command)) {
    cmd = bot.commands.get(bot.aliases.get(command))
  }

  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
    cmd.run(msg, args);
  }
}
const BotPermissions = (msg) => {
  /* This function should resolve to an ELEVATION level which
  is then sent to the command handler for verification*/
  let permlvl = 0;

  if (msg.member && msg.member.hasPermission(`ADMINISTRATOR`)) permlvl = 1;
  if (msg.author.id == msg.client.config.owner) permlvl = 2;

  return permlvl;
}


module.exports = (bot) => {
  bot.commands = new Discord.Collection();
  bot.aliases = new Discord.Collection();
  bot.permissions = BotPermissions;
  bot.config = {
    owner: '175008284263186437'
  };

  fs.readdir('./commands', (err, files) => {
    if (err) return Log.error(err);
    files = files.filter(e => e.indexOf('.') > -1);

    Log.info(`Loading a total of ${files.length} commands.`);

    files.forEach(f => {
      let command = require(`./commands/${f}`);
      try {
        command = new command(bot);
        Log.info(`Loading Command: ${command.help.name}. 👌`);
        bot.commands.set(command.help.name, command);
        command.conf.aliases.forEach(alias => {
          bot.aliases.set(alias, command.help.name);
        });
      } catch (e) {
        Log.error(e)
      }
    });
  });

  bot.on('message', RunCommand);
}
