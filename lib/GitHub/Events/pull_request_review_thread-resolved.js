const EventResponse = require('../EventResponse');

class PullRequestReviewThreadResolved extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired when a review thread is resolved in a pull request',
    });
  }

  embed(data) {
    const { thread, pull_request: pr } = data;
    const url = thread.comments[0]?.html_url;

    return {
      color: '#C0E4C0',
      title: `Resolved a review thread in #${pr.number} (**${this.escape(
        pr.title
      )}**)`,
      url,
    };
  }

  text(data) {
    const { sender, thread, pull_request: pr } = data;
    const url = thread.comments[0]?.html_url;

    return [
      `**${sender.login}** resolved a review thread in **#${
        pr.number
      }** (${this.escape(pr.title)})`,
      `<${url}>`,
    ].join('\n');
  }
}

module.exports = PullRequestReviewThreadResolved;
