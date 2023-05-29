const EventResponse = require('../EventResponse');

class InstallationSuspend extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired when a GitHub installation is suspended.',
    });
  }

  embed(data) {
    return {
      color: 'danger',
      title: `GitHub installation suspended`,
      url: null,
    };
  }

  text(data) {
    return [`🏓 GitHub installation suspended!`].join('\n');
  }
}

module.exports = InstallationSuspend;
