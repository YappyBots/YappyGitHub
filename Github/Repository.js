const WebhookRepository = (data) => {
  let action = data.action[0].toUpperCase() + data.action[0].slice(1, 99);

  return {
    attachments: [{
      title: `${action} the repo`,
      color: '#972E26'
    }]
  }
}

module.exports = (data) => {
  let actor = data.sender;
  let action = data.action;
  let repository = data.repository.full_name;
  let event = action;

  if (action === 'publicized') action = 'made the repo public';
  if (action === 'privatized') action = 'made the repo private';
  if (action === 'deleted') action = 'deleted the repo';

  let msg = `💿 **${actor.login}** ${action}`;

  return {
    str: msg,
    payload: data,
    webhook: WebhookRepository(data)
  };
}
