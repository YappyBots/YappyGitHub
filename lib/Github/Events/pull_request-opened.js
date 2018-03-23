const EventResponse = require('../EventResponse');

class PullRequestOpened extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Uh, oh. A PR got opened!`,
    });
  }
  embed(data) {
    const pr = data.pull_request;

    return {
      color: '#149617',
      title: `Opened pull request #${pr.number}: \`${pr.title}\``,
      url: pr.html_url,
      description: pr.body,
      fields: [{
        name: 'Commits',
        value: pr.commits,
        inline: true,
      }, {
        name: 'Changes',
        value: `\`+${pr.additions}\` \`-${pr.deletions}\` (${pr.changed_files} ${pr.changed_files > 1 ? 'files' : 'file'})`,
        inline: true,
      }],
    };
  }
  text(data) {
    const actor = data.sender;
    const pr = data.pull_request;
    return [
      `⛽ **${actor.login}** opened pull request **#${pr.number}**: _${pr.title}_`,
      `<${pr.html_url}>`,
    ];
  }
}

module.exports = PullRequestOpened;
