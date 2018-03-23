const EventResponse = require('../EventResponse');

class IssueReopened extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Uh, oh. An issue got reopened!`,
    });
  }
  embed(data) {
    const { body, number, title, html_url } = data.issue;

    return {
      color: 'E9642D',
      title: `Reopened issue #${number}: \`${title}\``,
      url: html_url,
      description: body,
    };
  }
  text(data) {
    const { sender: actor, issue } = data;

    return [
      `🛠 **${actor.login}** reopened issue **#${issue.number}**: _${issue.title}_`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueReopened;
