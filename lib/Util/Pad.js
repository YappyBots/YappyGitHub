/**
* Add padding to the right of a string
* @param {String} string - The string to pad
* @param {Integer} length - Length of final string
* @return {String} The string with padding on the right
*/
const Pad = (string, length) => string + ' '.repeat(length - string.length);

module.exports = Pad;
