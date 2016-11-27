const EventResponse = require('../EventResponse');

class Star extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a person forks the repo.`,
    });
  }
  embed(data) {
    return {
      title: `Forked repo: ${data.forkee.full_name}`,
      url: data.forkee.html_url,
    };
  }
  text(data) {
    return [
      `🍝 **${data.sender.login}** Forked repo: ${data.forkee.full_name}`,
      `  <${data.forkee.html_url}>`,
    ];
  }
}

module.exports = Star;
