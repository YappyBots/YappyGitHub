const GithubEvents = require('./GithubEvents');
const Log = require('../lib/Logger').Logger;

const ValidateSecret = secret => {
  let signature = 'sha1=' + crypto.createHmac('sha256', process.env.GITHUB_SECRET).digest('hex');
  return signature == secret;
}

module.exports = (req, res, next) => {
  const event = req.headers['x-github-event'];
  const secret = req.headers['x-hub-signature'];
  const data = req.body;

  if (!secret || !ValidateSecret(secret)) return res.status(401).json({ error: `${secret} is an invalid secret` });

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
