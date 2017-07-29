const EventResponse = require('../EventResponse');

class PullRequestAssigned extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever a person is assigned to a pull request.',
    });
  }
  embed(data) {
    const { pull_request: pr, assignee } = data;

    return {
      color: '#149617',
      title: `Assigned ${assignee.login} to #${pr.number} (\`${pr.title}\`)`,
      url: pr.html_url,
    };
  }
  text(data) {
    const {
      sender: actor,
      pull_request: pr,
      assignee,
    } = data;
    return [
      `⛽ **${actor.login}** assigned ${actor.login === assignee.login ? 'themselves' : `**${assignee.login}**`} to **#${pr.number}** (${pr.title})`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestAssigned;
