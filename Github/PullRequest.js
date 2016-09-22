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
const SynchronizedPullRequest = data => {
  let actor = data.sender;
  let pr = data.pull_request;

  let msg = `⛽ **${actor.login}** updated pull request **#${pr.number}** (_${pr.title}_) with new commits\n`;
  msg += `<${pr.html_url}>`;

  return msg;
}

module.exports = data => {
  let action = data.action;

  switch (action) {
    case 'opened': {
      return OpenedPullRequest(data);
      break;
    }
    case 'closed': {
      return ClosedPullRequest(data);
      break;
    }
    case 'reopened': {
      return ReopenedPullRequest(data);
      break;
    }
    case 'synchronize': {
      return SynchronizedPullRequest(data);
      break;
    }
    default: {
      return '';
    }
  }
}
