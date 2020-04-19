const EventResponse = require('../EventResponse');

class CheckRun extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'Check runs are in preview on GitHub - this is a placeholder',
    });
  }

  ignore() {
    return true;
  }
}

module.exports = CheckRun;
