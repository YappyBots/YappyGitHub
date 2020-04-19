const EventResponse = require('../EventResponse');
const { removeUrlEmbedding } = require('../../Util');

class Push extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This event is fired when someone pushes commits to a branch.`,
    });
  }
  embed(data) {
    const branch = data.ref ? data.ref.split('/')[2] : 'unknown';
    const commits = data.commits || [];
    let pretext = commits.map((commit) => {
      let commitMessage = commit.message.split('\n')[0];
      let author =
        commit.author.username ||
        commit.committer.name ||
        commit.committer.username ||
        data.actor.login;
      let sha = commit.id.slice(0, 7);
      return `[\`${sha}\`](${commit.url}) ${this.shorten(
        commitMessage,
        500
      )} [${author}]`;
    });

    for (let i = 0; i < pretext.length; i++) {
      if (pretext.slice(0, i + 1).join('\n').length > 2048) {
        pretext = pretext.slice(0, i || 1);
        break;
      }
    }

    let description = pretext.join('\n');
    return {
      color: '7289DA',
      title: `Pushed ${commits.length} ${
        commits.length !== 1 ? 'commits' : 'commit'
      } to \`${branch}\``,
      url: data.compare,
      description,
    };
  }
  text(data) {
    const actor = data.sender || {};
    const branch = data.ref ? data.ref.split('/')[2] : 'unknown';
    const commits = data.commits || [];
    const commitCount = data.commits ? data.commits.length : 'unknown';
    if (!commitCount) return '';
    let msg = `⚡ **${actor.login}** pushed ${commitCount} ${
      commitCount !== 1 ? 'commits' : 'commit'
    } to \`${branch}\``;
    let commitArr = commits.map((commit) => {
      let commitMessage = removeUrlEmbedding(
        commit.message.replace(/\n/g, '\n               ')
      );
      return `        \`${commit.id.slice(0, 7)}\` ${commitMessage} [${
        commit.author.username ||
        commit.committer.name ||
        commit.committer.username ||
        data.actor.login
      }]`;
    });
    commitArr.length = data.commits.length > 5 ? 5 : commitArr.length;
    msg += `\n${commitArr.join('\n')}`;
    msg += `\n<${data.compare}>`;

    return msg;
  }

  ignore(data) {
    return !data.commits || !data.commits.length;
  }
}

module.exports = Push;
