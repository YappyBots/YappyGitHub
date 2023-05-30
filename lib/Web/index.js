const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const get = require('lodash/get');
const asyncHandler = require('express-async-handler');
const { DiscordAPIError } = require('discord.js');

const GitHubEventHandler = require('../GitHub/EventHandler');
const bot = require('../Discord');
const filter = require('../Util/filter');

const app = express();
const port = process.env.WEB_PORT || 8080;
const ip = process.env.WEB_IP || null;
process.env.WEB_HOST ||= `http://${ip || 'localhost'}:${port}`;

const engines = require('consolidate');
const Log = require('../Util/Log');
const ChannelConnection = require('../Models/ChannelConnection');
const NotFoundError = require('./NotFoundError');

// Secret verification
const sigHeaderName = 'X-Hub-Signature-256';
const sigHashAlg = 'sha256';
const ghWebhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
const verifyWebhookSecret = (req, res, next) => {
  if (!ghWebhookSecret) return next();
  if (!req.rawBody) {
    return next('Request body empty');
  }

  const sig = Buffer.from(req.get(sigHeaderName) || '', 'utf8');
  const hmac = crypto.createHmac(sigHashAlg, ghWebhookSecret);
  const digest = Buffer.from(
    `${sigHashAlg}=${hmac.update(req.rawBody).digest('hex')}`,
    'utf8'
  );
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    return next(401);
  }

  return next();
};

if (!ghWebhookSecret) {
  Log.warn('GitHub | No webhook secret set! Webhooks will not be verified.');
}

// Web server
app.set('view engine', 'hbs');
app.engine('ejs', engines.ejs);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(require('hpp')());

app.use(
  bodyParser.json({
    limit: '250kb',
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
      }
    },
  })
);

app.get(
  '/',
  asyncHandler(async (req, res) => {
    const connections = await ChannelConnection.count();
    const status = bot.statuses[bot.ws.status];
    const statusColor = bot.statusColors[bot.ws.status];

    res.render('index', { bot, connections, status, statusColor });
  })
);

app.post(
  ['/', '/github'],
  verifyWebhookSecret,
  asyncHandler(async (req, res) => {
    const event = req.headers['x-github-event'];
    const data = req.body;

    if (!event || !data || !req.headers['x-github-delivery'])
      return res.status(403).send('Invalid data. Please use GitHub webhooks.');

    const repo = get(data, 'repository.full_name');
    const repoId = get(data, 'repository.id');
    const installId = get(data, 'installation.id');
    const eventOwner =
      get(data, 'installation.account.login') ||
      get(data, 'repository.owner.login') ||
      '??';
    const org = get(data, 'organization.login');

    if (!repo && !installId) {
      return res
        .status(403)
        .send('Could not find repository or installation data in request.');
    }

    const connections = await ChannelConnection.query((q) => {
      q.where(function () {
        this.where('type', 'install');
        this.where('github_id', installId);
      });

      if (repoId)
        q.orWhere(function () {
          this.where('type', 'repo');
          this.where('github_id', repoId);
        });
    }).fetchAll({ withRelated: ['channel'] });
    const channels = connections
      .toArray()
      .map((c) => c.related('channel'))
      .filter(
        (c, i, arr) =>
          arr.indexOf(arr.find((v) => v.get('id') == c.get('id'))) === i
      );

    const action = data.action || data.status || data.state;
    const actionText = action ? `/${action}` : '';

    Log.verbose(`GitHub | ${repo || eventOwner} - ${event}${actionText}`);

    Log.addBreadcrumb({
      category: 'webhook',
      data: {
        event,
        repo,
        org,
        channels: channels.map((c) => c.get('id')),
      },
    });

    const eventResponse = GitHubEventHandler.use(repo, data, event);

    if (!eventResponse) {
      res.send(
        `${
          repo || eventOwner
        } : Ignoring ${event}${actionText}, this type of event is automagically ignored`
      );
      return;
    }

    res.send(
      `${repo || eventOwner} : Received ${event}${actionText}, emitting to ${
        channels.length
      } channels...`
    );

    const handleError = (err, channel) => {
      const errors = ['Forbidden', 'Missing Access'];
      if (!res || !err) return;
      if (
        errors.includes(err.message) ||
        (err.error && errors.includes(err.error.message))
      ) {
        channel.guild.owner.send(
          `**ERROR:** Yappy GitHub doesn't have permissions to read/send messages in ${channel}`
        );
      } else {
        channel.guild.owner.send(
          [
            `**ERROR:** An error occurred when trying to read/send messages in ${channel}.`,
            "Please report this to the bot's developer\n",
            '```js\n',
            err,
            '\n```',
          ].join(' ')
        );
        Log.error(err);
      }
    };

    await Promise.all(
      channels.filter(Boolean).map(async (conf) => {
        const wantsEmbed = conf.get('useEmbed');
        const ignoreUnknown = conf.get('ignoreUnknown');
        const id = conf.get('id');
        const channel = await bot.channels
          .fetch(id)
          .catch((e) => (e instanceof DiscordAPIError ? null : Log.error(e)));

        if (!channel) return;

        const actor = data.sender && data.sender.login;
        const branch = data.ref && data.ref.split('/')[2];

        if (
          !filter[conf.get('eventsType')](conf.get('eventsList'))(
            event + actionText
          ) ||
          !filter[conf.get('usersType')](conf.get('usersList'))(actor) ||
          !filter[conf.get('branchesType')](conf.get('branchesList'))(branch) ||
          !filter[conf.get('reposType')](conf.get('reposList'))(repo)
        ) {
          return;
        }

        if (eventResponse.unknown && ignoreUnknown) return;

        if (wantsEmbed) {
          return channel
            .send({ embeds: [eventResponse.embed] })
            .catch((err) => handleError(err, channel));
        } else {
          return channel
            .send(eventResponse.text)
            .catch((err) => handleError(err, channel));
        }
      })
    );
  })
);

require('./setup')(app);

app.use(function (req, res, next) {
  next(new NotFoundError());
});

app.use((err, req, res, next) => {
  if (err && err.status != 404) Log.error(err);

  const isDev = req.app.get('env') === 'development';

  if (isDev) {
    res.status(err.status || 500);
  }

  const payload = {
    name: err.name,
    description: err.message,
    stack: isDev && err.stack,
    status: (isDev && err.status) || 500,
  };

  res.format({
    html: () => res.render('error.ejs', payload),
    json: () => res.json(payload),
    text: () =>
      res.type('txt').send(`${err.status} ${err.name} ${err.message}`),
  });
});

app.listen(port, ip, () => {
  Log.info(
    `Express | Listening on ${ip || 'localhost'}:${port} -- live at ${
      process.env.WEB_HOST
    }`
  );
});

module.exports = app;
