const EventResponse = require('../EventResponse');

class IssueDemilestoned extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `An issue got removed from a milestone. RIP Goals!`,
    });
  }
  embed(data) {
    let issue = data.issue;
    return {
      color: 'E9642D',
      title: `Removed issue #${issue.number} (\`${issue.title}\`) from a milestone`,
      url: issue.html_url,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    return [
      `🛠 **${actor.login}** removed the milestone from issue **#${issue.number}** (${issue.title})`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueDemilestoned;
