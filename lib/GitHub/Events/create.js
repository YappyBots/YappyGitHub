const EventResponse = require('../EventResponse');

class Create extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a branch is created.`,
    });
  }
  embed(data) {
    return {
      title: `Created ${data.ref_type} \`${data.ref}\` from \`${data.master_branch}\``,
      color: `FF9900`,
    };
  }
  text(data) {
    return [
      `🌲 **${data.sender.login}** created ${data.ref_type} \`${data.ref}\` (from \`${data.master_branch}\`)`,
    ];
  }
}

module.exports = Create;
