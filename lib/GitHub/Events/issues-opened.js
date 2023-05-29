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
      color: 'E9642D',
      title: `Opened issue #${issue.number} (**${this.escape(issue.title)}**)`,
      url: issue.html_url,
      description: this.shorten(description, 1000),
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    return [
      `🛠 **${actor.login}** opened issue **#${issue.number}**: **${this.escape(
        issue.title
      )}**`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueOpened;
