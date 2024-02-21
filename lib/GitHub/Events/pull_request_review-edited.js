const EventResponse = require('../EventResponse');

class PullRequestReviewEdited extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `A pull request review got edited. This may fire when creating a review, in which case the payload is ignored.`,
    });
  }
  embed(data) {
    const pr = data.pull_request;
    const review = data.review;
    const changes = Object.keys(data.changes);

    return {
      color: '#C0E4C0',
      title: `Updated ${changes.join(', ')} of a pull request review in #${
        pr.number
      } (**${this.escape(pr.title)}**)`,
      url: review.html_url,
    };
  }

  text(data) {
    const actor = data.sender;
    const pr = data.pull_request;
    const review = data.review;
    const changes = Object.keys(data.changes);

    return [
      `⛽ **${actor.login}** updated ${changes.join(
        ', '
      )} of a pull request review in **#${pr.number}** (${this.escape(
        pr.title
      )})`,
      `<${review.html_url}>`,
    ];
  }

  ignore(data) {
    return !Object.keys(data.changes).length;
  }
}

module.exports = PullRequestReviewEdited;
