const EventResponse = require('../EventResponse');

class Create extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a branch is created.`,
    });
  }

  embed(data) {
    const { ref_type, ref, master_branch } = data;

    return {
      title: `Created ${ref_type} \`${ref}\` from \`${master_branch}\``,
      color: `FF9900`,
      url: `${data.repository.html_url}/tree/${ref}`,
    };
  }

  text(data) {
    const { ref_type, ref, master_branch, sender } = data;

    return [
      `🌲 **${sender.login}** created ${ref_type} \`${ref}\` (from \`${master_branch}\`)`,
    ];
  }
}

module.exports = Create;
