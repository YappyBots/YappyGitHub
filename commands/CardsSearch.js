const Log = require('../lib/Logger').Logger;
const Trello = require('../lib/Cache');

const CardsSearch = (msg, command, args) => {
  let search = args.join(' ');

  Trello.Search(search, ['cards']).then(data => {
    let message = [`**CARD RESULTS**`, ``];
    let cards = data.cards;

    if (!cards.length) {
      message.push(`No cards found for the query \`${search}\``);
    }

    cards.forEach(card => {
      message.push(` - ${card.name.replace('`', '\`')} (<https://trello.com/c/${card.shortLink}>)`);
    });

    return msg.channel.sendMessage(message.join('\n'));
  }).catch(err => Log.error(err));
}

module.exports = bot => CardsSearch;
