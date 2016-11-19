class EventResponse {
  constructor(bot, github, info) {
    this.github = github;
    this.bot = bot;
    this._info = info;
  }
  get info() {
    return this._info;
  }
}

module.exports = EventResponse;
