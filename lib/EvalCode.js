var util = require('util');
var now = require('performance-now');

module.exports = (bot, msg, command) => {

	return new Promise((resolve, reject) => {
		let startTime = now();
		let endTime;
		let code = command;

		try {
			var evaled = eval(code);
			endTime = now();
			if (evaled) {
				if (evaled instanceof Object) {
					try {
						evaled = util.inspect(evaled);
					}
					catch (err) {
						evaled = JSON.stringify(evaled, null, 2);
					}
					// Bot.updateMessage(msg, "May contain secret stuff shh :eyes:");
					// return false;
				}
				if (evaled.length >= 2000) {
					evaled = evaled.substr(evaled.length - 1000, evaled.length);
				}
			}
			endTime = now();
			// debug(moment.duration(endTime - startTime, "milliseconds").humanize());
			resolve({ evaled, startTime, endTime });
		}
		catch (error) {
			endTime = now();
			reject({ error, startTime, endTime });
		}
	});

}
