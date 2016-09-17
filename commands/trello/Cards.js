const Log = require('../../lib/Logger').Logger;
const Trello = require('../../lib/Cache');

const Cards = (msg, command, args) => {
  Trello.Cards().then(cards => {
    let message = [`**CARDS**`, ``];

    cards.forEach(card => {
      message.push(` - ${card.name.replace('`', '\`')}`);
    });

    message = message.join('\n');

    if (message.length < 2000) {
      msg.channel.sendMessage(message);
    } else if (message.length > 2000) {
      let message1 = message.substring(0, 1999);
      msg.channel.sendMessage(message1).catch(Log.error);
      msg.channel.sendMessage(message.replace(message1, '')).catch(Log.error);
    }

  }).catch(Log.error);
}

module.exports = bot => Cards;
