const { Octokit } = require('@octokit/rest');
const {
  createOAuthAppAuth,
  createOAuthUserAuth,
} = require('@octokit/auth-oauth-app');
const pick = require('lodash/pick');
const EventHandler = require('./EventHandler');
const Constants = require('./Constants');
const Log = require('../Util/Log');
const redis = require('../Util/redis');
const GitHubRepoParse = require('./GitHubRepoParser').Parse;

/**
 * Methods to retrieve information from GitHub using package `github`
 * Made these so it's easier to remember. Plus autocomplete ;)
 */
class GitHub {
  constructor() {
    this.Constants = Constants;

    Log.info(`GitHub | Logging in...`);

    const {
      GITHUB_CLIENT_ID: clientId,
      GITHUB_CLIENT_SECRET: clientSecret,
      GITHUB_TOKEN: token,
    } = process.env;

    if (clientId && clientSecret) {
      Log.info(`GitHub | OAuth app credentials provided`);

      this.appGh = new Octokit({
        authStrategy: createOAuthAppAuth,
        auth: {
          clientId,
          clientSecret,
        },
      });
    } else {
      Log.warn(
        `GitHub | No OAuth app credentials provided! /setup won't work.`
      );
    }

    if (token) {
      this.tokenAvailable = true;
      this.token = token;

      this.gh = new Octokit({
        auth: this.token,
        request: {
          timeout: 5000,
        },
      });

      Log.info(`GitHub | General token provided.`);
    } else {
      Log.warn(`GitHub | No token provided! Skipped login.`);
    }
  }

  userOAuthToken(code) {
    if (!this.appGh) throw new Error('No OAuth app credentials provided!');

    return this.appGh.auth({
      type: 'oauth-user',
      code,
    });
  }

  fromOAuthToken(token) {
    return new Octokit({
      authStrategy: createOAuthUserAuth,
      auth: {
        type: 'token',
        tokenType: 'oauth',
        clientType: 'oauth-app',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        token: token,
        scopes: [],
      },
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  }

  async userOAuthRepositories(token, setupId, bypassCache = false) {
    const octokit = this.fromOAuthToken(token);

    const cached =
      !bypassCache && (await redis.getHashKey('setup', setupId, 'repos'));

    if (cached) return JSON.parse(cached);

    // Actually retrieve from GitHub API
    //  TODO use pagination iterator (octokit.paginate.iterator)
    const installations = await octokit.paginate('GET /user/installations');
    const repos = await Promise.all(
      installations.map((installation) =>
        octokit
          .paginate(`GET /user/installations/${installation.id}/repositories`)
          .then((repositories) => [
            pick(installation, [
              'id',
              'account.login',
              'account.id',
              'account.avatar_url',
              'account.type',
              'repository_selection',
              'html_url',
            ]),
            repositories
              .filter((repo) => repo.permissions.admin)
              .map((repo) =>
                pick(repo, ['id', 'name', 'full_name', 'private', 'html_url'])
              ),
          ])
          .catch((err) => {
            Log.error(err);
            throw new Error(
              `Failed to get repositories for installation of ${installation.account.login} (${installation.id})`
            );
          })
      )
    );

    if (!cached) {
      await redis.setHash('setup', `${setupId}`, {
        repos: JSON.stringify(repos),
      });
      // await redis.set('setup', `${setupId}-repos`, JSON.stringify(repos), 60 * 30);
    }

    return repos;
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
   * Get GitHub PR from repository
   * @param {String} repository - repo's full name or url
   * @param {Number} issue - PR number
   * @return {Promise}
   */
  getRepoPR(repository, issue) {
    if (!this._tokenAvailable()) return Promise.resolve({});

    const repo =
      typeof repository === 'object' ? repository : GitHubRepoParse(repository);

    return this.gh.pulls
      .get({
        owner: repo.owner,
        repo: repo.name,
        pull_number: issue,
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
    if (!this._tokenAvailable()) return Promise.resolve([]);

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
