const EventIgnoreResponse = require('../EventIgnoreResponse');

class Watch extends EventIgnoreResponse {
  constructor(...args) {
    super(...args, {
      description: `Placeholder to ignore watch events - they are fired on stars too.`,
    });
  }
}

module.exports = Watch;
