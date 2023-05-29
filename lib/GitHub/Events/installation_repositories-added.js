const EventResponse = require('../EventResponse');

class InstallationRepositoriesAdded extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired when repositories are added to the GitHub App installation.',
    });
  }

  embed(data) {
    const { repositories_added, repository_selection } = data;
    const length = repositories_added.length;
    const isAll = repository_selection === 'all';

    return {
      color: 'danger',
      title: `Receiving events from ${isAll ? 'all' : length} ${
        length === 1 && !isAll ? 'repository' : 'repositories'
      }`,
      description:
        repository_selection === 'all'
          ? ''
          : repositories_added
              .map((repo) => this.escape(repo.full_name))
              .join(', '),
      url: null,
    };
  }

  text(data) {
    const { repositories_added, repository_selection } = data;
    const text =
      repository_selection === 'all'
        ? 'all repositories'
        : repositories_added.map((repo) => `\`${repo.full_name}\``).join(', ');

    return [`🏓 Receiving events from ${text}!`].join('\n');
  }
}

module.exports = InstallationRepositoriesAdded;
