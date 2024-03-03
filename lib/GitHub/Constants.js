exports.HOST = 'GitHub.com';

/**
 * GitHub Errors
 * @type {Object}
 */
exports.Errors = {
  NO_TOKEN: 'No token was provided via process.env.GITHUB_TOKEN',
  REQUIRE_QUERY: 'A query is required',
  NO_REPO_CONFIGURED: `Repository for this channel hasn't been configured. Please tell the server owner that they need to do "/conf option channel item:repo value:<user/repo>".`,
};
