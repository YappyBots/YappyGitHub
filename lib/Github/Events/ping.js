const EventResponse = require('../EventResponse');

class Ping extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Ping, pong! Webhooks are ready!`,
    });
  }
  embed(data) {
    let { repository, hook } = data;
    return {
      color: 'danger',
      title: `Ping, Pong! \`${repository.full_name}\` Synced Successfully!`,
      description: `Listening to the following events: ${hook.events.map(e => `\`${e}\``).join(`, `)}`,
    };
  }
  text(data) {
    let hook = data.hook;
    return `🏓 Ping, pong! Listening to the following events:  ${hook.events.map(e => `\`${e}\``).join(`, `)}`;
  }
}

module.exports = Ping;
