const { EventEmitter } = require('events');
const Log = require('../lib/Logger').Logger;
const gh_events = require('gh-events');

const Issues = require('./Issues');
const IssueComment = require('./IssueComment');
const Push = require('./Push');
const PullRequest = require('./PullRequest');
const Release = require('./Release');
const Fork = require('./Fork');
const Watch = require('./Watch');

class GithubEvents {
  constructor() {
    this._events = new EventEmitter();
    this._gh = new gh_events({
      user: 'hydrabolt',
      repo: 'discord.js',
      auth: {
        type: "oauth",
        token: process.env.GITHUB_TOKEN
      }
    });

    this._latestEvents = [];

    this.Issues = this.Issues.bind(this);
    this.IssueComment = this.IssueComment.bind(this);
    this.Fork = this.Fork.bind(this);
    this.PullRequest = this.PullRequest.bind(this);
    this.Push = this.Push.bind(this);
    this.Watch = this.Watch.bind(this);
    this.Release = this.Release.bind(this);

    this.init();
  }

  on(e, cb) {
    this._events.on(e, cb);
  }

  Event(e, cb) {
    this._events.on(e, cb);
  }

  init() {
    const github_events = this._gh;

    github_events.start();

    github_events.on('IssuesEvent', this.Issues);
    github_events.on('IssueCommentEvent', this.IssueComment);
    github_events.on('ForkEvent', this.Fork);
    github_events.on('PullRequestEvent', this.PullRequest);
    github_events.on('PushEvent', this.Push);
    github_events.on('WatchEvent', this.Watch);
    github_events.on('ReleaseEvent', this.Release);
    github_events.on('all', (e, data) => {
      // Log.debug(e);

      this._latestEvents.push(data);
    });

  }

  Issues(event, payload) {
    const events = this._events;
    events.emit(`issues`, Issues(payload));
  }

  IssueComment(event, payload) {
    const events = this._events;
    events.emit(`issueComment`, IssueComment(payload));
  }

  Fork(event, payload) {
    const events = this._events;
    events.emit('fork', Fork(payload));
  }

  PullRequest(event, payload) {
    const events = this._events;
    events.emit(`pr`, PullRequest(payload));
  }

  Push(event, payload) {
    const events = this._events;
    events.emit(`push`, Push(payload));
  }

  Watch(event, payload) {
    const events = this._events;
    events.emit(`watch`, Watch(payload));
  }

  Release(event, payload) {
    const events = this._events;
    events.emit(`release`, Release(payload));
  }

  events() {
    return this._latestEvents;
  }
}

module.exports = new GithubEvents();
