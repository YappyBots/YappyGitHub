const escape = require('markdown-escape');
const { decode } = require('html-entities');

class EventResponse {
  constructor(bot, info) {
    this.bot = bot;
    this._info = info;
  }
  get info() {
    return this._info;
  }

  capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
  }

  shorten(str, length) {
    return str
      ? str.trim().slice(0, length).trim() + (str.length > length ? '...' : '')
      : '';
  }

  escape(str) {
    return decode(escape(str));
  }
}

module.exports = EventResponse;
