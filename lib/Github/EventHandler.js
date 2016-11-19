const Collection = require('discord.js').Collection;
const bot = require('../Discord/index.js');
const fs = require('fs');
const path = require('path');
const Log = require('../Util/Log');

class Events {
  constructor() {
    this.events = {};
    this.eventDir = path.resolve(__dirname, './Events');
    this.eventsList = new Collection();

    this.bot = bot;
  }

  async setGithub(gh) {
    this.github = gh;
  }

  async setup() {
    fs.readdir(this.eventDir, (err, files) => {
      if (err) throw err;

      files.forEach(file => {
        try {
          let eventName = file.replace(`.js`, ``);
          let event = require(`./Events/${eventName}`);
          Log.debug(`Loading Github Event: ${eventName} 👌`);
          this.eventsList.set(eventName, new event(this.github, this.bot));
        } catch (e) {
          Log.debug(`Loading Github Event: ${file.replace(`.js`, ``)} ❌`);
          Log.error(e);
        }
      });

      return;
    });
  }

  use(choice, channel, event, data) {
    event = this.eventsList.get(event) || this.eventsList.get('Unknown');
    if (!choice || choice === 'channel') return event.text(data, event);
    return this.parseEmbed(event.embed(data, event), data);
  }

  parseEmbed(embed, data) {
    switch (embed.color) {
      case 'success':
        embed.color = 0x3CA553;
        break;
      case 'warning':
        embed.color = 0xFB5432;
        break;
      case 'danger':
      case 'error':
        embed.color = 0xCE0814;
        break;
      case typeof embed.color === 'string':
        embed.color = parseInt(`0x${embed.color.replace(`0x`, ``)}`, 16);
        break;
    }
    embed.author_name = data.repository.full_name;
    embed.author_link = data.sender.html_url;
    embed.title_link = embed.title_link || data.repository.html_url;
    embed.footer = data.memberCreator.username;
    embed.footer_icon = data.sender.avatar_url || null;
    embed.timestamp = new Date();
    return embed;
  }
}

module.exports = new Events();
