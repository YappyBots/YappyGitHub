const EventResponse = require('../EventResponse');

class PullRequestReviewRequestRemoved extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever a review request is removed from a pull request.',
    });
  }
  embed(data) {
    const {
      pull_request: pr,
      requested_reviewer: reviewer,
    } = data;

    return {
      color: '#149617',
      title: `Removed a review request from ${reviewer.login} from #${pr.number}`,
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
      `⛽ **${actor.login}** removed a review request from ${reviewer.login} from **#${pr.number}**`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestReviewRequestRemoved;
