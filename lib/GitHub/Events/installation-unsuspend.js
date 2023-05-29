const EventResponse = require('../EventResponse');

class InstallationUnsuspend extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired when a GitHub installation is unsuspended.',
    });
  }

  embed(data) {
    return {
      color: 'danger',
      title: `GitHub installation unsuspended`,
      url: null,
    };
  }

  text(data) {
    return [`🏓 GitHub installation unsuspended!`].join('\n');
  }
}

module.exports = InstallationUnsuspend;
