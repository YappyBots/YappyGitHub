const EventResponse = require('../EventResponse');

class PullRequestUnlabeled extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `A pull request got unlabeled. Organization!`,
    });
  }
  embed(data) {
    const pr = data.pull_request;
    const label = data.label;

    return {
      color: '#149617',
      title: `Removed label **${label.name}** from #${pr.number} (\`${pr.title}\`)`,
      url: pr.html_url,
    };
  }
  text(data) {
    const actor = data.sender;
    const pr = data.pull_request;
    const label = data.label;

    return [
      `⛽ **${actor.login}** removed label **${label.name}** from issue **#${pr.number}** (${pr.title})`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestUnlabeled;
