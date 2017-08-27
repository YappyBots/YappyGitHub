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
      requested_reviewer: requestedReviewer,
    } = data;

    return {
      color: '#149617',
      title: `Removed request for a review for #${pr.number} (\`${pr.title}\`)`,
      description: `From [${requestedReviewer.login}](${requestedReviewer.html_url})`,
      url: pr.html_url,
    };
  }
  text(data) {
    const {
      sender: actor,
      pull_request: pr,
    } = data;
    return [
      `⛽ **${actor.login}** removed request for a review for **#${pr.number}** (${pr.title})`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestReviewRequestRemoved;
