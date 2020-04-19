const EventResponse = require('../EventResponse');

class CheckSuite extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'Check suites are in preview on GitHub - this is a placeholder',
    });
  }

  ignore() {
    return true;
  }
}

module.exports = CheckSuite;
