const MergeDefault = require('../Util/MergeDefault');
const default_conf = {
  enabled: true,
  guildOnly: false,
  aliases: []
}
const default_help = (command) => {
  if (!command) return {};
  return {
    name: command && command.name || 'null',
    description: `Description for ${command && command.name || 'null'}`,
    usage: command && command.name || 'null'
  }
}

class Command {

  constructor(bot) {
    this.bot = bot;
    this.props = {};
    this.setConf();
    this.setHelp();
  }

  run(msg, params) {
    msg.channel.sendMessage('No run command configured!');
  }

  setConf(conf = {}) {
    this.props.conf = MergeDefault(default_conf, conf);
  }

  get conf() {
    return this.props.conf;
  }

  setHelp(help = {}) {
    this.props.help = MergeDefault(default_help(this), help);
  }

  get help() {
    return this.props.help;
  }

}

module.exports = Command;
