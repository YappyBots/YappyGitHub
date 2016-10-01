const Collection = require('./Collection');
const moment = require('moment');
const Prefix = 'G! ';
const Commands = [
  'help',
  'stats',
  'clean',
  'cards',
  'members',
  'say',
  'eval',
  'exec'
];
let bot;

class BotCache {
  constructor(client) {
    bot = client;
    this._MessagesSeen = new Collection();
    this._MessagesSent = new Collection();
    this._Commands = new Collection();

    bot.on('message', msg => {
      if (msg.author.equals(bot.user)) this.SendMessage(msg);
      this.SeeMessage(msg);

      if (msg.content.startsWith(Prefix) || msg.content.startsWith(`<@!${bot.user.id}> `) || msg.content.startsWith(`<@${bot.user.id}> `)) {
        let content = msg.content.replace(Prefix, '').replace(`<@${bot.user.id}> ` , '').replace(`<@!${bot.user.id}> `, '');
        let command = content.toLowerCase();
        let args = content.split(' ').slice(1);

        if (Commands.some(v => command.indexOf(v) === 0)) {
          this.RunCommand(msg);
        }
      }
    });
  }

  SeeMessage(msg) {
    this._MessagesSeen.set(msg.id, msg);
  }

  SendMessage(msg) {
    this._MessagesSent.set(msg.id, msg);
  }

  RunCommand(msg) {
    this._Commands.set(msg.id, msg);
  }

  get SeenMessages() {
    let allowedTime = moment().subtract(1, 'hours');
    return this._MessagesSeen.filter(message => {
      let messageTime = moment(message.timestamp);
      return messageTime > allowedTime;
    });
  }

  get SentMessages() {
    let allowedTime = moment().subtract(1, 'hours');
    return this._MessagesSent.filter(message => {
      let messageTime = moment(message.timestamp);
      return messageTime > allowedTime;
    });
  }

  get CommandsRun() {
    let allowedTime = moment().subtract(1, 'hours');
    return this._Commands.filter(command => {
      let commandTime = moment(command.timestamp);
      return commandTime > allowedTime;
    });
  }
}

module.exports = bot => {
  let cache = new BotCache(bot);
  module.exports = cache;
  exports = cache;
  return cache;
};
