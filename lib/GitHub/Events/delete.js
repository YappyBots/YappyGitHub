const EventResponse = require('../EventResponse');

class Delete extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a branch is deleted.`,
    });
  }
  embed(data) {
    const { ref_type, ref } = data;

    return {
      title: `Deleted ${ref_type} \`${ref}\``,
      color: `FF9900`,
    };
  }
  text(data) {
    const { ref_type, ref, sender } = data;

    return [
      `🌲 **${sender.login}** deleted ${ref_type} \`${ref}\``,
    ];
  }
}

module.exports = Delete;
