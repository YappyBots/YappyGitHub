const now = require('performance-now');
const Command = require('../lib/Structures/Command');
const EvalCode = require('../lib/EvalCode');
const Log = require('../lib/Logger').Logger;
const Owner = '175008284263186437';

const clean = text => {
  if (typeof text === "string") {
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)).replace("``", "`" + String.fromCharCode(8203) + "`");
  }
  else {
    return text;
  }
}

class EvalCommand extends Command {

  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'eval',
      description: 'Eval code, admin only',
      usage: 'eval <code>'
    }

    this.setConf({
      permLevel: 2
    });

  }

  run(msg, args, command) {
    command = args.join(' ');

    EvalCode(this.bot, msg, command).then(evaled => {

      if (evaled && typeof evaled === 'string' && evaled.indexOf(this.bot.token) >= 0) {
        return msg.channel.sendMessage('Cannot complete eval due to token made visible by command.');
      }

      let message = [
        '`EVAL`',
        '```xl',
        clean(command),
        '- - - - - - evaluates-to- - - - - - -',
        evaled !== undefined ? clean(evaled) : 'undefined',
        '- - - - - - - of type - - - - - - - -',
        typeof evaled,
        '```'
      ].join('\n');

      msg.channel.sendMessage(message).catch(err => {
        Log.error(err);
      });
    }).catch(error => {

      let message = [
        '`EVAL`',
        '```xl',
        clean(command),
        '- - - - - - - errors-in- - - - - - -',
        clean(error) || error,
        '```'
      ].join('\n');

      msg.channel.sendMessage(message);
    });
  }

}

module.exports = EvalCommand;
