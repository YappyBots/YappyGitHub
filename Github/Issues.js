const OpenedIssue = payload => {
  let actor = payload.sender;
  let issue = payload.issue;

  let msg = `🛠 **${actor.login}** ${payload.action} issue **#${issue.number}** \n`;
  msg += `        ${issue.title} \n`;
  msg += `<${issue.html_url}>\n`;

  return msg;
}
const ClosedIssue = payload => {
  let actor = payload.sender;
  let issue = payload.issue;

  let msg = `🛠 **${actor.login}** closed issue **#${issue.number}** (${issue.title}) \n`;
  msg += `<${issue.html_url}>\n`;

  return msg;
}
const EditedIssue = payload => {
  let actor = payload.sender;
  let issue = payload.issue;
  let changes = payload.changes;

  if (!changes.title || !changes.title.from) return '';

  let msg = `🛠 **${actor.login}** renamed issue **#${issue.number}** to _${issue.title}_\n`;
  msg += `<${issue.html_url}>\n`;

  return msg;
}
const AssignedIssue = payload => {
  let actor = payload.sender;
  let issue = payload.issue;
  let assigned = payload.assignee;

  let msg = `🛠 **${actor.login}** assigned ${actor.login == assigned.login ? 'themselves' : `**${assigned.login}**`} to **#${issue.number}** (${issue.title}) \n`;
  msg += `<${issue.html_url}>\n`;

  return msg;
}
const UnassignedIssue = payload => {
  let actor = payload.sender;
  let issue = payload.issue;
  let assigned = payload.assignee;

  let msg = `🛠 **${actor.login}** unassigned ${actor.login == assigned.login ? 'themselves' : `**${assigned.login}**`} from **#${issue.number}** (${issue.title}) \n`;
  msg += `<${issue.html_url}>\n`;

  return msg;
}
const ReopenedIssue = payload => {
  let actor = payload.sender;
  let issue = payload.issue;

  let msg = `🛠 **${actor.login}** reopened issue **#${issue.number}** (${issue.title}) \n`;
  msg += `<${issue.html_url}>`;

  return msg;
}


module.exports = payload => {

  switch (payload.action) {
    case 'opened':
      return OpenedIssue(payload);
      break;
    case 'edited':
      return EditedIssue(payload);
      break;
    case 'closed':
      return ClosedIssue(payload);
      break;
    case 'reopened':
      return ReopenedIssue(payload);
      break;
    case 'assigned':
      return AssignedIssue(payload);
      break;
    case 'unassigned':
      return UnassignedIssue(payload);
      break;
    case 'labeled':
      return LabeledIssue(payload);
      break;
    case 'unlabeled':
      return UnlabeledIssue(payload);
      break;
    default:
      return payload;
      break;
  }

}
