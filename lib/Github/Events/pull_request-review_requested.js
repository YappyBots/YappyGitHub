const EventResponse = require('../EventResponse');

class PullRequestReviewRequested extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever a review is requested for a pull request.',
    });
  }
  embed(data) {
    const {
      pull_request: pr,
      requested_reviewer: reviewer,
    } = data;

    return {
      color: '#149617',
      title: `Requested a review from ${reviewer.login} for #${pr.number}`,
      url: pr.html_url,
    };
  }
  text(data) {
    const {
      sender: actor,
      pull_request: pr,
      requested_reviewer: reviewer,
    } = data;
    return [
      `⛽ **${actor.login}** requested a review from ${reviewer.login} for **#${pr.number}**`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestReviewRequested;
