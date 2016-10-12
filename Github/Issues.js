const WebhookIssue = (payload) => {
  let action = payload.action[0].toUpperCase() + payload.action.slice(1, 99);
  let issue = payload.issue;
  let title = `${action} issue #${issue.number} (${issue.title})`;

  if (action == 'Edited') {
    title = `Renamed issue #${issue.number} to \`${issue.title}\``;
  } else if (action == 'Assigned') {
    title = `Assigned **${assigned.login}** to issue #${issue.number} (${issue.title}) \n`
  } else if (action == 'Unassigned') {
    title = `Unassigned **${assigned.login}** from issue #${issue.number} (${issue.title}) \n`
  }

  return {
    attachments: [{

      title,
      title_link: payload.issue.html_url,
      color: '#E9642D'

    }]
  }

}

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

  let msg = `🛠 **${actor.login}** unassigned ${actor.login === assigned.login ? 'themselves' : `**${assigned.login}**`} from **#${issue.number}** (${issue.title}) \n`;
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

  let str;

  if (payload.action == 'opened') str = OpenedIssue(payload);
  if (payload.action == 'closed') str = ClosedIssue(payload);
  if (payload.action == 'reopened') str = ReopenedIssue(payload);
  if (payload.action == 'assigned') str = AssignedIssue(payload);
  if (payload.action == 'unassigned') str = UnassignedIssue(payload);
  if (payload.action == 'labeled') str = LabeledIssue(payload);
  if (payload.action == 'unlabeled') str = UnlabeledIssue(payload);

  return {
    str, payload,
    webhook: WebhookIssue(payload)
  }

}
