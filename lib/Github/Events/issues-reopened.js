const EventResponse = require('../EventResponse');

class IssueReopened extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Uh, oh. An issue got reopened!`,
    });
  }
  embed(data) {
    let issue = data.issue;
    let description = issue.body.slice(0, 370);
    if (description.lastIndexOf(' ') === description.length - 1) description = issue.body.slice(0, description.length - 1);
    let moreDots = issue.body.length > 370;
    return {
      color: 'E9642D',
      title: `Reopened issue #${issue.number}: \`${issue.title}\``,
      url: issue.html_url,
      description: `${description}${moreDots ? `... [Continue reading](${issue.html_url})` : ''}`,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    return [
      `🛠 **${actor.login}** reopened issue **#${issue.number}**: _${issue.title}_`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueReopened;
