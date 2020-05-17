const EventResponse = require('../EventResponse');

class PullRequestLabeled extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `A pull request got labeled. Organization!`,
    });
  }
  embed(data) {
    const pr = data.pull_request;
    const label = data.label;

    return {
      color: '#149617',
      title: `Added label **${label.name}** to #${pr.number} (**${pr.title}**)`,
      url: pr.html_url,
    };
  }
  text(data) {
    const actor = data.sender;
    const pr = data.pull_request;
    const label = data.label;

    return [
      `⛽ **${actor.login}** added label **${label.name}** to issue **#${pr.number}** (${pr.title})`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestLabeled;
