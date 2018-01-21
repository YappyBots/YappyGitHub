const GithubApi = require('@octokit/rest');
const EventHandler = require('./EventHandler');
const Constants = require('./Constants');
const GithubRepoParse = require('./GithubRepoParser').Parse;

/**
* Methods to retrieve information from Github using package `github`
* Made these so it's easier to remember. Plus autocomplete ;)
*/
class Github {
  constructor() {
    Log.info(`Github | Logging in...`);
    if (process.env.GITHUB_TOKEN) {
      this.gh = new GithubApi({
        protocol: 'https',
        timeout: 5000,
        Promise: Promise,
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
  getRepo(repository) {
    if (!this._tokenAvailable()) return Promise.resolve({});

    const repo = GithubRepoParse(repository);

    return this.gh.repos.get({
      owner: repo.owner,
      repo: repo.name,
    }).then(res => res.data);
  }

  /**
  * Get Github issue from repository
  * @param {String} repository - repo's full name or url
  * @param {Number} issue - issue number
  * @return {Promise}
  */
  getRepoIssue(repository, issue) {
    if (!this._tokenAvailable()) return Promise.resolve({});

    const repo = typeof repository === 'object' ? repository : GithubRepoParse(repository);

    return this.gh.issues.get({
      owner: repo.owner,
      repo: repo.name,
      number: issue,
    })
    .then(res => res.data)
    .catch(err => {
      if (err.headers) err.message = JSON.parse(err.message).message;
      return err;
    });
  }

  /**
  * Get user by id
  * @param {String} id - user id
  * @return {Promise}
  */
  getUserByID(id) {
    if (!this._tokenAvailable()) return Promise.resolve({});

    return this.gh.users.getById({
      id,
    }).then(res => res.data);
  }

  /**
  * Get organization
  * @param  {String} org - org name
  * @return {Promise}
  */
  getOrg(org) {
    if (!this._tokenAvailable()) return Promise.resolve([]);

    return this.gh.orgs.get({
      org,
      page: 1,
      page_per: 1,
    }).then(res => res.data);
  }

  /**
  * Get public repos in organization
  * @param {String} org - org name
  * @return {Promise}
  */
  getOrgRepos(org) {
    if (!this._tokenAvailable()) return Promise.reject();

    return this.gh.repos.getForOrg({
      org,
    }).then(res => res.data);
  }

  /**
  * Get organization members
  * @param  {String} org - org name
  * @return {Promise}
  */
  getOrgMembers(org) {
    if (!this._tokenAvailable()) return Promise.reject();

    return this.gh.orgs.getMembers({
      org,
      page: 1,
    }).then(res => res.data);
  }

  /**
  * Search Github
  * @param {String} type - what to search the query for, i.e. repositories
  * @param {String} query
  * @return {Promise}
  */
  search(type, query) {
    if (!this._tokenAvailable()) return Promise.resolve({});

    return this.gh.search[type]({
      q: query,
    }).then(res => res.data);
  }

  _tokenAvailable() {
    if (!this.tokenAvailable) {
      Log.warn(`Github | Returning sample github data`);
      return false;
    }
    return true;
  }
}

module.exports = new Github();
