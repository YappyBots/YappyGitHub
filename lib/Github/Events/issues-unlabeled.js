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
      title: `Removed label **${label.name}** from #${issue.number} (\`${issue.title}\`)`,
      url: issue.html_url,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    let label = data.label;
    return [
      `🛠 **${actor.login}** removed label **${label.name}** from issue **#${issue.number}**: _${issue.title}_`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueUnabeled;
