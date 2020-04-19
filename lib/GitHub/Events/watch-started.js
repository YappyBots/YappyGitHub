const EventResponse = require('../EventResponse');

class Star extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a person stars or unstars the repo.`,
    });
  }
  embed() {
    return {
      title: `Added star`,
    };
  }
  text(data) {
    return `⭐ **Starred ${data.repository.full_name}`;
  }
}

module.exports = Star;
