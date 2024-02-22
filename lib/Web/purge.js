const rateLimit = require('express-rate-limit');
const uuid = require('uuid');
const ChannelConnection = require('../Models/ChannelConnection');
const asyncHandler = require('./utils/asyncHandler');
const redis = require('../Util/redis');
const bodyParser = require('body-parser');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 2 requests,
  handler: (req, res, next) => next(new TooManyRequestsError()),
});

module.exports = (app) => {
  app.use('/purge', bodyParser.urlencoded({ extended: true }));
  app.use('/purge', bodyParser.json());

  app.get('/purge', (req, res) => {
    res.render('purge/form', {
      error: req.query.error,
    });
  });

  app.post(
    '/purge/start',
    limiter,
    asyncHandler(async (req, res) => {
      // https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

      const body = await req.body;

      // Turnstile injects a token in "cf-turnstile-response".
      const token = body['cf-turnstile-response'];
      const ip = req.get('CF-Connecting-IP');

      // Validate the token by calling the "/siteverify" API endpoint.
      let formData = new FormData();
      formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
      formData.append('response', token);
      formData.append('remoteip', ip);

      const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const result = await fetch(url, {
        body: formData,
        method: 'POST',
      });

      const outcome = await result.json();

      if (!outcome.success) {
        return res.redirect(`/purge?error=${outcome.error - codes[0]}`);
      }

      const id = uuid.v4();

      await redis.setHash(
        'setup',
        id,
        {
          channel_id: -1,
          channel_name: '',
          guild_name: '',
        },
        60 * 30
      );

      res.redirect(`/setup/${id}`);

      return;
    })
  );
};
