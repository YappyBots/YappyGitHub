const EventResponse = require('../EventResponse');

const message = (event) =>
  `Add this event to the blacklist with \`/conf filter type:events action:Add Item item:${event}\` or disable these messages with \`/conf option channel item:ignoreUnknown value:false\`.`;

class Unkown extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This response is shown whenever an event fired isn't found.`,
    });
  }
  embed(data, e) {
    const action = data.action ? `/${data.action}` : '';
    const event = `${e}${action}`;

    const isRepository = !!data.repository;

    return {
      color: 'danger',
      title: `${
        isRepository ? 'Repository' : 'Installation'
      } sent unknown event: \`${event}\``,
      description: [
        'This most likely means the developers have not gotten to styling this event.',
        message(event),
      ].join('\n'),
    };
  }
  text(data, e) {
    const action = data.action ? `/${data.action}` : '';
    const event = `${e}${action}`;

    const type = data.repository ? 'repository' : 'installation';
    const name =
      data.repository?.full_name ||
      data.installation?.account?.login ||
      'unknown';

    return [
      `An unknown event (\`${event}\`) has been emitted from ${type} **${name}**.`,
      message(event),
    ];
  }
}

module.exports = Unkown;
