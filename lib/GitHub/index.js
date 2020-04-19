const { Octokit } = require('@octokit/rest');
const EventHandler = require('./EventHandler');
const Constants = require('./Constants');
const GitHubRepoParse = require('./GitHubRepoParser').Parse;

/**
 * Methods to retrieve information from GitHub using package `github`
 * Made these so it's easier to remember. Plus autocomplete ;)
 */
class GitHub {
  constructor() {
    Log.info(`GitHub | Logging in...`);
    if (process.env.GITHUB_TOKEN) {
      this.tokenAvailable = true;
      this.token = process.env.GITHUB_TOKEN;

      this.gh = new Octokit({
        auth: this.token,
        request: {
          timeout: 5000,
        },
      });

      EventHandler.setGitHub(this.gh);
      Log.info(`GitHub | Logged in!`);
    } else {
      Log.warn(`GitHub | No token provided! Skipped login.`);
    }
    this.Constants = Constants;
  }

  /**
   * Get GitHub repository information
   * @param {String} repository - Repo's full name or url
   * @return {Promise}
   */
  getRepo(repository) {
    if (!this._tokenAvailable()) return Promise.resolve({});

    const repo = GitHubRepoParse(repository);

    return this.gh.repos
      .get({
        owner: repo.owner,
        repo: repo.name,
      })
      .then((res) => res.data);
  }

  /**
   * Get GitHub issue from repository
   * @param {String} repository - repo's full name or url
   * @param {Number} issue - issue number
   * @return {Promise}
   */
  getRepoIssue(repository, issue) {
    if (!this._tokenAvailable()) return Promise.resolve({});

    const repo =
      typeof repository === 'object' ? repository : GitHubRepoParse(repository);

    return this.gh.issues
      .get({
        owner: repo.owner,
        repo: repo.name,
        issue_number: issue,
      })
      .then((res) => res.data);
  }

  /**
   * Get user by username
   * @param {String} username - user username
   * @return {Promise}
   */
  getUserByUsername(username) {
    if (!this._tokenAvailable()) return Promise.resolve({});

    return this.gh.users
      .getByUsername({
        username,
      })
      .then((res) => res.data);
  }

  /**
   * Get organization
   * @param  {String} org - org name
   * @return {Promise}
   */
  getOrg(org) {
    if (!this._tokenAvailable()) return Promise.resolve({});

    return this.gh.orgs
      .get({
        org,
      })
      .then((res) => res.data);
  }

  /**
   * Get public repos in organization
   * @param {String} org - org name
   * @return {Promise}
   */
  getOrgRepos(org) {
    if (!this._tokenAvailable()) return Promise.reject();

    return this.gh.repos
      .listForOrg({
        org,
      })
      .then((res) => res.data);
  }

  /**
   * Get organization members
   * @param  {String} org - org name
   * @return {Promise}
   */
  getOrgMembers(org) {
    if (!this._tokenAvailable()) return Promise.reject();

    return this.gh.orgs
      .listMembers({
        org,
        page: 1,
      })
      .then((res) => res.data);
  }

  /**
   * Search GitHub
   * @param {String} type - what to search the query for, i.e. repositories
   * @param {Object|String} data
   * @return {Promise}
   */
  search(type, data) {
    if (!this._tokenAvailable()) return Promise.resolve({});

    return this.gh.search[type](
      typeof data === 'string'
        ? {
            q: data,
          }
        : data
    ).then((res) => res.data);
  }

  /**
   * Get response error object
   * @param  {Error} err GitHub error
   * @return {Object}
   */
  getGitHubError(err) {
    return JSON.parse(
      err.message && err.message.startsWith('{') ? err.message : err
    );
  }

  /**
   * Detect if response error is github error
   * @param  {Error}  err
   * @return {Boolean}
   */
  isGitHubError(err) {
    return (
      err &&
      err.headers &&
      err.headers.server &&
      err.headers.server === this.Constants.HOST
    );
  }

  _tokenAvailable() {
    if (!this.tokenAvailable) {
      Log.warn(`GitHub | Returning sample github data`);
      return false;
    }
    return true;
  }
}

module.exports = new GitHub();
