const EventResponse = require('../EventResponse');

class Status extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This event gets fired when an integration adds or changes a status on a commit',
    });
  }

  embed(data) {
    return {
      color: '#c0e4c0',
      title: `${data.description || data.context} (${this.capitalize(data.state)})`,
      url: data.target_url,
    };
  }

  text(data) {
    const {
      sha, description, state,
      target_url: url,
    } = data;
    const eventName = state === 'failure' ? 'failed' : state === 'error' ? 'errored' : 'succeeded';

    return [
      `📝 Commit \`${sha.slice(0, 7)}\`'s test ${description ? `**${description}** (_${data.context}_` : `**${data.context}** ${eventName})`}`,
      url ? `<${url}>` : '',
    ].join('\n');
  }

  ignore(data) {
    const { description, state } = data;

    return state === 'pending' || (description && description.includes('progress') && description.includes('GitHub Pages'));
  }
}

module.exports = Status;
