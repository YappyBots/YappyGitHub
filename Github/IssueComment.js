module.exports = data => {
  let actor = data.sender;
  let action = data.action;
  let issue = data.issue;
  let comment = data.comment;

  let msg = `💬 `;

  if (action == 'deleted') {
    msg += `**${actor.login}** deleted a comment on issue **#${issue.number}** (${issue.title}) \n`;
  } else if (action == 'created') {
    msg += `**${actor.login}** commented on issue **#${issue.number}** (${issue.title}) \n`;
  } else if (action == 'edited') {
    msg += `**${actor.login}** edited a comment on issue **#${issue.number}** (${issue.title}) \n`;
  }

  msg += (action !== 'deleted' && comment ? `<${comment.html_url}>\n` : '');

  if (msg == `💬 `) msg = false;

  return msg;
}
