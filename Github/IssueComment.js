const WebhookIssueComment = (data) => {
  let isCreated = data.action === 'created';
  let isDeleted = data.action === 'deleted';
  let isIssue = !data.issue.pull_request;

  let moreDots = data.issue.body.length > 200 ? '...' : '';

  return {
    attachments: [{
      title: `${isCreated ? 'Created' : (isDeleted ? 'Deleted' : '')} a comment on ${isIssue ? 'issue' : 'pull request'} #${data.issue.number}: **${data.issue.title}**`,
      title_link: data.comment.html_url,
      pretext: data.comment.body.split('\n')[0].slice(0, 200) + moreDots,

      color: (isIssue ? '#E48D64' : '#C0E4C0')
    }]
  }
}


module.exports = data => {
  let actor = data.sender;
  let action = data.action;
  let issue = data.issue;
  let comment = data.comment;
  let isComment = !issue.pull_request;

  if (data.action === 'edited') return false;

  let msg = `💬 `;

  if (action === 'deleted') {
    msg += `**${actor.login}** deleted a comment on ${isComment ? 'issue' : 'pull request'} **#${issue.number}** (${issue.title}) \n`;
  } else if (action === 'created') {
    msg += `**${actor.login}** commented on ${isComment ? 'issue' : 'pull request'} **#${issue.number}** (${issue.title}) \n`;
  }

  msg += (action !== 'deleted' && comment ? `<${comment.html_url}>\n` : '');

  if (msg == `💬 `) msg = false;

  return {
    str: msg,
    payload: data,
    webhook: WebhookIssueComment(data)
  };
}
