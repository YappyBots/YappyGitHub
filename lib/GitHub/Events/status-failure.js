const Status = require('./Status');

class StatusFailure extends Status {
  constructor(...args) {
    super(...args, {
      description:
        'This event gets fired when a status check fails on a commit',
    });
  }

  embed(data) {
    const embed = super.embed(data);

    embed.color = '#e74c3c';

    return embed;
  }

  ignore(data) {
    return data.description.includes('GitHub Pages');
  }
}

module.exports = StatusFailure;
