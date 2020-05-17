const EventResponse = require('../EventResponse');

class RepositoryDeleted extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a repo is deleted (org only)`,
    });
  }
  embed() {
    return {
      title: 'Deleted repo',
      color: 'C23616',
    };
  }
  text(data) {
    return [
      `🗑 **${data.sender.login}** deleted repository \`${data.repository.full_name}\``,
    ];
  }
}

module.exports = RepositoryDeleted;
