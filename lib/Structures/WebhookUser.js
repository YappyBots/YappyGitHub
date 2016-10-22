const WebcordUser = require('Webcord').User;
const token = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.BOT_TOKEN;

if (!token) return false;
module.exports = new WebcordUser(token, true);
