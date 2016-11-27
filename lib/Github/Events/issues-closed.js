const EventResponse = require('../EventResponse');

class IssueOpened extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Weeee! An issue got closed!`,
    });
  }
  embed(data) {
    let issue = data.issue;
    let description = issue.body.slice(0, 150);
    if (description.lastIndexOf(' ') === description.length - 1) description = issue.body.slice(0, description.length - 1);
    let moreDots = issue.body.length > 150;
    return {
      color: 'E9642D',
      title: `Closed issue #${issue.number}: \`${issue.title}\``,
      url: issue.html_url,
      description: `${description}${moreDots ? `... [Continue reading](${issue.html_url})` : ''}`,
    };
  }
  text(data) {
    let actor = data.sender;
    let issue = data.issue;
    return [
      `🛠 **${actor.login}** closed issue **#${issue.number}**: _${issue.title}_`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueOpened;
