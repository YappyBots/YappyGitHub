const winston = require('winston');
const bugsnag = require('bugsnag');
const raven = require('raven');
const path = require('path');
const util = require('util');
const YappyGitHub = require('./YappyGitHub');

const { MESSAGE } = require('triple-beam');
const jsonStringify = require('fast-safe-stringify');
const cleanStack = require('clean-stack');
const PrettyError = require('pretty-error');
const pe = new PrettyError();

pe.alias(process.cwd(), '.');
pe.skipPackage('discord.js', 'ws');

pe.appendStyle({
  'pretty-error > trace > item': {
    marginBottom: 0,
  },
});

const simple = winston.format((info) => {
  const stringifiedRest = jsonStringify(
    Object.assign({}, info, {
      level: undefined,
      message: undefined,
      splat: undefined,
      timestamp: undefined,
    })
  );

  const padding = (info.padding && info.padding[info.level]) || '';
  if (stringifiedRest !== '{}') {
    info[
      MESSAGE
    ] = `${info.timestamp} ${info.level}:${padding} ${info.message} ${stringifiedRest}`;
  } else {
    info[
      MESSAGE
    ] = `${info.timestamp} ${info.level}:${padding} ${info.message}`;
  }

  return info;
});

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
    this.logger = winston.createLogger({
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        message: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
      },
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: 'MM/D/YY HH:mm:ss',
        }),
        winston.format.prettyPrint(),
        winston.format.align()
      ),
      transports: [
        new winston.transports.Console({
          level: process.env.LOG_LEVEL || 'info',
          format: simple(),
          handleExceptions: true,
        }),
      ],
      exitOnError: false,
    });

    winston.addColors(this._colors);

    if (process.env.BUGSNAG) {
      this.bugsnag = true;
      bugsnag.register(process.env.BUGSNAG, {
        appVersion: '2.0.0-DEV',
        autoNotify: true,
        filters: ['token'],
        notifyReleaseStages: ['production'],
        packageJSON: path.resolve(__dirname, '../../package.json'),
        projectRoot: path.resolve(__dirname, '../../'),
        releaseStage: process.env.OPENSHIFT_NODEJS_PORT
          ? 'production'
          : 'development',
        sendCode: true,
      });
    }

    if (process.env.SENTRY) {
      this.sentry = true;
      this.raven = new raven.Client(process.env.SENTRY, {
        release: YappyGitHub.git.release,
        environment: process.env.OPENSHIFT_NODEJS_PORT
          ? 'production'
          : 'development',
        tags: {
          git_commit: YappyGitHub.git.commit,
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

    this._token = process.env.DISCORD_TOKEN;
    this._tokenRegEx = new RegExp(this._token, 'g');
  }
  error(error, ...args) {
    if (!error) return;

    if (error.name == 'DiscordAPIError') delete error.stack;

    if (error.stack) error.stack = cleanStack(error.stack);
    if (error instanceof Error) error = pe.render(error);

    if (this.bugsnag) bugsnag.notify(error);
    if (this.sentry) {
      if (error instanceof Error) {
        this.raven.captureException(error);
      } else {
        this.raven.captureMessage(
          typeof error === 'object' ? util.inspect(error) : error
        );
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
    let channel = msg.channel.guild
      ? `#${msg.channel.name}`
      : `${author.username}#${author.discriminator}`;
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
