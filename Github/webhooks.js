const GithubEvents = require('./GithubEvents');
const Log = require('../lib/Logger').Logger;

module.exports = (req, res, next) => {
  const event = req.headers['x-github-event'];
  const data = req.body;

  if (data.repository.full_name !== 'hydrabolt/discord.js') return false;

  switch (event) {
    case 'push': {
      GithubEvents.Push(data);
      break;
    }
    case 'release': {
      GithubEvents.Release(data);
      break;
    }
    case 'issues': {
      GithubEvents.Issues(data);
    }
    case 'issue_comment': {
      GithubEvents.IssueComment(data);
    }
    case 'pull_request': {
      GithubEvents.PullRequest(data);
    }
    case 'watch': {
      GithubEvents.Watch(data);
    }
    case 'fork': {
      GithubEvents.Fork(data);
    }
    case 'create': {
      GithubEvents.Branch(event, data);
    }
    case 'delete': {
      GithubEvents.Branch(event, data);
    }
  }

  res.json({ success: true });
}
