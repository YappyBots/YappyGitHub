const EventResponse = require('../EventResponse');

class MemberDeleted extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a user is removed from a repository`,
    });
  }
  embed(data) {
    const { member } = data;

    return {
      color: 'E9642D',
      title: `Removed ${member.login} as a collaborator`,
    };
  }
  text(data) {
    const { member, sender } = data;

    return [
      `🛠 **${sender.login}** removed ${sender.login} as a collaborator`,
      `<${member.html_url}>`,
    ];
  }
}

module.exports = MemberDeleted;
