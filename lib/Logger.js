'use strict';

const chalk = require('chalk');
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

class Logger {

  constructor() {
    this.emitter = new EventEmitter();

    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.error = this.error.bind(this);
    this.message = this.message.bind(this);
  }

  // methods
  debug(msg) {
    this.log('debug', msg);
  }
  info(msg) {
    this.log('info', msg);
  }
  error(msg) {
    if (typeof msg == 'object' && msg.stack) {
      msg.stack = msg.stack.replace(__dirname, './');
    }
    this.log('error', msg);
  }
  message(msg) {
    this.log('message', msg);
  }
  on(event, cb) {
    this.emitter.on(event, cb);
  }

  // inside

  log(level, msg) {
    const TOKEN = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.TOKEN;
    let args = [...arguments].slice(1);
    let message = util.format(...args).replace(new RegExp(TOKEN, 'g'), 'TOKEN_WAS_HERE');

    let log = `[${moment().format("MM/D/YY HH:mm:ss")}] ${icons[level]} ${level}: ${util.format(...args)}`;

    if (logger) logger.log(util.format(...args), level);

    console.log(log);

    this.emit(log);
  }

  get logs() {
    return logs;
  }

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
