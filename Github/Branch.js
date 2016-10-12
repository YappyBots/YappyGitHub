const WebhookBranch = (action, payload) => {
  let isCreated = action === 'create';
  let actionText = isCreated ? 'Created' : 'Deleted';

  return {
    attachments: [{

      title: `${actionText} branch \`${payload.ref}\` ${isCreated ? `(from _${payload.master_branch})` : ''}`,
      title_link: `${isCreated ? payload.compare : payload.repository.html_url}`,
      color: '#ff9900'

    }]
  }
}

const CreateBranch = (payload) => {
  let actor = payload.sender;
  let branch = payload.ref;
  let origin_branch = payload.master_branch;

  return `🌲 **${actor.login}** created branch \`${payload.ref}\` (from _${origin_branch}_)`;
}
const DeleteBranch = (payload) => {
  let actor = payload.sender;
  let branch = payload.ref;

  return `🌲 **${actor.login}** deleted branch \`${branch}\``;
}

module.exports = (action, payload) => {
  if (payload.ref_type !== 'branch') return false;

  let str;

  if (action == 'create') str = CreateBranch(payload);
  if (action == 'delete') str = DeleteBranch(payload);

  return {
    str, payload,
    webhook: WebhookBranch(action, payload)
  }
}
