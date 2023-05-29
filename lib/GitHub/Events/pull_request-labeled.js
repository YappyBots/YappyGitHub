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
      title: `Added label **${this.escape(label.name)}** to #${pr.number} (**${this.escape(pr.title)}**)`,
      url: pr.html_url,
    };
  }
  text(data) {
    const actor = data.sender;
    const pr = data.pull_request;
    const label = data.label;

    return [
      `⛽ **${actor.login}** added label **${this.escape(label.name)}** to issue **#${pr.number}** (${this.escape(pr.title)})`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestLabeled;
