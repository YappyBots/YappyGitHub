const EventResponse = require('../EventResponse');

// This seems to only be sent on GH app creation now, so it may be useless.
// Installations send `installation.created` and `installation.deleted` events.
class Meta extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `Something happened relating to the webhook.`,
    });
  }
  embed(data) {
    const { action, hook } = data;

    return {
      color: 'Red',
      title: `${hook.type} webhook was ${action}.`,
    };
  }
  text(data) {
    const { action, hook } = data;

    return `🏓 ${hook.type} webhook was ${action}.`;
  }
}

module.exports = Meta;
