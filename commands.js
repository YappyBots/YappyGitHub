const Discord = require('discord.js');
const fs = require('fs');
const Log = require('./lib/Logger').Logger;
const ServerConf = require('./lib/ServerConf');
const GithubPrefix = `G! `;

const StartsWithPrefix = (msg) => {
  if (typeof msg == 'object') msg = msg.content;

  return msg.startsWith(GithubPrefix) || !msg.startsWith(ServerConf.grab(msg.guild).prefix) || !msg.startsWith(`<@!${msg.client.user.id}> `) || !msg.startsWith(`<@${msg.client.user.id}> `)
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

  let cmd;

  if (bot.commands.has(command)) {
    cmd = bot.commands.get(command)
  } else if (bot.aliases.has(command)) {
    cmd = bot.commands.get(bot.aliases.get(command))
  }

  if (cmd) {
    cmd.run(msg, args);
  }
}
const BotElevation = (msg) => {
  /* This function should resolve to an ELEVATION level which
  is then sent to the command handler for verification*/
  let permlvl = 0;

  if (msg.member && msg.member.hasPermission("ADMINISTRATION")) permlvl = 1;
  if (msg.author.id === bot.config.owner) permlvl = 2;

  return permlvl;
}

module.exports = (bot) => {
  bot.commands = new Discord.Collection();
  bot.aliases = new Discord.Collection();
  bot.elevation = BotElevation;
  bot.config = {
    owner: '175008284263186437'
  };

  fs.readdir('./commands', (err, files) => {
    if (err) return Log.error(err);
    Log.debug(`Loading a total of ${files.length} commands.`);
    files.forEach(f => {
      if (f.indexOf('.') == -1) return false;
      let command = require(`./commands/${f}`);
      try {
        command = new command(bot);
        Log.debug(`Loading Command: ${command.help.name}. 👌`);
        bot.commands.set(command.help.name, command);
        command.conf.aliases.forEach(alias => {
          bot.aliases.set(alias, command.help.name);
        });
      } catch (e) {}
    });
  });

  bot.on('message', RunCommand);
}
