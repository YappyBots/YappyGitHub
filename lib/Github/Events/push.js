const EventResponse = require('../EventResponse');
const UrlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const RemoveUrlEmbedding = (url) => `<${url}>`;

class Push extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This event is fired when someone pushes commits to a branch.`,
    });
  }
  embed(data) {
    const branch = data.ref ? data.ref.split('/')[2] : 'unknown';
    const commits = data.commits || [];
    let pretext = commits.map(commit => {
      let commitMessage = commit.message.split('\n')[0].replace(UrlRegEx, RemoveUrlEmbedding);
      let author = commit.author.username || commit.committer.name || commit.committer.username || data.actor.login;
      let sha = commit.id.slice(0, 7);
      return `[\`${sha}\`](${commit.url}) ${commitMessage} [${author}]`;
    });

    pretext.length = commits.length > 5 ? 5 : pretext.length;

    let description = pretext.join('\n');
    return {
      color: '7289DA',
      title: `Pushed ${commits.length} ${commits.length !== 1 ? 'commits' : 'commit'} to \`${branch}\``,
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
    let msg = `⚡ **${actor.login}** pushed ${commitCount} ${commitCount !== 1 ? 'commits' : 'commit'} to \`${branch}\``;
    let commitArr = commits.map(commit => {
      let commitMessage = commit.message.replace(/\n/g, '\n               ').replace(UrlRegEx, RemoveUrlEmbedding);
      return `        \`${commit.id.slice(0, 7)}\` ${commitMessage} [${commit.author.username || commit.committer.name || commit.committer.username || data.actor.login}]`;
    });
    commitArr.length = data.commits.length > 5 ? 5 : commitArr.length;
    msg += `\n${commitArr.join('\n')}`;
    msg += `\n<${data.compare}>`;

    return msg;
  }
}

module.exports = Push;
