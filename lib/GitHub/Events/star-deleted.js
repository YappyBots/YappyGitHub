const EventIgnoreResponse = require('../EventIgnoreResponse');

class StarDeleted extends EventIgnoreResponse {
  constructor(...args) {
    super(...args, {
      description: `Placeholder to ignore star/deleted events.`,
    });
  }
}

module.exports = StarDeleted;
