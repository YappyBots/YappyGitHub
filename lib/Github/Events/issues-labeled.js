const EventResponse = require('../EventResponse');

class IssueLabeled extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `An issue got labeled. Organization!`,
    });
  }
  embed(data) {
    let issue = data.issue;
    let label = data.label;
    return {
      color: 'E9642D',
      title: `Added label **${label.name}** to #${issue.number} (\`${issue.title}\`)`,
      url: issue.html_url,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    let label = data.label;
    return [
      `🛠 **${actor.login}** added label **${label.name}** to issue **#${issue.number}** (${issue.title})`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueLabeled;
