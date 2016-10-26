const UrlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
const RemoveUrlEmbedding = (url) => `<${url}>`;

const WebhookPush = (data, info) => {
  let pretext = info.commits.map(commit => {
      let commitMessage = commit.message.split('\n')[0].replace(UrlRegEx, RemoveUrlEmbedding);
      let author = commit.committer.username || commit.author.username || info.actor.login;
      let sha = commit.id.slice(0, 7);

      return `[\`${sha}\`](${commit.url}) ${commitMessage} [${author}]`;
  });

  let hasExtraCommits = pretext.length > 5;
  pretext.length = hasExtraCommits ? 5 : pretext.length;

  let msg = pretext.join('\n');

  return {
    attachments: [{
      title: `Pushed ${info.commitCount} ${info.commitCount > 1 ? 'commits' : 'commit'} to \`${info.branch}\``,
      title_link: data.compare,
      pretext: msg,
      color: '#7289DA'
    }]
  }
}

module.exports = data => {
  let actor = data.sender || {};
  let branch = data.ref ? data.ref.split('/')[2] : 'unknown';
  let commits = data.commits || [];
  let commitCount = data.commits ? data.commits.length : 'unknown';
  let info = { actor, branch, commits, commitCount };

  if (!commitCount) return '';

  let msg = `⚡ **${actor.login}** pushed ${commitCount} commits to \`${branch}\``;

  let commitArr = commits.map(commit => {
    let commitMessage = commit.message.replace(/\n/g, '\n               ').replace(UrlRegEx, RemoveUrlEmbedding);
    return `        \`${commit.id.slice(0, 7)}\` ${commitMessage} [${commit.committer.username || commit.author.username || actor.login}]`;
  });

  commitArr.length = 5;

  msg += `\n` + commitArr.join('\n');
  msg += `\n<${data.compare}>`;


  return {
    str: msg,
    webhook: WebhookPush(data, info),
    payload: data
  };
}
