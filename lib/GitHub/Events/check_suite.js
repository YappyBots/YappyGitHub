const EventIgnoreResponse = require('../EventIgnoreResponse');

class CheckSuite extends EventIgnoreResponse {
  constructor(...args) {
    super(...args, {
      description:
        'Check suites are in preview on GitHub - this is a placeholder',
    });
  }
}

module.exports = CheckSuite;
