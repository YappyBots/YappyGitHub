const querystring = require('node:querystring');
const uuid = require('uuid');
const asyncHandler = require('express-async-handler');

const ChannelConnection = require('../Models/ChannelConnection');
const redis = require('../Util/redis');
const GitHub = require('../GitHub');
const { NotFoundError } = require('./errors');

module.exports = (app) => {
  app.get('/setup', (req, res, next) => {
    const { error, error_description, error_uri } = req.query;

    if (!error) return next();

    res.render('error.ejs', {
      name: error,
      message: error_description,
      link: error_uri,
    });
  });

  app.use(
    '/setup/:id',
    asyncHandler(async (req, res, next) => {
      const id = req.params.id;
      const channel = await redis.getHash('setup', id);

      if (!channel?.channel_id) throw new NotFoundError();

      req.setupData = channel;

      next();
    })
  );

  app.get(
    '/setup/:id',
    asyncHandler(async (req, res, next) => {
      const id = req.params.id;
      const state = uuid.v4();

      redis.setHash('setup', id, { state });

      // https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
      const query = {
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: `${process.env.WEB_HOST}/setup/${id}/callback`,
        state,
        allow_signup: false,
      };

      res.redirect(
        `https://github.com/login/oauth/authorize?${querystring.stringify(
          query
        )}`
      );
    })
  );

  app.get(
    '/setup/:id/callback',
    asyncHandler(async (req, res, next) => {
      const id = req.params.id;
      const data = req.query;
      const { state } = req.setupData;

      if (data.state !== state) return next(403);

      const options = await GitHub.userOAuthToken(data.code);
      const octokit = GitHub.fromOAuthToken(options.token);

      const {
        data: { login },
      } = await octokit.request('GET /user');

      redis.setHash('setup', id, [
        ['github_token', options.token],
        ['github_login', login],
      ]);

      res.redirect(`/setup/${id}/dashboard`);
    })
  );

  app.post(
    '/setup/:id/refresh-github',
    asyncHandler(async (req, res, next) => {
      const id = req.params.id;
      const { github_token } = req.setupData;

      if (!github_token) return res.redirect(`/setup/${id}`);

      await GitHub.userOAuthRepositories(github_token, id, true);

      res.redirect(`/setup/${id}/dashboard`);
    })
  );

  app.get(
    '/setup/:id/dashboard',
    asyncHandler(async (req, res, next) => {
      const id = req.params.id;
      const { channel_id, github_token } = req.setupData;
      const ttl = await redis.ttl('setup', id);

      if (!github_token) return res.redirect(`/setup/${id}`);

      const [connections, githubApp] = await Promise.all([
        ChannelConnection.where('channel_id', channel_id).fetchAll(),
        GitHub.userOAuthRepositories(github_token, id),
      ]);

      res.render('setup.ejs', {
        connections,
        githubApp,
        setupData: req.setupData,
        ttl,
      });
    })
  );

  app.post(
    '/setup/:id/connect/:type/:githubId',
    asyncHandler(async (req, res, next) => {
      const { id, type, githubId } = req.params;
      const { channel_id, github_token, repos } = req.setupData;

      if (!github_token) return res.redirect(`/setup/${id}`);

      let connection = await ChannelConnection.where('channel_id', channel_id)
        .where('type', type)
        .where('github_id', githubId)
        .fetch({ require: false });

      if (connection) res.redirect(`/setup/${id}/dashboard`);

      const githubData = JSON.parse(repos);
      let name;

      if (!githubData) return res.redirect(`/setup/${id}/refresh-github`);

      for (const [install, installRepos] of githubData) {
        if (type === 'repo') {
          const repo = installRepos.find((repo) => repo.id == githubId);

          if (repo) {
            name = repo.full_name;
            break;
          }
        } else if (type === 'install' && install.id == githubId) {
          name = install.account.login;
          break;
        }
      }

      connection = new ChannelConnection({
        id: null,
        channel_id,
        type,
        github_id: githubId,
        github_name: name,
      });

      await connection.save();

      res.redirect(`/setup/${id}/dashboard`);
    })
  );

  app.post(
    '/setup/:id/disconnect/:type/:githubId',
    asyncHandler(async (req, res, next) => {
      const { id, type, githubId } = req.params;
      const { channel_id } = req.setupData;

      await ChannelConnection.where('channel_id', channel_id)
        .where('type', type)
        .where('github_id', Number(githubId))
        .destroy();

      res.redirect(`/setup/${id}/dashboard`);
    })
  );

  app.use('/setup', (err, req, res, next) => {
    if (req.setupData) delete req.setupData.github_token;

    next(err);
  });
};
