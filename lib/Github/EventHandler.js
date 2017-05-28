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
    this.setup();
  }

  setGithub(gh) {
    this.github = gh;
  }

  async setup() {
    fs.readdir(this.eventDir, (err, files) => {
      if (err) throw err;

      files.forEach(file => {
        let eventName = file.replace(`.js`, ``);
        try {
          let event = require(`./Events/${eventName}`);
          this.eventsList.set(eventName, new event(this.github, this.bot));
          Log.info(`Github | Loading Event ${eventName.replace(`-`, `/`)} 👌`);
        } catch (e) {
          Log.info(`Github | Loading Event ${eventName} ❌`);
          Log.error(e);
        }
      });

      return;
    });
  }

  use(data, eventName) {
    let action = data.action;
    let event = action ? `${eventName}-${action}` : eventName;

    try {
      event = this.eventsList.get(event) || this.eventsList.get('Unknown');
      let text = event.text(data, eventName, action);
      return {
        embed: this.parseEmbed(event.embed(data, eventName, action), data),
        text: Array.isArray(text) ? text.join('\n') : text,
      };
    } catch (e) {
      Log.error(e);
    }
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
      default:
        if (embed.color) embed.color = parseInt(`0x${embed.color.replace(`0x`, ``)}`, 16);
        break;
    }
    embed.author = {
      name: data.sender.login,
      icon_url: data.sender.avatar_url || null,
      url: data.sender.html_url,
    };
    embed.footer = {
      text: data.repository.full_name,
    };
    embed.url = embed.url || data.repository.html_url;
    embed.timestamp = new Date();
    return embed;
  }
}

module.exports = new Events();
