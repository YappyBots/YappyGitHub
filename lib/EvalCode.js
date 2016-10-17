var util = require('util');
var now = require('performance-now');

module.exports = (bot, msg, command) => {

  return new Promise((resolve, reject) => {
    let endTime;
    let code = command;

    try {
      var evaled = eval(code);
      if (evaled) {
        if (typeof evaled == 'object') {
          try {
            evaled = util.inspect(evaled);
          }
          catch (err) {
            evaled = JSON.stringify(evaled, null, 2);
          }
        }
        if (typeof evaled == 'string' && evaled.length >= 2000) {
          evaled = evaled.substr(evaled.length - 1000, evaled.length);
        }
      }

      resolve(evaled);
    }
    catch (error) {
      reject(error);
    }
  });

}
