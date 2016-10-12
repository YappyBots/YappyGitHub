const WebhookMember = (data) => {
  return {
    attachments: [{

      title: `Added \`${data.member.login}\` as a collaborator`,
      color: '#39CA74'

    }]
  }
}

module.exports = (data) => {
  let member = data.member;
  let actor = data.sender;

  let msg = `🙎 **${actor.login}** added **${member.login}** as a collaborator.`;

  return {
    str: msg,
    payload: data,
    webhook: WebhookMember(data)
  };
}
