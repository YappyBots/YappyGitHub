const EventResponse = require('../EventResponse');

class PullrequestClosed extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Weeee! An PR got closed!`,
    });
  }
  embed(data) {
    const pr = data.pull_request;

    return {
      color: '#149617',
      title: `${pr.merged ? 'Merged' : 'Closed'} pull request #${
        pr.number
      } (**${this.escape(pr.title)}**)`,
      url: pr.html_url,
      description: this.shorten(pr.body, 1000),
    };
  }
  text(data) {
    const actor = data.sender;
    const pr = data.pull_request;

    return [
      `⛽ **${actor.login}** ${
        pr.merged ? 'merged' : 'closed'
      } pull request **#${pr.number}** (_${this.escape(pr.title)}_)`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullrequestClosed;
