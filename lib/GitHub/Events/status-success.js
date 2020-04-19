const Status = require('./Status');

class StatusSuccess extends Status {
  constructor(...args) {
    super(...args, {
      description:
        'This event gets fired when a status check succeeds on a commit',
    });
  }

  embed(data) {
    const embed = super.embed(data);

    embed.color = '#c0e4c0';

    return embed;
  }

  ignore(data) {
    return data.description.includes('GitHub Pages');
  }
}

module.exports = StatusSuccess;
