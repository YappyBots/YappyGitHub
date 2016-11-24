const EventResponse = require('../EventResponse');

class UnkownEventResponse extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is shown whenever an event fired isn't found.`,
    });
  }
  embed(data, e) {
    return {
      color: 'danger',
      title: `Repository sent unknown event: \`${e}\``,
      description: `This most likely means the developers have not gotten to styling this event.\nYou may want to disable this event if you don't want it with \`G! conf disable ${e}\``,
    };
  }
  text(data, e) {
    return [
      `An unknown event has been emitted from repository **${data.repository.full_name}**.`,
      'This most likely means the developers have not gotten to styling this event.',
      `The event in question was \`${e}\``,
    ];
  }
}

module.exports = UnkownEventResponse;
