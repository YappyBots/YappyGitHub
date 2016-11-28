const EventResponse = require('../EventResponse');

class Delete extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is fired whenever a branch is deleted.`,
    });
  }
  embed(data) {
    return {
      title: `Deleted branch \`${data.ref}\``,
      color: `FF9900`,
    };
  }
  text(data) {
    return [
      `🌲 **${data.sender.login}** created branch \`${data.ref}\``,
    ];
  }
}

module.exports = Delete;
