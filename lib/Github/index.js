const GithubApi = require('github');
const EventHandler = require('./EventHandler');
const GithubRepoParse = require('./GithubRepoParser').Parse;

class Github {
  constructor() {
    this.gh = new GithubApi({
      protocol: 'https',
      timeout: 5000,
    });
    Log.info(`=> GitHub | Logging in...`);
    this.gh.authenticate({
      type: 'oauth',
      token: process.env.GITHUB_TOKEN,
    });
    Log.info(`=> GitHub | Logged in!`);
    EventHandler.setGithub(this.gh);
  }
  /**
   * Get Github repository information
   * @param {String} ownerOrRepo - Repo's owner or full repository name/url
   * @param {String} [name] - Repo's name, required if ownerOrRepo is repo's owner
   * @return {Promise}
   */
  async getRepo(ownerOrRepo, name) {
    return new Promise((resolve, reject) => {
      let repo = name ? GithubRepoParse(`${ownerOrRepo}/${name}`) : GithubRepoParse(ownerOrRepo);
      this.gh.repos.get({
        owner: repo.owner,
        repo: repo.name,
      }, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }
}

module.exports = new Github();
