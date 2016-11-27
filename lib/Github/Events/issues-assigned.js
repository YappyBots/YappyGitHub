const EventResponse = require('../EventResponse');

class IssueAssigned extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Shoot! I got assigned to this issue, gotta close it.`,
    });
  }
  embed(data) {
    let issue = data.issue;
    let assigned = data.assignee;
    return {
      color: 'E9642D',
      title: `Assigned ${assigned.login} to #${issue.number} (\`${issue.title}\`)`,
      url: issue.html_url,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    let assigned = data.assignee;
    return [
      `🛠 **${actor.login}** assigned ${actor.login === assigned.login ? 'themselves' : `**${assigned.login}**`} to **#${issue.number}** (${issue.title})`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueAssigned;
