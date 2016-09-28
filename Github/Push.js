const UrlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
const RemoveUrlEmbedding = (url) => `<${url}>`;

module.exports = data => {
  let actor = data.sender;
  let branch = data.ref.split('/')[2];
  let commits = data.commits;
  let commitCount = data.commits.length;

  if (!commitCount) return '';

  let msg = `⚡ **${actor.login}** pushed ${commitCount} commits to \`${branch}\`\n`;

  commits.forEach(commit => {
    let commitMessage = commit.message.replace(/\n/g, '\n               ').replace(UrlRegEx, RemoveUrlEmbedding);
    msg += `        \`${commit.id.slice(1, 7)}\` ${commitMessage} [${commit.committer.username || commit.author.username || actor.login}]\n`;
  });

  return msg;
}
