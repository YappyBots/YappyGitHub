const MergeDefault = require('../Util/MergeDefault');
const default_conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
};
const default_help = (command) => {
  if (!command) return {};
  return {
    name: command ? command.name : 'null',
    description: `Description for ${command ? command.name : 'null'}`,
    usage: command ? command.name : 'null',
  };
};

class Command {

  constructor(bot) {
    this.bot = bot;
    this.props = {};
    this._path = Log._path;
    this.setConf();
    this.setHelp();
  }

  run(msg) {
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

  commandError(msg, str) {
    return msg.channel.sendMessage(`❌ ${str}`);
  }

  generateArgs(strOrArgs = '') {
    let str = Array.isArray(strOrArgs) ? strOrArgs.join(' ') : strOrArgs;
    let y = str.match(/[^\s'']+|'([^']*)'|'([^']*)'/g);
    if (y === null) return str.split(' ');
    return y.map(e => e.replace(/'/g, ``));
  }

  _permLevelToWord(permLvl) {
    if (!permLvl || permLvl === 0) return 'Everyone';
    if (permLvl === 1) return 'Admin';
    if (permLvl === 2) return 'Owner';
  }

}

module.exports = Command;
