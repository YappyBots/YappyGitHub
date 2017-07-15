const EventResponse = require('../EventResponse');

class Public extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever a repo is open sourced \\o/',
    });
  }

  embed() {
    return {
      title: `Now open sourced! 🎉`,
      url: null,
    };
  }

  text(data) {
    return [
      `🎉 **${data.sender.login}** open sourced the repo!`,
    ].join('\n');
  }
}

module.exports = Public;
