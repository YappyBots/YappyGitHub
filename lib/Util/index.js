const MergeDefault = require('./MergeDefault');

/**
 * Some utilities :)
 */
class Util {
  constructor() {
    this.urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
    this.removeUrlEmbedding = this.removeUrlEmbedding.bind(this);
  }
  /**
   * Merge an object with a defaults object
   * @param {Object} def Default
   * @param {Object} given Object given to merge with default
   * @return {Object} Merged object
   */
  MergeDefault(...args) {
    return MergeDefault(...args);
  }

  /**
   * Remove url embedding
   * @param  {String} text
   * @return {String}
   */
  removeUrlEmbedding(text) {
    return text.replace(this.urlRegEx, url => `<${url}>`);
  }
}

module.exports = new Util();
