const EventResponse = require('../EventResponse');

class PullRequestReviewSubmitted extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired when a review is submitted to a pull request',
    });

    this.colors = {
      approved: '#149617',
      commented: '#C0E4C0',
    };
  }

  embed(data) {
    const { review, pull_request: pr } = data;

    return {
      color: this.colors[review.state?.toLowerCase()] ?? this.colors.commented,
      title: `${this.getReviewState(review, true)} #${
        pr.number
      } (**${this.escape(pr.title)}**)`,
      description: this.shorten(review.body, 1000),
      url: review.html_url,
    };
  }

  text(data) {
    const { sender, review, pull_request: pr } = data;

    return [
      `☑ **${sender.login}** ${this.getReviewState(review)} **#${
        pr.number
      }** (${this.escape(pr.title)})`,
      `<${review.html_url}>`,
    ].join('\n');
  }

  getReviewState(review, capitalize = false) {
    const response = review.state.split('_').reverse().join(' ').toLowerCase();

    return capitalize ? this.capitalize(response) : response;
  }
}

module.exports = PullRequestReviewSubmitted;
