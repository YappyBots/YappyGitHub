const EventResponse = require('../EventResponse');

class PullRequestReviewRequested extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever a review is requested for a pull request.',
    });
  }
  embed(data) {
    const { pull_request: pr } = data;
    const requestedReviewers = pr.requested_reviewers;

    return {
      color: '#149617',
      title: `Requested ${requestedReviewers.length === 1 ? 'a review' : 'reviews'} for #${pr.number} (\`${pr.title}\`)`,
      description: `From ${requestedReviewers.map(e => `[${e.login}](${e.html_url})`).join(', ')}`,
      url: pr.html_url,
    };
  }
  text(data) {
    const {
      sender: actor,
      pull_request: pr
    } = data;
    const requestedReviewers = pr.requested_reviewers;
    return [
      `⛽ **${actor.login}** requested ${requestedReviewers.length === 1 ? 'a review' : 'reviews'} for **#${pr.number}** (${pr.title})`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestReviewRequested;
