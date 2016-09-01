const Collection = require('./Collection');
const moment = require('moment');
const Prefix = 'T! ';
let bot;

class BotCache {
  constructor(client) {
    bot = client;
    this._MessagesSeen = new Collection();
    this._MessagesSent = new Collection();
    this._Commands = new Collection();
    this._TrelloEvents = new Collection();

    bot.on('message', msg => {
      if (msg.author.equals(bot.user)) this.SendMessage(msg);
      this.SeeMessage(msg);

      if (msg.content.startsWith(Prefix) || msg.content.startsWith(`<@!${bot.user.id}> `) || msg.content.startsWith(`<@${bot.user.id}> `)) {
        let content = msg.content.replace(Prefix, '').replace(`<@${bot.user.id}> ` , '').replace(`<@!${bot.user.id}> `, '');
        let command = content.toLowerCase();
        let args = content.split(' ').slice(1);

        if (command == 'help' ||
        command == 'stats' ||
        command == 'clean' ||
        command == 'eval' ||
        command == 'exec' ||
        command == 'cards' ||
        command.startsWith('cards search ') ||
        command == 'members' ||
        command.startsWith('members search ') ||
        command.startsWith('say')) {
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

  TrelloEvent(action) {
    action.time = new Date(action.date).getTime();

    this._TrelloEvents.set(action.id, action);
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

  get TrelloEvents() {
    let allowedTime = moment().subtract(1, 'hours');
    return this._TrelloEvents.filter(action => {
      let actionTime = moment(action.timestamp);
      return actionTime > allowedTime;
    });
  }
}

module.exports = bot => {
  let cache = new BotCache(bot);
  module.exports = cache;
  exports = cache;
  return cache;
};
