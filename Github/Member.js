module.exports = (data) => {
  let member = data.member;
  let actor = data.sender;

  let msg = `🙎 **${actor.login}** added **${member.login}** as a collaborator.`;

  return msg;
}
