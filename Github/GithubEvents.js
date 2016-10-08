const { EventEmitter } = require('events');
const EventEmitter2 = require('eventemitter2').EventEmitter2;
const Log = require('../lib/Logger').Logger;
const GithubApi = require('github');
const GithubCache = require('../lib/Util/GithubCache');

const Issues = require('./Issues');
const IssueComment = require('./IssueComment');
const Push = require('./Push');
const PullRequest = require('./PullRequest');
const Branch = require('./Branch');
const Release = require('./Release');
const Fork = require('./Fork');
const Watch = require('./Watch');
const Repository = require('./Repository');

class GithubEvents {
  constructor() {
    this._events = new EventEmitter2({
      wildcard: true,
      maxListeners: 20
    });
    this.github = new GithubApi({
      protocol: 'https',
      timeout: 5000
    });

    this.github.authenticate({
      type: "oauth",
      token: process.env.GITHUB_TOKEN
    });

    this._latestEvents = [];

    this.Issues = this.Issues.bind(this);
    this.IssueComment = this.IssueComment.bind(this);
    this.Fork = this.Fork.bind(this);
    this.PullRequest = this.PullRequest.bind(this);
    this.Push = this.Push.bind(this);
    this.Watch = this.Watch.bind(this);
    this.Release = this.Release.bind(this);
    this.Branch = this.Branch.bind(this);
    this.Ping = this.Ping.bind(this);
    this.Repository = this.Repository.bind(this);
  }

  on(e, cb) {
    this._events.on(e, cb);
  }

  emit(e, data) {
    this._events.emit(e, data);
  }

  Issues(payload) {
    this.emit(`issues`, {
      repo: payload.repository.full_name,
      str: Issues(payload)
    });
  }

  IssueComment(payload) {
    this.emit(`issueComment`, {
      repo: payload.repository.full_name,
      str: IssueComment(payload)
    });
  }

  Fork(payload) {
    this.emit('fork', {
      repo: payload.repository.full_name,
      str: Fork(payload)
    });
  }

  PullRequest(payload) {
    this.emit(`pr`, {
      repo: payload.repository.full_name,
      str: PullRequest(payload)
    });
  }

  Push(payload) {
    this.emit(`push`, {
      repo: payload.repository.full_name,
      str: Push(payload)
    });
  }

  Watch(payload) {
    this.emit(`watch`, {
      repo: payload.repository.full_name,
      str: Watch(payload)
    });
  }

  Release(payload) {
    this.emit(`release`, {
      repo: payload.repository.full_name,
      str: Release(payload)
    });
  }

  Branch(action, payload) {
    this.emit('branch', {
      repo: payload.repository.full_name,
      str: Branch(action, payload)
    })
  }

  Repository(payload) {
    this.emit('repository', {
      repo: payload.repository.full_name,
      str: Repository(payload)
    })
  }

  Member(payload) {
    this.emit('member', {
      repo: payload.repository.full_name,
      str: Member(payload)
    })
  }

  Status(payload) {
    this.emit('status', {
      repo: payload.repository.full_name,
      str: Status(payload)
    })
  }

  Gollum(payload) {
    this.emit('gollum', {
      repo: payload.repository.full_name,
      str: Gollum(payload)
    })
  }

  Ping(data) {
    const repo = data.repository.full_name;
    const hooks = data.hook.events;
    const str = `🏓 Ping, pong! Webhook is set up! Listening to the following events: ${hooks.map(e => `\`${e}\``).join(', ')}`;

    GithubCache.add(repo);

    this.emit('ping', {
      str, repo
    });
  }

  events() {
    return this._latestEvents;
  }
}

module.exports = new GithubEvents();
