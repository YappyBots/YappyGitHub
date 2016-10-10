module.exports = (data) => {
  let actor = data.sender;
  let sha = data.sha;
  let commit = data.commit;
  let url = data.target_url;
  let description = data.description;
  let state = data.state;
  let event = 'succeeded';

  if (data.context == 'github/pages' || description.indexOf('progress') >= 0) return false;

  if (state == 'failure') event = 'failed';
  if (state == 'error') event = 'errored';

  let msg = `📝 Commit \`${sha.slice(1, 7)}\`'s test `;

  if (description) {
    msg += `**${description}**`;
  } else {
    msg += `**${data.context}** ${event}`;
  }

  if (url) msg += `\n<${url}>`;

  return msg;
}
