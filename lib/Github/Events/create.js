const EventResponse = require('../EventResponse');

class Create extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a branch is created.`,
    });
  }
  embed(data) {
    return {
      title: `Created branch \`${data.ref}\` from _${data.master_branch}_`,
      color: `FF9900`,
    };
  }
  text(data) {
    return [
      `🌲 **${data.sender.login}** created branch \`${data.ref}\` (from _${data.master_branch}_)`,
    ];
  }
}

module.exports = Create;
