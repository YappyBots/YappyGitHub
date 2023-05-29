const EventResponse = require('../EventResponse');

class IssueEdited extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `An issue got edited. Good or Bad?.`,
    });
  }
  embed(data) {
    const issue = data.issue;
    const change = Object.keys(data.changes)[0];
    const changed = {
      from: data.changes[change].from,
      to: data.changes[change].to || issue[change],
    };

    return {
      color: 'E9642D',
      title: `Updated ${change} of issue #${issue.number} (**${
        this.escape(change === 'title' ? changed.from : issue.title)
      }**)`,
      description: this.shorten(changed.to, 200),
      url: issue.html_url,
    };
  }
  text(data) {
    const actor = data.sender;
    const issue = data.issue;
    const change = Object.keys(data.changes)[0];

    return [
      `🛠 **${actor.login}** updated ${change} of **#${issue.number}** (${this.escape(issue.title)})`,
      `<${issue.html_url}>`,
    ];
  }
}

module.exports = IssueEdited;
