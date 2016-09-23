const GithubEvents = require('./GithubEvents');
const crypto = require('crypto');
const Log = require('../lib/Logger').Logger;


const ValidateSecret = req => {
  let secret = process.env.GITHUB_SECRET;
  let buffer = Buffer.from(process.env.GITHUB_SECRET);
  let signature = req.headers['x-hub-signature'].replace(/^sha1=/, '');
  let decrypted = crypto.createHmac('sha1', secret).update(buffer).digest('hex');
  console.log(`Signature: ${signature}`);
  console.log(`Secret: ${secret}`);
  console.log(`Decrypted: ${decrypted}`);
  console.log(`Buffer: ${buffer.toString()}`);

  return signature == secret;
}

module.exports = (req, res, next) => {
  const event = req.headers['x-github-event'];
  const secret = req.headers['x-hub-signature'];
  const data = req.body;

  if (!secret || !ValidateSecret(req)) return res.status(401).send(`${secret} is an invalid secret.` );

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
