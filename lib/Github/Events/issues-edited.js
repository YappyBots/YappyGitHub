const EventResponse = require('../EventResponse');

class IssueEdited extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `An issue got edited. Good or Bad?.`,
    });
  }
  embed(data) {
    let issue = data.issue;
    let change = Object.keys(data.changes)[0];
    let changed = {
      from: data.changes[change].from,
      to: data.changes[change].to || issue[change],
    };
    let description = changed.to.slice(0, 150);
    if (description.lastIndexOf(' ') === description.length - 1) description = description.slice(0, description.length - 1);
    let moreDots = changed.to.length > 150;
    return {
      color: 'E9642D',
      title: `Updated ${change} of issue #${issue.number} (\`${change === 'title' ? changed.from : issue.title}\`)`,
      description: `${description}${moreDots ? `... [Continue reading](${issue.html_url})` : ''}`,
      url: issue.html_url,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    let change = Object.keys(data.changes)[0];
    return [
      `🛠 **${actor.login}** updated ${change} of **#${issue.number}** (${issue.title})`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueEdited;
