const EventResponse = require('../EventResponse');

class PullRequestReviewCommentCreated extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired when a review comment is created in a pull request',
    });
  }

  embed(data) {
    const { comment, pull_request: pr } = data;

    return {
      color: '#C0E4C0',
      title: `Commented on file \`${comment.path}\` for a review in #${
        pr.number
      } (**${this.escape(pr.title)}**)`,
      description: this.shorten(comment.body, 1000),
      url: comment.html_url,
    };
  }

  text(data) {
    const { sender, comment, pull_request: pr } = data;

    return [
      `**${sender.login}** commented on file \`${
        comment.path
      }\` for a review in **#${pr.number}** (${this.escape(pr.title)})`,
      `<${comment.html_url}>`,
    ].join('\n');
  }
}

module.exports = PullRequestReviewCommentCreated;
