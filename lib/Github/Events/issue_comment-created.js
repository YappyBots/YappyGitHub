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

    return {
      color: isIssue ? '#E48D64' : '#C0E4C0',
      title: `Created a comment on ${isIssue ? 'issue' : 'pull request'} #${
        data.issue.number
      }: **${data.issue.title}**`,
      url: data.comment.html_url,
      description: data.comment.body.slice(0, 2048),
    };
  }

  text(data) {
    const { issue, comment } = data;
    const actor = data.sender;
    const isComment = !issue.pull_request;

    return [
      `💬  **${actor.login}** commented on ${
        isComment ? 'issue' : 'pull request'
      } **#${issue.number}** (${issue.title})`,
      `<${comment.html_url}>`,
    ].join('\n');
  }
}

module.exports = IssueCommentCreated;
