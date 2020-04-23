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

  setGitHub(gh) {
    this.github = gh;
  }

  async setup() {
    fs.readdir(this.eventDir, (err, files) => {
      if (err) throw err;

      files.forEach((file) => {
        let eventName = file.replace(`.js`, ``);
        try {
          let event = require(`./Events/${eventName}`);
          this.eventsList.set(eventName, new event(this.github, this.bot));
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

    try {
      event =
        this.eventsList.get(event) ||
        this.eventsList.get(eventName) ||
        this.eventsList.get('Unknown');
      if (!event || event.placeholder || (event.ignore && event.ignore(data)))
        return;
      const text = event.text(data, eventName, action);
      return {
        embed: this.parseEmbed(event.embed(data, eventName, action), data),
        text: event.shorten(
          `**${repo}:** ${Array.isArray(text) ? text.join('\n') : text}`,
          1950
        ),
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
        get(data, 'repository.full_name') || get(data, 'organization.login'),
    };
    embed.url =
      embed.url || embed.url === null
        ? embed.url
        : get(data, 'repository.html_url') ||
          (data.organization &&
            `https://github.com/${get(data, 'organization.login')}`);
    embed.timestamp = new Date();

    if (!embed.image) {
      embed.image = {
        url: this._getMainImage(embed.description),
      };
    }
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

    try {
      text = turndownService.turndown(marked(content));
    } catch (ignored) {}

    return text
      .trim()
      .replace(/^\s+$/gm, '')
      .replace(/\n{2,}/g, '\n\n')
      .replace(/!\[(.*?)\]\((.+?)\)/, img ? '_\\*image: $1\\*_' : '$0')
      .replace(/^ *(\*|-|•) \[x\]/gm, '✓')
      .replace(/^ *(\*|-|•) \[ ?\]/gm, '⃠')
      .replace(/^ *(\*|-)(?!\*) ?/gm, '• ')
      .replace(/^# ?(.+?)$/gm, '**$1**\n----------\n\n')
      .replace(/^#{2,6} ?(?!#)(.+?)$/gm, '**$1**')
      .replace(/^>/gm, '| ')
      .trim();
  }

  _getMainImage(content) {
    return (/!\[(?:.*?)\]\((.*?)\)/.exec(content) || [])[1];
  }
}

module.exports = new Events();
