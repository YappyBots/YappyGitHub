const GithubEvents = require('./GithubEvents');
const ChannelConf = require('../lib/ChannelConf');
const crypto = require('crypto');
const Log = require('../lib/Logger').Logger;


// const ValidateSecret = req => {
//   let secret = process.env.GITHUB_SECRET;
//   let signature = req.headers['x-hub-signature'].replace(/^sha1=/, '');
//   let payload = JSON.stringify(req.body);
//   let decrypted = crypto.createHmac('sha1', secret).update(payload).digest('hex');
//
//   console.log(`Signature: ${signature}`);
//   console.log(`Secret: ${secret}`);
//   console.log(`Decrypted: ${decrypted}`);
//   console.log(`Equals: ${signature == decrypted}`)
//
//   return signature == decrypted;
// }

module.exports = (req, res, next) => {
  const event = req.headers['x-github-event'];
  const secret = req.headers['x-hub-signature'];
  const data = req.body;

  if (!event || !data || !data.repository) return res.status(403).send('INVALID DATA. PLZ USE GITHUB WEBHOOKS');

  Log.debug(`Got a \`${event}\` from ${data.repository.full_name}`);

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
    // case 'watch': {
    //   GithubEvents.Watch(data);
    // }
    // case 'fork': {
    //   GithubEvents.Fork(data);
    // }
    case 'create': {
      GithubEvents.Branch(event, data);
    }
    case 'delete': {
      GithubEvents.Branch(event, data);
    }
    case 'ping': {
      GithubEvents.Ping(data);
    }
  }

  res.send(`Dealing with the webhook's action, ${event}. Sigh...`);
}
