const EventResponse = require('../EventResponse');

const message = (event) =>
  `Add this event to the blacklist with \`G! conf filter events add ${event}\` or disable these messages with \`G! conf set ignoreUnknown true\`.`;

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
      description: [
        'This most likely means the developers have not gotten to styling this event.',
        message(event),
      ].join('\n'),
    };
  }
  text(data, e) {
    const action = data.action ? `/${data.action}` : '';
    const event = `${e}${action}`;

    return [
      `An unknown event (\`${event}\`) has been emitted from repository **${data.repository.full_name}**.`,
      message(event),
    ];
  }
}

module.exports = Unkown;
