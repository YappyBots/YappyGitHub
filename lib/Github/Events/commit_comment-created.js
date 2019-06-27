const EventResponse = require('../EventResponse');

class CommitCommentCreated extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired whenever someone comments on a commit',
    });
  }

  embed(data) {
    return {
      title: `Commented on commit \`${data.comment.commit_id.slice(0, 7)}\``,
      url: data.comment.html_url,
      description: data.comment.body.slice(0, 2048),
    };
  }

  text(data) {
    const { comment } = data;
    const actor = data.sender;

    return [
      `💬  **${actor.login}** commented on commit **${comment.commit_id.slice(
        0,
        7
      )}**`,
      `<${comment.html_url}>`,
    ].join('\n');
  }
}

module.exports = CommitCommentCreated;
