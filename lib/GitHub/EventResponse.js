class EventResponse {
  constructor(bot, github, info) {
    this.github = github;
    this.bot = bot;
    this._info = info;
  }
  get info() {
    return this._info;
  }

  capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
  }
}

module.exports = EventResponse;
