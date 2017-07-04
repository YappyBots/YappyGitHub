const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

global.Log = require('./Util/Log');

require('./Web');
require('./Models');
require('./Util');
require('./Util/YappyGithub');
require('./Discord');
require('./Github');

process.on('unhandledRejection', Log.error);
process.on('uncaughtException', Log.error);

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
* Discord.JS's Rich Embed
* @external {RichEmbed}
* @see {@link https://discord.js.org/#/docs/main/master/class/RichEmbed}
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
