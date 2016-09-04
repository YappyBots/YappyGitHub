const EvalCode = require('../lib/EvalCode');
const Log = require('../lib/Logger').Logger;

const clean = text => {
  if (typeof(text) === "string") {
    return text.replace("``", "`" + String.fromCharCode(8203) + "`");
  }
  else {
    return text;
  }
}

module.exports = bot => {
  return (msg, command) => {
    EvalCode(bot, msg, command).then(data => {
      var {
        evaled,
        startTime,
        endTime
      } = data;

      if (evaled && evaled.indexOf(bot.token) >= 0) {
        return msg.channel.sendMessage('Cannot complete eval due to token made visible by command.');
      }

      let message = [
        '`EVAL`',
        '```xl',
        clean(command),
        '- - - - - - evaluates-to- - - - - - -',
        evaled !== undefined ? clean(evaled) : 'undefined',
        '- - - - - - - - - - - - - - - - - - -',
        `In ${endTime - startTime} milliseconds!`,
        '- - - - - - - of type - - - - - - - -',
        typeof evaled,
        '```'
      ].join('\n');

      msg.channel.sendMessage(message).catch(err => {
        Log.error(err);
      });
    }).catch(data => {

      let {
        error,
        startTime,
        endTime
      } = data;

      let message = [
        '`EVAL`',
        '```xl',
        clean(command),
        '- - - - - - - errors-in- - - - - - -',
        clean(error),
        '- - - - - - - - - - - - - - - - - - -',
        `In ${endTime - startTime} milliseconds!`,
        '```'
      ].join('\n');

      msg.channel.sendMessage(message);
    });
  }
}
