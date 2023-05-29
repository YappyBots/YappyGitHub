const EventResponse = require('../EventResponse');

class IssueOpened extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Weeee! An issue got closed!`,
    });
  }
  embed(data) {
    const issue = data.issue;
    const description = issue.body;

    return {
      description: this.shorten(description, 500),
      color: 'E9642D',
      title: `Closed issue #${issue.number} (**${this.escape(issue.title)}**)`,
      url: issue.html_url,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    return [
      `🛠 **${actor.login}** closed issue **#${issue.number}**: **${this.escape(issue.title)}**`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueOpened;
