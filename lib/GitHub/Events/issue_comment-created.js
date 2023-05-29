const EventResponse = require('../EventResponse');

class IssueCommentCreated extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired whenever an issue comment is created',
    });
  }

  embed(data) {
    const isIssue = !data.issue.pull_request;
    const body = data.comment.body;

    return {
      color: isIssue ? '#E48D64' : '#C0E4C0',
      title: `Created a comment on ${isIssue ? 'issue' : 'pull request'} #${
        data.issue.number
      }: **${this.escape(data.issue.title)}**`,
      url: data.comment.html_url,
      description: this.shorten(body, 1000),
    };
  }

  text(data) {
    const { issue, comment } = data;
    const actor = data.sender;
    const isComment = !issue.pull_request;

    return [
      `💬  **${actor.login}** commented on ${
        isComment ? 'issue' : 'pull request'
      } **#${issue.number}** (${this.escape(issue.title)})`,
      `<${comment.html_url}>`,
    ].join('\n');
  }
}

module.exports = IssueCommentCreated;
