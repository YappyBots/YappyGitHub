const WebhookWatch = (data, str) => {
  let starred = data.action === 'started';

  return {
    attachments: [{

      title: `${starred ? 'Added' : 'Removed'} star`,
      title_link: data.repository.html_url

    }]
  }
}

module.exports = payload => {
  let starred = payload.action === 'started';
  let str = `⭐ **${payload.sender.login}** ${starred ? 'starred' : 'unstarred'} ${payload.repository.full_name}`;

  return {
    str, payload,
    webhook: WebhookWatch(payload, str),
  }
}
