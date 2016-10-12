const WebhookPullRequest = (payload) => {
  let action = payload.action[0].toUpperCase() + payload.action.slice(1, 99);
  let pr = payload.pull_request;
  let title = `${action} pull request #${pr.number} (${pr.title})`;

  return {
    attachments: [{

      title,
      title_link: pr.html_url,
      color: '#149617'

    }]
  }

}

const OpenedPullRequest = data => {
  let actor = data.sender;
  let pr = data.pull_request;

  let msg = `⛽  **${actor.login}** opened pull request **#${pr.number}** \n`;
  msg += `        ${pr.title} \n`;
  msg += `<${pr.html_url}>\n`;

  return msg;
}
const ClosedPullRequest = data => {
  let actor = data.sender;
  let pr = data.pull_request;

  let msg = `⛽  **${actor.login}** closed pull request **#${pr.number}** (_${pr.title}_) \n`;
  msg += `<${pr.html_url}>\n`;

  return msg;
}
const ReopenedPullRequest = data => {
  let actor = data.sender;
  let pr = data.pull_request;

  let msg = `⛽  **${actor.login}** reopened pull request **#${pr.number}** (_${pr.title}_) \n`;
  msg += `<${pr.html_url}>\n`;

  return msg;
}

module.exports = data => {
  let action = data.action;
  let str;

  if (action === 'opened') str = OpenedPullRequest(data);
  if (action === 'closed') str = ClosedPullRequest(data);
  if (action === 'reopened') str = ReopenedPullRequest(data);
  if (!str) return false;

  return {
    str,
    payload: data,
    webhook: WebhookPullRequest(data)
  }
}
