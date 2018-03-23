const EventResponse = require('../EventResponse');

class PullRequestReopened extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever a pull request is reopened.',
    });
  }
  embed(data) {
    const pr = data.pull_request;

    return {
      color: '#149617',
      title: `Reopened pull request #${pr.number}: \`${pr.title}\``,
      url: pr.html_url,
      description: pr.body.slice(1, 1000),
    };
  }
  text(data) {
    const {
      sender: actor,
      pull_request: pr,
    } = data;

    return [
      `⛽ **${actor.login}** reopened pull request **#${pr.number}**: _${pr.title}_`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestReopened;
