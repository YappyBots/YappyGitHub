const EventResponse = require('../EventResponse');

class IssueCommentDeleted extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever an issue comment is deleted',
    });
  }

  embed(data) {
    const isIssue = !data.issue.pull_request;
    const body = data.comment.body;

    return {
      color: isIssue ? '#E48D64' : '#C0E4C0',
      title: `Deleted a comment on ${isIssue ? 'issue' : 'pull request'} #${data.issue.number}: **${data.issue.title}**`,
      title_link: data.issue.html_url,
      description: body ? body.slice(0, 200) : '',
    };
  }

  text(data) {
    const { issue, comment } = data;
    const actor = data.sender;
    const isComment = !issue.pull_request;

    return [
      `💬  **${actor.login}** deleted a comment on ${isComment ? 'issue' : 'pull request'} **#${issue.number}** (${issue.title})`,
      `<${issue.html_url}>`,
    ].join('\n');
  }
}

module.exports = IssueCommentDeleted;
