const Collection = require('../lib/Collection');
const Log = require('../lib/Logger').Logger;


let statuses = new Collection();

module.exports = (data) => {
  let actor = data.sender;
  let sha = data.sha;
  let commit = data.commit;
  let url = data.target_url;
  let description = data.description;
  let state = data.state;
  let event = 'succeeded';

  // if (data.context == 'github/pages') return false;

  if (state == 'failure') event = 'failed';
  if (state == 'error') event = 'errored';

  let msg = `📝 Commit \`${sha.slice(0, 7)}\`'s test `;

  if (description) {
    msg += `**${description}** (_${data.context}_)`;
  } else {
    msg += `**${data.context}** ${event}`;
  }

  if (url) msg += `\n<${url}>`;

  if (statuses.has(sha)) {
    let oldMsg = statuses.get(sha);
    let str = msg;

    return {
      str,
      context: data.context,
      sha: sha.slice(0, 7)
    }
  }

  statuses.set(sha, msg);
  return msg;
}
