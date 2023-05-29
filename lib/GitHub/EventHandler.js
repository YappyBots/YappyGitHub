const { Util, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const get = require('lodash/get');
const marked = require('marked');
const TurndownService = require('turndown');

const bot = require('../Discord');
const Log = require('../Util/Log');

const turndownService = new TurndownService({
  codeBlockStyle: 'fenced',
});

class Events {
  constructor() {
    this.events = {};
    this.eventDir = path.resolve(__dirname, './Events');
    this.eventsList = new Collection();

    this.bot = bot;
    this.setup();
  }

  async setup() {
    fs.readdir(this.eventDir, (err, files) => {
      if (err) throw err;

      files.forEach((file) => {
        let eventName = file.replace(`.js`, ``);
        try {
          let event = require(`./Events/${eventName}`);
          this.eventsList.set(eventName, new event(this.bot));
          Log.debug(`GitHub | Loading Event ${eventName.replace(`-`, `/`)} 👌`);
        } catch (e) {
          Log.info(`GitHub | Loading Event ${eventName} ❌`);
          Log.error(e);
        }
      });

      return;
    });
  }

  use(repo, data, eventName) {
    const action = data.action || data.status || data.state;
    let event = action ? `${eventName}-${action}` : eventName;
    repo ||= data.installation?.account?.login;

    try {
      const known =
        this.eventsList.get(event) || this.eventsList.get(eventName);
      event = known || this.eventsList.get('Unknown');

      if (!event || event.placeholder || (event.ignore && event.ignore(data)))
        return;
      const text = event.text(data, eventName, action);
      return {
        embed: this.parseEmbed(event.embed(data, eventName, action), data),
        text: event.shorten(
          `**${repo}:** ${Array.isArray(text) ? text.join('\n') : text}`,
          1950
        ),
        unknown: !known,
      };
    } catch (e) {
      Log.error(e);
    }
  }

  parseEmbed(embed, data) {
    if (embed.color) embed.color = Util.resolveColor(embed.color);

    embed.author = {
      name: data.sender.login,
      icon_url: data.sender.avatar_url || null,
      url: data.sender.html_url,
    };
    embed.footer = {
      text:
        data.repository?.full_name ||
        data.installation?.account?.login ||
        data?.organization?.login,
    };
    embed.url =
      embed.url || embed.url === null
        ? embed.url
        : get(data, 'repository.html_url') ||
          (data.organization &&
            `https://github.com/${get(data, 'organization.login')}`);
    embed.timestamp = new Date();

    if (embed.description) {
      embed.description = this._beautify(embed.description, embed.image.url);
      if (embed.description.length > 2048) {
        embed.description = `${embed.description.slice(0, 2045).trim()}...`;
      }
    }

    return embed;
  }

  _beautify(content, img) {
    let text = content;

    if (/<\/?[a-z][\s\S]*>/.test(text)) {
      try {
        text = turndownService.turndown(marked(content));
      } catch (ignored) {}
    }

    return text
      .trim()
      .replace(/(\r?\n){2,}/g, '\n\n')
      .replace(/^ *(\*|-|•) \[x\]/gm, '🗹')
      .replace(/^ *(\*|-|•) \[ ?\]/gm, '☐')
      .trim();
  }
}

module.exports = new Events();
