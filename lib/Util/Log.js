const winston = require('winston');
const bugsnag = require('bugsnag');
const raven = require('raven');
const YappyGithub = require('./YappyGithub');
const moment = require('moment');
const path = require('path');
const util = require('util');

class Log {
  constructor() {
    this._colors = {
      error: 'red',
      warn: 'yellow',
      info: 'cyan',
      debug: 'green',
      message: 'white',
      verbose: 'grey',
    };
    this._path = new RegExp(path.resolve(__dirname, '../../'), 'g');
    this.logger = new (winston.Logger)({
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        message: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
      },
      transports: [
        new (winston.transports.Console)({
          colorize: true,
          prettyPrint: true,
          timestamp: () => moment().format('MM/D/YY HH:mm:ss'),
          align: true,
          level: 'debug',
        }),
      ],
      exitOnError: false,
    });

    winston.addColors(this._colors);

    if (process.env.YAPPY_GITHUB_BUGSNAG) {
      this.bugsnag = true;
      bugsnag.register(process.env.YAPPY_GITHUB_BUGSNAG, {
        appVersion: '2.0.0-DEV',
        autoNotify: true,
        filters: ['token'],
        notifyReleaseStages: ['production'],
        packageJSON: path.resolve(__dirname, '../../package.json'),
        projectRoot: path.resolve(__dirname, '../../'),
        releaseStage: process.env.OPENSHIFT_NODEJS_PORT ? 'production' : 'development',
        sendCode: true,
      });
    }

    if (process.env.YAPPY_GITHUB_SENTRY) {
      this.sentry = true;
      this.raven = new raven.Client(process.env.YAPPY_GITHUB_SENTRY, {
        release: YappyGithub.git.release,
        environment: process.env.OPENSHIFT_NODEJS_PORT ? 'production' : 'development',
        tags: {
          git_commit: YappyGithub.git.commit,
        },
      });
    }

    this.error = this.error.bind(this);
    this.warn = this.warn.bind(this);
    this.info = this.info.bind(this);
    this.message = this.message.bind(this);
    this.verbose = this.verbose.bind(this);
    this.debug = this.debug.bind(this);
    this.silly = this.silly.bind(this);

    this._token = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.YAPPY_GITHUB_DISCORD;
    this._tokenRegEx = new RegExp(this._token, 'g');
  }
  error(error, ...args) {
    if (!error) return;
    const headers = error.headers || {};
    if (error && typeof error === 'object' && error.response) error = error.response ? error.response.body || error.response.text : error.stack;
    if (error && typeof error === 'object' && error.stack) {
      error.stack = error.stack.replace(this._path, '.');
      if (this._token) error.stack = error.stack.replace(this._tokenRegEx, '-- token --');
    }
    if (error && typeof error === 'object' && error.content) error = `${headers.server || 'Discord API'} - ${error.content ? error.content[0] : error.message}`;
    if (error && typeof error === 'object' && error.code && error.message) error = `${headers.server || 'Discord API'} - ${error.message} (${error.code})`;

    if (this.bugsnag) bugsnag.notify(error);
    if (this.sentry) {
      if (error instanceof Error) {
        this.raven.captureException(error);
      } else {
        this.raven.captureMessage(typeof error === 'object' ? util.inspect(error) : error);
      }
    }
    this.logger.error(error, ...args);
    return this;
  }
  warn(warn, ...args) {
    this.logger.warn(warn, ...args);
    if (this.sentry) {
      if (typeof warn === 'object') {
        this.raven.captureException(warn, { level: 'warning' });
      } else {
        this.raven.captureMessage(warn, { level: 'warning' });
      }
    }
    return this;
  }
  info(...args) {
    this.logger.info(...args);
    return this;
  }
  message(msg) {
    let author = msg.author;
    let channel = msg.channel.guild ? `#${msg.channel.name}` : `${author.username}#${author.discriminator}`;
    let server = msg.channel.guild ? msg.channel.guild.name : `Private Message`;
    let message = `${server} > ${channel} > @${author.username}#${author.discriminator} : ${msg.content}`;

    this.logger.message(message);
    return this;
  }
  verbose(...args) {
    this.logger.verbose(...args);
    return this;
  }
  debug(arg, ...args) {
    if (typeof arg === 'object') arg = util.inspect(arg, { depth: 0 });
    this.logger.debug(arg, ...args);
    return this;
  }
  silly(...args) {
    this.logger.silly(...args);
    return this;
  }
}

module.exports = new Log();
