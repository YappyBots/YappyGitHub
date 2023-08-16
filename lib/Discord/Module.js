const { EmbedBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

/**
 * Discord bot middleware, or module
 */
class Module {
  /**
   * @param {Client} bot - discord bot
   */
  constructor(bot) {
    this.bot = bot;
    this._path = Log._path;
    this.embed = Discord.EmbedBuilder;

    // TODO remove all calls to `addField` and replace with `addFields`
    this.embed.prototype.addField = function (name, value, inline = false) {
      return this.addFields([{ name, value, inline }]);
    };
  }

  /**
   * Middleware's priority
   * @readonly
   * @type {number}
   */
  get priority() {
    return 0;
  }

  /**
   * Init module
   */
  init() {}

  /**
   * Bot's message middleware function
   * @param {Message} msg - the message
   * @param {string[]} args - message split by spaces
   * @param {function} next - next middleware pls <3
   */
  run() {
    throw new Error(
      `No middleware method was set up in module ${this.constructor.name}`
    );
  }

  /**
   * Function to shorten sending error messages
   * @param {Message} msg - message sent by user (for channel)
   * @param {string} str - error message to send user
   * @return {Promise<Message>}
   */
  moduleError(msg, str) {
    return msg.channel.send(`❌ ${str}`);
  }

  /**
   * Convert normal text to an embed object
   * @param {string} [title = 'Auto Generated Response'] - embed title
   * @param {string|string[]} text - embed description, joined with newline if array
   * @param {color} [color = '#84F139'] - embed color
   * @return {EmbedBuilder}
   */
  textToEmbed(title = 'Auto Generated Response', text, color = '#84F139') {
    if (Array.isArray(text)) text = text.join('\n');
    return new this.embed()
      .setColor(color)
      .setTitle(title)
      .setDescription(text)
      .setFooter({
        iconURL: this.bot.user.avatarURL(),
        text: this.bot.user.username,
      });
  }
}

module.exports = Module;
