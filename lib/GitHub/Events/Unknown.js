const EventResponse = require('../EventResponse');

class Unkown extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is shown whenever an event fired isn't found.`,
    });
  }
  embed(data, e) {
    const action = data.action ? `/${data.action}` : '';
    const event = `${e}${action}`;

    return {
      color: 'danger',
      title: `Repository sent unknown event: \`${event}\``,
      description: `This most likely means the developers have not gotten to styling this event.\nDisable it by adding it to the event blacklist with \`G! conf filter events add ${event}\`.`,
    };
  }
  text(data, e) {
    const action = data.action ? `/${data.action}` : '';
    const event = `${e}${action}`;

    return [
      `An unknown event (\`${event}\`) has been emitted from repository **${data.repository.full_name}**.`,
      `Disable it by adding it to the event blacklist with \`G! conf filter events add ${event}\`.`,
    ];
  }
}

module.exports = Unkown;
