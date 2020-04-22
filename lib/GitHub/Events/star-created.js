const EventResponse = require('../EventResponse');

class StarCreated extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a person stars a repo.`,
    });
  }
  embed() {
    return {
      title: 'Starred repo',
    };
  }
  text(data) {
    return `⭐ Starred by ${data.sender.login}`;
  }
}

module.exports = StarCreated;
