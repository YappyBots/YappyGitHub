const EventResponse = require('../EventResponse');

class PullRequestReviewRequested extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired whenever a review is requested for a pull request.',
    });
  }
  embed(data) {
    const { pull_request: pr, requested_reviewer, requested_team } = data;
    const reviewers = this.formatReviewer(requested_reviewer, requested_team);

    return {
      color: '#149617',
      title: `Requested a review from ${reviewers} for #${pr.number}`,
      url: pr.html_url,
    };
  }
  text(data) {
    const {
      sender: actor,
      pull_request: pr,
      requested_reviewer,
      requested_team,
    } = data;
    const reviewers = this.formatReviewer(requested_reviewer, requested_team);

    return [
      `⛽ **${actor.login}** requested a review from ${reviewers} for **#${pr.number}**`,
      `<${pr.html_url}>`,
    ];
  }

  formatReviewer(user, team) {
    if (user) return user.login;
    if (team) return team.slug;

    return '*Unknown*';
  }
}

module.exports = PullRequestReviewRequested;
