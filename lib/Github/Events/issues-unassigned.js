const EventResponse = require('../EventResponse');

class IssueUnassigned extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Weeee! I got unassigned from an issue! Responsibility lifted.`,
    });
  }
  embed(data) {
    let issue = data.issue;
    let assigned = data.assignee;
    return {
      color: 'E9642D',
      title: `Unassigned ${assigned.login} from #${issue.number} (\`${issue.title}\`)`,
      url: issue.html_url,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    let assigned = data.assignee;
    return [
      `🛠 **${actor.login}** unassigned ${actor.login === assigned.login ? 'themselves' : `**${assigned.login}**`} from **#${issue.number}** (${issue.title})`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueUnassigned;
