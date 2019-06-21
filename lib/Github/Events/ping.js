const EventResponse = require('../EventResponse');

class Ping extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Ping, pong! Webhooks are ready!`,
    });
  }
  embed(data) {
    const { repository, organization, hook, zen } = data;
    const name = repository
      ? repository.full_name
      : organization
      ? organization.login
      : null;
    return {
      color: 'danger',
      title: `Ping, Pong! \`${name}\` Synced Successfully!`,
      description: `${zen}\nListening to the following events: ${hook.events
        .map(e => `\`${e}\``)
        .join(`, `)}`,
    };
  }
  text(data) {
    return `🏓 Ping, pong! Listening to the following events:  ${data.hook.events
      .map(e => `\`${e}\``)
      .join(`, `)}`;
  }
}

module.exports = Ping;
