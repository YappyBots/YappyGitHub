'use strict';

const chalk = require('chalk');
const path = require('path');
const EventEmitter = require("events").EventEmitter;
const moment = require('moment');
const util = require('util');
const LogDNA = require('logdna');
const options = {
  app: 'DiscordJS Rewrite Trello'
}
const logger = process.env.LOGDNA_KEY ? LogDNA.createLogger(process.env.LOGDNA_KEY, options) : null;
const icons = {
  error: '🔥  ',
  debug: '⚙  ',
  info: '🆗   ',
  message: '💁'
};
let socket;
let logs = [];
let botPath = path.resolve(__dirname, '../');
let botPathRegEx = new RegExp(botPath, 'g');

/**
 * A Logger to replace `console.log`.
 * It logs to the console, web, AND LogDNA
 */
class Logger {

  constructor() {
    this.emitter = new EventEmitter();

    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.error = this.error.bind(this);
    this.message = this.message.bind(this);
    this.github = this.github.bind(this);

    this._token = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.BOT_TOKEN;
  }

  /**
   * Debug it like you would `console.log` it ;)
   * @param {Mixed} ...args - all the arguments
   */
  debug(...args) {
    this.log('debug', ...args);
  }

  /**
   * Log something about github, self-explanatory (right?)
   * @param {Mixed} ...args - all the arguments
   */
  github(...args) {
    this.log('github', ...args);
  }

  /**
   * Give me some info, pls
   * @param {Mixed} ...args - all the arguments
   */
  info(...args) {
    this.log('info', ...args);
  }

  /**
   * You gotta error it to me ;((
   * @param {Mixed} ...args - all the arguments
   */
   error(error) {
     if (error && typeof error === "object" && error.response) error = error.response.error || error.response.body || error.response;
     if (error && typeof error === "object" && error.stack) {
       error.stack = error.stack.replace(botPathRegEx, ".");
       if (this._token) error.stack = error.stack.replace(new RegExp(this._token, "g"), "TOKEN_WAS_HERE");
     }
     this.log("error", error);
   }

  /**
   * Log a message!
   * @param {Mixed} ...args - all the arguments
   */
  message(msg) {
    this.log('message', msg);
  }

  /**
   *
   * @param {String} event - what kind of log
   * @param {cb} cb - callback
   */
  on(event, cb) {
    this.emitter.on(event, cb);
  }

  // inside

  /**
   * Log, with the level and the message
   * @param {String} level - log level, i.e: error
   * @param {Mixed} message - actual message, ya know?
   * @private
   */
  log(level, msg) {
    let args = [...arguments].slice(1);
    let message = util.format(...args).replace(new RegExp(this._token, 'g'), 'TOKEN_WAS_HERE');

    let log = `[${moment().format("MM/D/YY HH:mm:ss")}] ${icons[level]} ${level}: ${util.format(...args)}`;

    if (logger) logger.log(util.format(...args), level);

    console.log(log);

    this.emit(log);
  }

  /**
   * Get all the logs from the latest run
   * @return {Array} logs - Logs, hhm..
   */
  get logs() {
    return logs;
  }

  /**
   * Emit to socket.io and push to the logs
   * @private
   */
  emit(log) {
    logs.push(log.replace(/(\[)\w+(m)/g, ''));
    if (!socket) return false;
    socket.emit('log', log.replace(/(\[)\w+(m)/g, ''));
  }
}

module.exports = {
  Logger: new Logger(),
  Socket: io => {
    socket = exports.Socket = module.exports.Socket = io;
    return socket;
  }
};
