module.exports = payload => {
  let actor = payload.actor;
  let action = payload.payload.action;
  let issue = payload.payload.issue;
  let comment = payload.payload.comment;

  let msg = `💬 `;

  if (action == 'deleted') {
    msg += `**${actor.login}** deleted a comment on issue **#${issue.number}** (${issue.title}) \n`;
  } else if (action == 'created') {
    msg += `**${actor.login}** commented on issue **#${issue.number}** (${issue.title}) \n`;
  } else if (action == 'edited') {
    msg += `**${actor.login}** edited a comment on issue **#${issue.number}** (${issue.title}) \n`;
  }

  msg += (action !== 'deleted' ? `<${comment.html_url}>` : '');

  return msg;
}
