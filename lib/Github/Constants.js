/**
 * Github Errors
 * @type {Object}
 */
exports.Errors = {
  NO_TOKEN: 'No token was provided via process.env.GITHUB_TOKEN',
  REQUIRE_QUERY: 'A query is required',
  NO_REPO_CONFIGURED: e => `Repository for this channel hasn't been configured. Please tell the server owner that they need to do \`${e.bot.prefix} conf set repo <user/repo>\`.`,
};
