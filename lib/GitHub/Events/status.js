const EventResponse = require('../EventResponse');

class Status extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: "Don't report pending or errored status checks.",
    });
  }

  ignore() {
    return true;
  }

  // used by extending events
  embed(data) {
    const { context, description, sha, branches, target_url } = data;
    const branch = branches[0] ? `\`${branches[0].name}\`@` : '';

    return {
      color: null,
      title: `${branch}\`${sha.slice(0, 7)}\` — ${description || context}`,
      url: target_url,
    };
  }

  text(data) {
    const { sha, description, target_url: url } = data;

    return [
      `📝 Commit \`${sha.slice(0, 7)}\`'s test - **${description}** (_${
        data.context
      }_)`,
      url ? `<${url}>` : '',
    ].join('\n');
  }
}

module.exports = Status;
