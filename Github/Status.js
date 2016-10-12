const Collection = require('../lib/Collection');
const Log = require('../lib/Logger').Logger;

let statuses = new Collection();

const WebhookStatus = (data, str) => {

  let body = {
    username: 'Yappy',
    attachments: []
  }

  body.attachments[0] = {
    fallback: str,

    // Author
    // author_name: data.sender.login,
    // author_link: data.sender.html_url,
    // author_icon: data.sender.avatar_url,

    // Data
    title: `${data.description || data.context} (${data.state})`,
    title_link: data.target_url || '',
    pretext: `Test for commit \`${data.sha.slice(0, 7)}\` ${data.state}`,
    color: data.state == 'success' ? 'good' : 'warning',

    // Footer
    // footer: data.repository.name,
    // footer_icon: data.repository.owner.avatar_url
  }

  Log.debug(body);

  return body;
}

module.exports = (data) => {
  let actor = data.sender;
  let sha = data.sha;
  let commit = data.commit;
  let url = data.target_url;
  let description = data.description;
  let state = data.state;
  let event = 'succeeded';

  if (state === 'failure') event = 'failed';
  if (state === 'error') event = 'errored';

  let msg = `📝 Commit \`${sha.slice(0, 7)}\`'s test `;

  if (description) {
    msg += `**${description}** (_${data.context}_)`;
  } else {
    msg += `**${data.context}** ${event}`;
  }

  if (url) msg += `\n<${url}>`;

  // if (statuses.has(sha)) {
  //   let str = msg;

  return {
    str: msg,
    payload: data,
    webhook: WebhookStatus(data, msg),
  }
  // }
  //
  // statuses.set(sha, msg);
  // return msg;
}
