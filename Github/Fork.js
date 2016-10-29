const WebhookFork = (data, str) => {
  let starred = data.action === 'started';

  return {
    attachments: [{

      title: `Forked repo => ${data.forkee.full_name}`,
      title_link: data.forkee.html_url

    }]
  }
}

module.exports = (payload) => {
  let str =  `🍝 **${payload.sender.login}** forked ${payload.repository.full_name}`;

  return {
    str, payload,
    webhook: WebhookFork(payload, str)
  }
}
