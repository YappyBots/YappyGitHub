const Pad = require('./Pad');
const MergeDefault = require('./MergeDefault');

/**
 * Some utilities :)
 */
class Util {
  /**
  * Add padding to the right of a string
  * @param {String} string - The string to pad
  * @param {Integer} length - Length of final string
  * @return {String} The string with padding on the right
  */
  Pad(...args) {
    return Pad(...args);
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
}

module.exports = new Util();
