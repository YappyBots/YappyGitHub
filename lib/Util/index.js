const MergeDefault = require('./MergeDefault');

/**
 * Some utilities :)
 */
class Util {
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
