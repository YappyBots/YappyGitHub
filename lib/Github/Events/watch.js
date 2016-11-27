const EventResponse = require('../EventResponse');

class Star extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a person stars or unstars the repo.`,
    });
  }
  embed(data) {
    return {
      title: `${data.action === 'started' ? 'Added' : 'Removed'} star`,
    };
  }
  text(data) {
    return `⭐ **${data.sender.login}** ${data.action === 'started' ? 'starred' : 'unstarred'} ${data.repository.full_name}`;
  }
}

module.exports = Star;
