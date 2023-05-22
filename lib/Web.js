const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const querystring = require('node:querystring'); 
const get = require('lodash/get');
const uuid = require('uuid');
const { DiscordAPIError } = require('discord.js');
const addons = require('@YappyBots/addons');

const Channel = require('./Models/Channel');
const ChannelRepo = require('./Models/ChannelRepo');
const GitHubEventHandler = require('./GitHub/EventHandler');
const bot = require('./Discord');
const filter = require('./Util/filter');
const redis = require('./Util/redis');

const app = express();
const port = process.env.WEB_PORT || 8080;
const ip = process.env.WEB_IP || null;
process.env.WEB_HOST ||= `http://${ip || 'localhost'}:${port}`;

const sigHeaderName = 'X-Hub-Signature-256';
const sigHashAlg = 'sha256';
const verifyWebhookSecret = (req, res, next) => {
  if (!req.rawBody) {
    return next('Request body empty')
  }

  const sig = Buffer.from(req.get(sigHeaderName) || '', 'utf8');
  const hmac = crypto.createHmac(sigHashAlg, process.env.GITHUB_WEBHOOK_SECRET);
  const digest = Buffer.from(`${sigHashAlg}=${hmac.update(req.rawBody).digest('hex')}`, 'utf8');
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    return res.send(401);
  }

  return next();
}

const engines = require('consolidate');
const GitHub = require('./GitHub');
const Log = require('./Util/Log');

app.set('view engine', 'hbs');
app.engine('hbs', engines.handlebars);
app.engine('ejs', engines.ejs);

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

app.get('/', async (req, res) => {
  const repos = await ChannelRepo.count();
  const status = bot.statuses[bot.ws.status];
  const statusColor = bot.statusColors[bot.ws.status];

  res.render('index', { bot, repos, status, statusColor });
});

app.post(['/', '/github'], verifyWebhookSecret, async (req, res) => {
  const event = req.headers['x-github-event'];
  const data = req.body;

  if (!event || !data || !req.headers['x-github-delivery'])
    return res.status(403).send('Invalid data. Please use GitHub webhooks.');

  const repo = get(data, 'repository.full_name');
  const org = get(data, 'organization.login');
  const channels = [
    ...(repo ? await Channel.findByRepo(repo) : []),
    ...(await Channel.findByOrg(get(data, 'repository.owner.login') || org)),
  ];

  const action = data.action || data.status || data.state;
  const actionText = action ? `/${action}` : '';

  Log.verbose(`GitHub | ${repo} - ${event}${actionText}`);

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
      `${repo} : Ignoring ${event}${actionText}, this type of event is automagically ignored`
    );
    return;
  }

  res.send(
    `${repo} : Received ${event}${actionText}, emitting to ${channels.length} channels...`
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
});

app.get('/setup/:id', async (req, res, next) => {
  const id = req.params.id;
  const { channel_id } = await redis.getHash('setup', id);

  if (!channel_id) return next(404);

  const state = uuid.v4();

  redis.setHash('setup', id, [
    ['state', state]
  ]);
  redis.expire('setup', id, 60 * 30);

  // https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
  const query = {
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${process.env.WEB_HOST}/setup/${id}/callback`,
    state,
    allow_signup: false,
  }

  res.redirect(`https://github.com/login/oauth/authorize?${querystring.stringify(query)}`);
})

app.get('/setup/:id/callback', async (req, res, next) => {
  const id = req.params.id;
  const { channel_id, channel_name, guild_name, state } = await redis.getHash('setup', id);

  const data = req.query;

  if (data.state !== state) return next(403);

  const options = await GitHub.userOAuthToken(data.code);
  const octokit = GitHub.fromOAuthToken(options.token);

  const { data: { login }} = await octokit.request('GET /user');

  redis.setHash('setup', id, [
    ['github_token', options.token],
    ['github_login', login],
  ]);
  redis.expire('setup', id, 60 * 30);

  res.send(`Successfully linked your GitHub account ${login} to ${guild_name}#${channel_name}!`);
});

app.use(
  addons.express.middleware(
    bot,
    {
      Channel: require('./Models/Channel'),
      Guild: require('./Models/Guild'),
    },
    {
      CLIENT_ID: process.env.DISCORD_CLIENT_ID,
      CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
      host: process.env.WEB_HOST,
    }
  )
);

app.use((err, req, res, next) => {
  if (err) Log.error(err);
  res.status(500);
  res.send(err.stack);
});

app.listen(port, ip, () => {
  Log.info(`Express | Listening on ${ip || 'localhost'}:${port}`);
});

module.exports = app;
