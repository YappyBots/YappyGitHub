const EventResponse = require('../EventResponse');

class IssueCommentDeleted extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired whenever an issue comment is deleted',
    });
  }

  embed(data) {
    const isIssue = !data.issue.pull_request;
    const body = data.comment.body;

    return {
      color: isIssue ? '#E48D64' : '#C0E4C0',
      title: `Deleted a comment on ${isIssue ? 'issue' : 'pull request'} #${
        data.issue.number
      }: **${data.issue.title}**`,
      url: data.issue.html_url,
      description: this.shorten(body, 200),
    };
  }

  text(data) {
    const { issue, sender: actor } = data;
    const isComment = !issue.pull_request;

    return [
      `💬  **${actor.login}** deleted a comment on ${
        isComment ? 'issue' : 'pull request'
      } **#${issue.number}** (${issue.title})`,
      `<${issue.html_url}>`,
    ].join('\n');
  }
}

module.exports = IssueCommentDeleted;
