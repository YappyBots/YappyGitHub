const EventResponse = require('../EventResponse');

class InstallationCreated extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired when a GitHub installation is created.',
    });
  }

  embed(data) {
    const length = data.repositories.length;
    const isAll = data?.installation?.repository_selection === 'all';

    return {
      color: 'Red',
      title: `GitHub installation created for ${isAll ? 'all' : length} ${
        length === 1 && !isAll ? 'repository' : 'repositories'
      }`,
      url: null,
    };
  }

  text(data) {
    const length = data.repositories.length;
    const isAll = data?.installation?.repository_selection === 'all';

    return [
      `🏓 GitHub installation created for ${isAll ? 'all' : length} ${
        length === 1 && !isAll ? 'repository' : 'repositories'
      }!`,
    ].join('\n');
  }
}

module.exports = InstallationCreated;
