const EventResponse = require('../EventResponse');

class IssueMilestoned extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `An issue got added to a milestone. Goals!`,
    });
  }
  embed(data) {
    let issue = data.issue;
    let milestone = issue.milestone;
    return {
      color: 'E9642D',
      title: `Added issue #${issue.number} (\`${issue.title}\`) to milestone **${milestone.title}**`,
      url: issue.html_url,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    let milestone = issue.milestone;
    return [
      `🛠 **${actor.login}** added issue **#${issue.number}** (${issue.title}) to milestone \`${milestone.title}\``,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueMilestoned;
