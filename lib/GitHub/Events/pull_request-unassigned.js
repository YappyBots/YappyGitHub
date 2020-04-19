const EventResponse = require('../EventResponse');

class PullRequestUnassigned extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a person is unassigned from a pull request.`,
    });
  }
  embed(data) {
    const { pull_request: pr, assignee } = data;

    return {
      color: '#149617',
      title: `Unassigned ${assignee.login} from #${pr.number} (\`${pr.title}\`)`,
      url: pr.html_url,
    };
  }
  text(data) {
    const { sender: actor, pull_request: pr, assignee } = data;

    return [
      `⛽ **${actor.login}** unassigned ${
        actor.login === assignee.login ? 'themselves' : `**${assignee.login}**`
      } from **#${pr.number}** (${pr.title})`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestUnassigned;
