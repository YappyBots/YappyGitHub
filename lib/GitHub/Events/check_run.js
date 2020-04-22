const EventIgnoreResponse = require('../EventIgnoreResponse');

class CheckRun extends EventIgnoreResponse {
  constructor(...args) {
    super(...args, {
      description:
        'Check runs are in preview on GitHub - this is a placeholder',
    });
  }
}

module.exports = CheckRun;
