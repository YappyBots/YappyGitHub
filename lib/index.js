require('dotenv').config();

global.Log = require('./Util/Log');

require('./Web');
require('./Models');
require('./Util');
require('./Util/YappyGitHub');
require('./Discord');
require('./GitHub');

const logUnhandled = (type) => (err) => {
  try {
    Log.error(`Unhandled ${type}:`);
    Log.error(err);
  } catch (err) {
    console.error(`Unhandled ${type}:`);
    console.error(err);
  }
};

process.on('unhandledRejection', logUnhandled('Rejection'));
process.on('uncaughtException', logUnhandled('Exception'));

/**
 * Discord.JS's Client
 * @external {Client}
 * @see {@link https://discord.js.org/#/docs/main/master/class/Client}
 */

/**
 * Discord.JS's Guild
 * @external {Guild}
 * @see {@link https://discord.js.org/#/docs/main/master/class/Guild}
 */

/**
 * Discord.JS's Channel
 * @external {Channel}
 * @see {@link https://discord.js.org/#/docs/main/master/class/Channel}
 */

/**
 * Discord.JS's Message
 * @external {Message}
 * @see {@link https://discord.js.org/#/docs/main/master/class/Message}
 */

/**
 * Discord.JS's Message Embed
 * @external {MessageEmbed}
 * @see {@link https://discord.js.org/#/docs/main/master/class/MessageEmbed}
 */

/**
 * Discord.JS's Collection
 * @external {Collection}
 * @see {@link https://discord.js.org/#/docs/main/master/class/Collection}
 */

/**
 * Discord.JS's Client Options
 * @external {ClientOptions}
 * @see {@link https://discord.js.org/#/docs/main/master/typedef/ClientOptions}
 */

/**
 * Discord.JS's Color Resolvable
 * @external {ColorResolvable}
 * @see {@link https://discord.js.org/#/docs/main/master/typedef/ColorResolvable}
 */
