const EventResponse = require('../EventResponse');

class Repository extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever a repository\'s status is updated',
    });
  }

  embed(data) {
    return {
      color: `#972e26`,
      title: `${this.capitalize(data.action)} the repo`,
    };
  }

  text(data) {
    return `💿 **${data.actor.login}** ${this.capitalize(data.action)} the repo`;
  }

  capitalize(str) {
    return str[0].toUpperCase() + str.slice(0);
  }
}

module.exports = Repository;
