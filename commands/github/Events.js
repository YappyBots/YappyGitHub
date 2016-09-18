const GithubEvents = require('../../Github/GithubEvents');
const Log = require('../../lib/Logger').Logger;

const Issues = require('../../Github/Issues');
const IssueComment = require('../../Github/IssueComment');
const Fork = require('../../Github/Fork');
const PullRequest = require('../../Github/PullRequest');
const Push = require('../../Github/Push');
const Release = require('../../Github/Release');
const Watch = require('../../Github/Watch');

module.exports = bot => (msg, command, args) => {
  let events = GithubEvents.events();
  let eventsToGet = parseInt(args[0]) < 20 ? parseInt(args[0]) : 20;
  let latestEvents = events.slice(Math.max(events.length - eventsToGet));

  latestEvents = latestEvents.map(e => {
    if (e.type == 'IssuesEvent') return Issues(e);
    if (e.type == 'IssueCommentEvent') return IssueComment(e);
    if (e.type == 'ForkEvent') return Fork(e);
    if (e.type == 'PullRequestEvent') return PullRequest(e);
    if (e.type == 'PushEvent') return Push(e);
    if (e.type == 'WatchEvent') return Watch(e);
    if (e.type == 'ReleaseEvent') return Release(e);
  });

  let message = [
    `**LATEST ${eventsToGet} GITHUB EVENTS**`,
    `_from oldest to most recent_`,
    ``,
    ...latestEvents
  ].join('\n');

  if (!latestEvents || !latestEvents.length) message = [
    `**LATEST GITHUB EVENTS**`,
    ``,
    `No events found`
  ];

  msg.channel.sendMessage(message);
}
