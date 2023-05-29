const EventResponse = require('../EventResponse');

class IssueUnabeled extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `An issue got unlabeled. Organization!`,
    });
  }
  embed(data) {
    let issue = data.issue;
    let label = data.label;
    return {
      color: 'E9642D',
      title: `Removed label **${this.escape(label.name)}** from #${issue.number} (**${this.escape(issue.title)}**)`,
      url: issue.html_url,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    let label = data.label;
    return [
      `🛠 **${actor.login}** removed label **${this.escape(label.name)}** from **#${issue.number}** (**${this.escape(issue.title)}**)`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueUnabeled;
