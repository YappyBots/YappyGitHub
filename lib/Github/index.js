const GithubApi = require('github');
const EventHandler = require('./EventHandler');
const Constants = require('./Constants');
const GithubRepoParse = require('./GithubRepoParser').Parse;

class Github {
  constructor() {
    Log.info(`Github | Logging in...`);
    if (process.env.GITHUB_TOKEN) {
      this.gh = new GithubApi({
        protocol: 'https',
        timeout: 5000,
      });
      this.tokenAvailable = true;
      this.token = process.env.GITHUB_TOKEN;
      this.gh.authenticate({
        type: 'oauth',
        token: process.env.GITHUB_TOKEN,
      });
      EventHandler.setGithub(this.gh);
      Log.info(`Github | Logged in!`);
    } else {
      Log.warn(`Github | No token provided! Skipped login.`);
    }
    this.Constants = Constants;
  }

  /**
  * Get Github repository information
  * @param {String} repository - Repo's full name or url
  * @return {Promise}
  */
  async getRepo(repository) {
    let repo = GithubRepoParse(repository);
    if (!this.tokenAvailable) {
      Log.warn(`Github | getRepo: returning sample github repo`);
      return Promise.resolve({});
    }
    return new Promise((resolve, reject) => {
      this.gh.repos.get({
        owner: repo.owner,
        repo: repo.name,
      }, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  /**
  * Get Github issue from repository
  * @param {String} repository - repo's full name or url
  * @param {Number} issue - issue number
  * @return {Promise}
  */
  async getRepoIssue(repository, issue) {
    if (!this.tokenAvailable) {
      Log.warn(`Github | getRepo: returning sample github repo`);
      return Promise.resolve({});
    }
    const repo = typeof repository === 'object' ? repository : GithubRepoParse(repository);
    return new Promise((resolve, reject) => {
      this.gh.issues.get({
        owner: repo.owner,
        repo: repo.name,
        number: issue,
      }, (err, res) => {
        if (err) {
          if (err.headers) err.message = JSON.parse(err.message).message;
          return reject(err);
        }
        resolve(res.data);
      });
    });
  }
}

module.exports = new Github();
