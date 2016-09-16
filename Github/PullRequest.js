module.exports = payload => {
  let actor = payload.actor;
  let pr = payload.payload.pull_request;

  let msg = `⛽  **${actor.login}** ${payload.payload.action} pull request **#${pr.number}** \n`;
  msg += `        ${pr.title} \n`;
  msg += `<${pr.html_url}>`;

  return msg;
}
