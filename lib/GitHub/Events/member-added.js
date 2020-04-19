const EventResponse = require('../EventResponse');

class MemberAdded extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a user is added to a repository`,
    });
  }
  embed(data) {
    const { member } = data;

    return {
      color: 'E9642D',
      title: `Added ${member.login} as a collaborator`,
    };
  }
  text(data) {
    const { member, sender } = data;

    return [
      `👨‍🔧 **${sender.login}** added ${sender.login} as a collaborator`,
      `<${member.html_url}>`,
    ];
  }
}

module.exports = MemberAdded;
