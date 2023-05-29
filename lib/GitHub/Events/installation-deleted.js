const EventResponse = require('../EventResponse');

class InstallationDeleted extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired when a GitHub installation is deleted.',
    });
  }

  embed(data) {
    return {
      color: 'danger',
      title: `GitHub installation deleted`,
      url: null,
    };
  }

  text(data) {
    return [`🏓 GitHub installation deleted!`].join('\n');
  }
}

module.exports = InstallationDeleted;
