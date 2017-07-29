const EventResponse = require('../EventResponse');

class PullRequestEdited extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `An issue got edited. Good or Bad?.`,
    });
  }
  embed(data) {
    const pr = data.pull_request;
    const change = Object.keys(data.changes)[0];
    const changed = {
      from: data.changes[change].from,
      to: data.changes[change].to || pr[change],
    };
    const description = changed.to.slice(0, 150).trim();
    const moreDots = changed.to.length > 150;

    return {
      color: '#149617',
      title: `Updated ${change} of pull request #${pr.number} (\`${change === 'title' ? changed.from : pr.title}\`)`,
      description: `${description}${moreDots ? `... [Continue reading](${pr.html_url})` : ''}`,
      url: pr.html_url,
    };
  }
  text(data) {
    const actor = data.sender;
    const pr = data.pull_request;
    const change = Object.keys(data.changes)[0];
    return [
      `⛽ **${actor.login}** updated ${change} of pull request **#${pr.number}** (${pr.title})`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestEdited;
