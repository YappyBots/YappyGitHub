const EventResponse = require('../EventResponse');

class IssueOpened extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Uh, oh. An issue got opened!`,
    });
  }
  embed(data) {
    const issue = data.issue;
    const description = issue.body;

    return {
      description,
      color: 'E9642D',
      title: `Opened issue #${issue.number}: \`${issue.title}\``,
      url: issue.html_url,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    return [
      `🛠 **${actor.login}** opened issue **#${issue.number}**: _${issue.title}_`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueOpened;
