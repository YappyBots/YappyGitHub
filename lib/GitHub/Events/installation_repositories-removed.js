const EventResponse = require('../EventResponse');

class InstallationRepositoriesRemoved extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired when repositories are removed from the GitHub App installation.',
    });
  }

  embed(data) {
    const { repositories_removed, repository_selection } = data;
    const length = repositories_removed.length;
    const isAll = repository_selection === 'all';

    return {
      color: 'danger',
      title: `No longer receiving events from ${isAll ? 'all' : length} ${
        length === 1 && !isAll ? 'repository' : 'repositories'
      }`,
      description:
        repository_selection === 'all'
          ? ''
          : repositories_removed
              .map((repo) => this.escape(repo.full_name))
              .join(', '),
      url: null,
    };
  }

  text(data) {
    const { repositories_removed, repository_selection } = data;
    const text =
      repository_selection === 'all'
        ? 'all repositories'
        : repositories_removed
            .map((repo) => `\`${repo.full_name}\``)
            .join(', ');

    return [`🏓 No longer receiving events from ${text}!`].join('\n');
  }
}

module.exports = InstallationRepositoriesRemoved;
