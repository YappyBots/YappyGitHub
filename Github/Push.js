module.exports = payload => {
  let actor = payload.actor;
  let branch = payload.payload.ref.split('/')[2];
  let commits = payload.payload.commits;
  let commitCount = payload.payload.size;

  let msg = `⚡ **${actor.login}** pushed ${commitCount} commits to \`${branch}\`\n`;

  commits.forEach(commit => {
    msg += `        \`${commit.sha.slice(1, 7)}\` ${commit.message.replace('\n', '\n          ')} [${commit.author.username || actor.login}]\n`;
  });

  return msg;
}
