const EventResponse = require('../EventResponse');

class Repository extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        "This response is fired whenever a repository's status is updated",
    });
  }

  embed(data) {
    return {
      color: `#972e26`,
      title: `${this.capitalize(data.action)} the repo`,
    };
  }

  text(data) {
    return `💿 **${data.sender.login}** ${this.capitalize(
      data.action
    )} the repo`;
  }
}

module.exports = Repository;
