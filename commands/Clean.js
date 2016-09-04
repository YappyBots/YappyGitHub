const Log = require('../lib/Logger').Logger;
let bot;

const Clean = (msg, command, args) => {
  msg.channel.fetchMessages().then(messages => {
    messages.filter(e => e.author.equals(bot.user)).forEach(message => {
      return message.delete().catch(err => Log.error);
    });
  }).catch(err => Log.error(err));
};

module.exports = client => {
  bot = client;
  return Clean;
};
