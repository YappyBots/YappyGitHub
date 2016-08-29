const Discord = require('discord.js');
const bot = new Discord.Client();
const trello_events = require('./lib/TrelloEvents');
const TrelloEvents = new trello_events({
  pollFrequency: 1000 * 60,
  minId: 0,
  start: true,
  trello: {
    boards: ['YC5ZhyHZ'],
    // boards: ['3AwqHhQy'],
    key: '757b8b7388014629fc1e624bde8cc600',
    token: process.env.TRELLO_TOKEN
  }
});
const Trello = require('./lib/Cache');
const Log = require('./lib/Logger').Logger;

const token = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.BOT_TOKEN;
const channel = '219479229979426816'; // los discordos channel
// const channel = '175021235384614912'; // testing channel
let Prefix = 'T! ';
let ClientReady = false;

const Commands = {
  Eval: require('./commands/Eval')(bot),
  Exec: require('./commands/Exec')(bot)
}

// ===== TRELLO =====

TrelloEvents.on('trelloError', Log.error);


// Card events

TrelloEvents.on('createCard', e => {
  if (!ClientReady) return false;

  let card = {
    name: e.data.card.name,
    id: e.data.card.id,
    list: e.data.list,
    author: e.memberCreator,
    date: e.date
  };

  Trello.GetCard(card.id).then(el => {
    if (el) {
      card = null;
      return;
    }
    return Trello.AddCard(card.id, {
      name: card.name,
      desc: card.desc,
      idList: card.list.id
    })
  }).then(() => {
    if (!card) return false;
    return bot.channels.get(channel).sendMessage(`**${card.author.fullName}** created card __${card.name}__ in _${card.list.name}_`);
  }).catch(Log.error);

});

TrelloEvents.on('deleteCard', e => {
  if (!ClientReady) return false;

  let card = {
    name: e.data.card.name,
    id: e.data.card.id,
    list: e.data.list,
    author: e.memberCreator,
    date: e.date
  };

  Trello.GetCard(card.id).then(card => {
    if (!card) return false;

    bot.channels.get(channel).sendMessage(`**${e.memberCreator.fullName}** deleted card __${card.name}__`);
    return Trello.DeleteCard(card.id);
  }).catch(Log.error);

});

TrelloEvents.on('commentCard', e => {
  if (!ClientReady) return false;

  let card = {
    name: e.data.card.name,
    id: e.data.card.id,
    board: e.data.board,
    comment: e.data.text,
    author: e.memberCreator,
    date: e.date,
  };

  Trello.AddComment(e.id, e).then(() => {
    return bot.channels.get(channel).sendMessage(`**${card.author.fullName}** commented on __${card.name}__: \n \`\`\`xl\n${card.comment}\n\`\`\``);
  }).catch(Log.error);

});

TrelloEvents.on('updateCard', e => {
  if (!ClientReady) return false;

  if (!e.data.card || !e.data.old) return false;

  let card = {
    name: e.data.card.name,
    id: e.data.card.id,
    board: e.data.board,
    list: e.data.list,
    new: e.data.card,
    old: e.data.old,
    author: e.memberCreator,
    date: e.date,
    data: e.data
  };

  Trello.UpdateCard(card.id, card.new).then(() => {
    if (e.data.old.desc && e.data.old.desc !== e.data.new.desc) {
      bot.channels.get(channel).sendMessage(`**${card.author.fullName}** changed the description of __${card.name}__ to \n \`\`\`xl\n${card.new.desc}\n\`\`\``);
    } else if (e.data.old && e.data.new && e.data.old.name !== e.data.new.name) {
      bot.channels.get(channel).sendMessage(`**${card.author.fullName}** renamed card _${card.old.name}_ to __${card.new.name}__`);
    } else if (e.data.listBefore && e.data.listAfter) {
      return bot.channels.get(channel).sendMessage(`**${card.author.fullName}** moved card __${card.name}__ to \`${card.data.listAfter.name}\` (from _${card.data.listBefore.name}_)`);
    }
  }).catch(Log.error)

});

// List events

TrelloEvents.on('createList', e => {
  if (!ClientReady) return false;

  let list = {
    name: e.data.list.name,
    board: e.data.board,
    id: e.data.list.id,
    author: e.memberCreator,
    date: e.date,
  };

  bot.channels.get(channel).sendMessage(`**${list.author.fullName}** created list __${list.name}__ in _${list.board.name}_`).catch(Log.error);
});

TrelloEvents.on('updateList', e => {
  if (!ClientReady) return false;
  if (!e.data.list || !e.data.old) return false;

  let list = {
    name: e.data.list.name,
    id: e.data.list.id,
    board: e.data.board,
    new: e.data.list,
    old: e.data.old,
    author: e.memberCreator,
    date: e.date,
  };

  if (e.data.old.name && e.data.old.name !== e.data.list.name) {
    bot.channels.get(channel).sendMessage(`**${list.author.fullName}** renamed list _${list.old.name}_ to __${list.new.name}__`).catch(Log.error);
  }
});

// Board  events
TrelloEvents.on('addMemberToBoard', e => {
  if (!ClientReady) return false;

  let member = {
    name: e.member.fullName,
    username: e.member.username,
    id: e.member.id,
    board: e.data.board,
    invitedByLink: e.data.method == 'invitationSecret',
    date: e.date,
  };

  let message;

  if (member.invitedByLink) {
    message = `**${member.name}** joined _${member.board.name}_ with an invitation link.`;
  } else {
    message = `**${member.name}** was invited to _${member.board.name}_`;
  }

  bot.channels.get(channel).sendMessage(message).catch(Log.error);
});

TrelloEvents.on('updateBoard', e => {
  if (!ClientReady) return false;

  if (e.data.board && e.data.board.prefs && e.data.board.prefs.background) {

    let board = {
      id: e.data.board.id,
      name: e.data.board.name,
      newBackground: e.data.board.prefs.background,
      oldBackground: e.data.old.prefs.background,
      date: e.date,
      author: e.memberCreator
    }

    bot.channels.get(channel).sendMessage(`**${board.author.fullName}** changed the background to \`${board.newBackground}\` (from _${board.oldBackground}_)`).catch(Log.error);
  }

});

// ===== DISCORD =====

require('./lib/CommandLogger')(bot);

bot.on('message', msg => {
  if (!msg.content.startsWith(Prefix) && !msg.content.startsWith(`<@!${bot.user.id}> `) && !msg.content.startsWith(`<@${bot.user.id}> `)) return false;

  let command = msg.content.replace(Prefix, '').replace(`<@${bot.user.id}> ` , '').replace(`<@!${bot.user.id}> `, '');
  let args = command.split(' ').slice(1);

  if (command == 'cards') {
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
  } else if (command.startsWith('cards search ')) {
    let search = command.replace('cards search ', '');
    Trello.Search(search, ['cards']).then(data => {
      let message = [`**CARD RESULTS**`, ``];
      let cards = data.cards;

      if (!cards.length) {
        message.push(`No results found for the query \`${search}\``);
      }

      cards.forEach(card => {
        message.push(` - ${card.name.replace('`', '\`')} (<https://trello.com/c/${card.shortLink}>)`);
      });

      return msg.channel.sendMessage(message.join('\n'));
    }).catch(Log.error);
  } else if (command == 'clean') {
    msg.channel.getMessages().then(messages => {
      messages.filter(e => e.author.equals(bot.user)).forEach(message => {
        message.delete().catch(Log.error);
      });
    }).catch(Log.error);
  } else if (command == 'help') {
    let message = [
      '**DiscordJS Rewrite Trello**',
      'A bot that sends new activity on board to <#219479229979426816>',
      '',
      `Prefix: \`${Prefix}\` or <@!219218963647823872>`,
      '',
      'Commands:',
      '  • \`cards\` : shows a list of all cards',
      '  • \`cards search <query>\` : returns cards matching the query provided and their short link',
      '  • \`clean\` : cleans the bot\'s messages',
      '  • \`help\` : sends you this help :)',
    ];

    msg.author.sendMessage(message.join('\n')).catch(Log.error);

    if (msg.guild) {
      msg.channel.sendMessage(`<@!${msg.author.id}>, help has been sent to your DM!`).then(message => {
        setTimeout(() => {
          message.delete();
        }, 5000);
      })
    }
  } else if (command.startsWith('eval')) {
    Commands.Eval(msg, args.join(' '));
  } else if (command.startsWith('exec')) {
    Commands.Exec(msg, args.join(' '));
  }
})

bot.on('ready', () => {
  Log.info('=> Logged in!');
  setTimeout(() => {
    ClientReady = true;
  }, 7000);
});

bot.on('error', Log.error);

process.on('uncaughtException', err => {
  if (typeof err == 'object' && err.stack) {
    err.stack = err.stack.replace(new RegExp(__dirname, 'g'), '.');
  }

  let message = [
    '**UNCAUGHT EXCEPTION**',
    '',
    '```xl',
    err.stack,
    '```'
  ].join('\n');

  Log.error(err.stack);

  if (ClientReady) bot.users.get('175008284263186437').sendMessage(message);
});

bot.login(token).then(token => {
  Log.info('=> Logging in...');

  // Detect if login failed or didn't occur after 7.5s
  setTimeout(() => {
    if (ClientReady) return false;
    Log.error('=> Unable to log in; invalid credentials or Discord is down');
  }, 7500);
}).catch(err => {
  Log.error('=> Unable to log in!');
  Log.error(err);
});
