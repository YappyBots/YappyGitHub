const Command = require('../Command');
const util = require('util');
const path = require('path');
const Log = require('../../Util/Log');

class EvalCommand extends Command {

  constructor(bot) {
    super(bot);

    this.tokenRegEx = new RegExp(this.bot.token, 'g');
    this.pathRegEx = new RegExp(path.resolve(__dirname, '../../../'), 'g');

    this.props.help = {
      name: 'eval',
      description: 'Eval code, admin only',
      usage: 'eval <code>',
    };

    this.setConf({
      permLevel: 2,
    });
  }

  run(msg, args) {
    let command = args.join(' ');
    let bot = this.bot;
    if (!command || command.length === 0) return;

    this._evalCommand(bot, msg, command, Log).then(evaled => {
      if (evaled && typeof evaled === 'string') {
        evaled = evaled.replace(this.tokenRegEx, '-- snip --').replace(this.pathRegEx, '.');
      }

      let message = [
        '`EVAL`',
        '```js',
        evaled !== undefined ? this._clean(evaled) : 'undefined',
        '```',
      ].join('\n');

      return msg.channel.send(message);
    }).catch(error => {
      if (error.stack) error.stack = error.stack.replace(this.pathRegEx, '.');
      let message = [
        '`EVAL`',
        '```js',
        this._clean(error) || error,
        '```',
      ].join('\n');
      return msg.channel.send(message);
    });
  }
  _evalCommand(bot, msg, command, log) {
    return new Promise((resolve, reject) => {
      if (!log) log = Log;
      let code = command;
      try {
        var evaled = eval(code);
        if (evaled) {
          if (typeof evaled === 'object') {
            if (evaled._path) delete evaled._path;
            try {
              evaled = util.inspect(evaled, { depth: 0 });
            } catch (err) {
              evaled = JSON.stringify(evaled, null, 2);
            }
          }
        }
        resolve(evaled);
      } catch (error) {
        reject(error);
      }
    });
  }

  _clean(text) {
    if (typeof text === 'string') {
      return text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`).replace('``', `\`${String.fromCharCode(8203)}\`}`);
    } else {
      return text;
    }
  }

}

module.exports = EvalCommand;
