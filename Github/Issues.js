const NormalActionIssue = payload => {
  let actor = payload.actor;
  let issue = payload.payload.issue;

  let msg = `:tools: **${actor.login}** ${payload.payload.action} issue **#${issue.number}** \n`;
  msg += `        ${issue.title} \n`;
  msg += `<${issue.html_url}>`;

  return msg;
}
const EditedIssue = payload => {
  let actor = payload.actor;
  let issue = payload.payload.issue;
  let changes = payload.payload.changes;

  let msg = `:tools: **${actor.login}** edited issue **#${issue.number}** \n`;

  for (change in changes) {
    console.log('Change', change);

    if (!changes.hasOwnProperty(change) || changes[change].from == changes[change].to) return false;
    let changed = changes[change];

    console.log('Changed', changed);
    msg += `        Edited ${change} from _${changed.from}_ to **${changed.to}** \n`;
  }

  msg += `<${issue.html_url}>`;

  return msg;
}
const AssignedIssue = payload => {
  let actor = payload.actor;
  let issue = payload.payload.issue;
  let assigned = payload.payload.assignee;

  let msg = `:tools: **${actor.login}** assigned ${actor.login == assigned.login ? 'themselves' : `**${assigned.login}**`} to **#${issue.number}** (${issue.title}) \n`;
  msg += `<${issue.html_url}>`;

  return msg;
}
// const ReopenedIssue = payload => {
//   let actor = payload.actor;
//   let issue = payload.payload.issue;
//
//   let msg = `:tools: **${actor.login}** reopened issue **#${issue.number}** \n`;
//   msg += `        ${issue.title} \n`;
//   msg += `<${issue.html_url}>`;
//
//   return msg;
// }


module.exports = payload => {

  switch (payload.payload.action) {
    case 'opened':
      return NormalActionIssue(payload);
      break;
    case 'edited':
      return EditedIssue(payload);
      break;
    case 'closed':
      return NormalActionIssue(payload);
      break;
    case 'reopened':
      return NormalActionIssue(payload);
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
