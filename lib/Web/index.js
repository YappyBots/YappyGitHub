const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const get = require('lodash/get');
const { DiscordAPIError } = require('discord.js');

const GitHubEventHandler = require('../GitHub/EventHandler');
const bot = require('../Discord');
const filter = require('../Util/filter');

const app = express();
const port = process.env.WEB_PORT || 8080;
const ip = process.env.WEB_IP || null;
process.env.WEB_HOST ||= `http://${ip || 'localhost'}:${port}`;

const Log = require('../Util/Log');
const ChannelConnection = require('../Models/ChannelConnection');
const Channel = require('../Models/Channel');
const { NotFoundError, BadRequestError } = require('./errors');
const asyncHandler = require('./utils/asyncHandler');

const verifyWebhookOrigin = require('./middleware/verifyWebhookOrigin');
const {
  verifyWebhookSecret,
  checkSecret,
} = require('./middleware/verifyWebhookSecret');
const cache = require('../Util/cache');

Log.configureExpressInit(app);

// Web server
app.set('view engine', 'ejs');
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(require('hpp')());

// GitHub webhooks may contain paylods of up to 25MB
// https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payloads
const webhookBodyParser = bodyParser.json({
  limit: '30MB',
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  },
});

app.get(
  '/',
  asyncHandler(async (req, res) => {
    const [connections, approxGuildCount] = await Promise.all([
      ChannelConnection.count(),
      bot.getApproxGuildCount(),
    ]);
    const status = bot.statuses[bot.ws.status];
    const statusColor = bot.statusColors[bot.ws.status];

    res.render('index', {
      bot,
      approxGuildCount,
      connections,
      status,
      statusColor,
    });
  })
);

app.post(
  '/hook',
  webhookBodyParser,
  verifyWebhookOrigin,
  verifyWebhookSecret,
  asyncHandler(async (req, res) => {
    const event = req.headers['x-github-event'];
    const delivery = req.headers['x-github-delivery'];
    const data = req.body;

    if (!event || !data || !delivery)
      return res.status(403).send('Invalid request.');

    const { repo, repoId, installId, eventOwner, actionText } =
      getHookInfo(data);

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

    Log.verbose(`GitHub | ${repo || eventOwner} - ${event}${actionText}`);

    Log.addBreadcrumb({
      category: 'webhook.receive.app',
      message: `[${delivery}] ${event}${actionText} from ${repo || eventOwner}`,
      data: {
        repo,
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

    return await sendToChannels({
      event,
      eventResponse,
      data,
      channels: channels,
    });
  })
);

const getHookInfo = (data) => {
  const repo = get(data, 'repository.full_name');
  const org = get(data, 'organization.login');

  const repoId = get(data, 'repository.id');
  const installId = get(data, 'installation.id');
  const eventOwner =
    get(data, 'installation.account.login') ||
    get(data, 'repository.owner.login') ||
    '??';

  const actor = data?.sender?.login;
  const branch = data?.ref?.split('/').slice(2).join('/');

  const action = data.action || data.status || data.state;
  const actionText = action ? `/${action}` : '';

  return {
    repo,
    org,
    repoId,
    installId,
    eventOwner,
    actor,
    branch,
    action,
    actionText,
  };
};

const sendToChannels = async ({ channels, eventResponse, data }) => {
  if (!(channels instanceof Map)) {
    const channelConfigs = channels;

    channels = new Map();

    await Promise.all(
      channelConfigs.filter(Boolean).map((conf) =>
        bot.channels
          .fetch(conf.get('id'))
          .then((channel) => channels.set(channel, conf))
          .catch((e) => (e instanceof DiscordAPIError ? null : Log.error(e)))
      )
    );
  }

  const { event, actionText, actor, branch, repo } = getHookInfo(data);

  /**
   * @param {import('discord.js').GuildChannel} channel
   */
  const handleError = async (err, channel) => {
    const errors = ['Forbidden', 'Missing Access'];
    if (!err) return;
    if (
      errors.includes(err.message) ||
      (err.error && errors.includes(err.error.message))
    ) {
      const owner = await channel.guild.fetchOwner();

      return owner
        .send(
          `**ERROR:** Yappy GitHub doesn't have permissions to read/send messages in ${channel}`
        )
        .catch(() => {});
    } else {
      Log.error(err);

      try {
        const owner = await channel.guild.fetchOwner();

        return owner.send(
          [
            `**ERROR:** An error occurred when trying to read/send messages in ${channel}.`,
            "Please report this to the bot's developer\n",
            '```js\n',
            err,
            '\n```',
          ].join(' ')
        );
      } catch (err) {
        Log.error('Failed to send error message to guild owner');
      }
    }
  };

  return await Promise.all(
    [...channels.entries()].map(async ([channel, conf]) => {
      const wantsEmbed = conf?.get('useEmbed') ?? true;
      const ignoreUnknown = conf?.get('ignoreUnknown') ?? true;

      if (
        conf &&
        (!filter[conf.get('eventsType')](conf.get('eventsList'))(
          event + actionText
        ) ||
          !filter[conf.get('usersType')](conf.get('usersList'))(actor) ||
          (branch &&
            !filter[conf.get('branchesType')](conf.get('branchesList'))(
              branch
            )) ||
          (repo && !filter[conf.get('reposType')](conf.get('reposList'))(repo)))
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
};

app.get(
  '/hook/channels/:ids',
  asyncHandler(async (req, res, next) => {
    const ids = [...new Set(req.params.ids.split(','))];
    const channels = (
      await Promise.allSettled(ids.map(cache.fetchChannel))
    ).map((v) => v.value);
    const mapped = new Map(channels.map((channel, i) => [ids[i], channel]));

    const validIDs = channels.filter(Boolean).map((channel) => channel.id);

    res.render('hook-channel', {
      ids: validIDs,
      channels: mapped,
    });
  })
);

app.post(
  '/hook/channels/:ids',
  webhookBodyParser,
  verifyWebhookOrigin,
  asyncHandler(async (req, res, next) => {
    // Retrieve hook info
    const event = req.headers['x-github-event'];
    const delivery = req.headers['x-github-delivery'];
    const data = req.body;
    const { repo, org, actionText } = getHookInfo(data);

    if (!event || !delivery || (!repo && !org))
      return next(
        new BadRequestError(
          'Invalid data. Please use GitHub webhooks & JSON content type.'
        )
      );

    // Retrieve channels
    const ids = req.params.ids.split(',');

    if (ids.length > 10)
      return next(new BadRequestError('Too many channels specified.'));

    let botChannels = (
      await Promise.allSettled(ids.map((id) => bot.channels.fetch(id)))
    )
      .map((r) => r.value)
      .filter(Boolean);

    const channelIds = botChannels.map((c) => c.id);
    const channelConfigs = await Channel.query((q) =>
      q.whereIn('id', channelIds)
    ).fetchAll();

    // check secrets to prevent anybody from sending webhooks from any repo to any channel
    const skip = [];

    for (const channel of botChannels) {
      const config = channelConfigs.get(channel.id);
      const secret = await config?.getSecret();

      if (!checkSecret(req, secret)) {
        skip.push(channel);
      }
    }

    botChannels = botChannels.filter((c) => !skip.includes(c));

    Log.verbose(`GitHub | ${repo} - ${event}${actionText}`);

    Log.addBreadcrumb({
      category: 'webhook.receive.channel',
      message: `[${delivery}] ${event}${actionText} from ${repo || org}`,
      data: {
        repo,
        org,
        delivery,
        channels: channelIds,
        skipped: skip.map((c) => c.id),
      },
    });

    // Handle event
    const eventResponse = GitHubEventHandler.use(repo, data, event);

    if (!eventResponse) {
      return res.send(
        `${
          repo || org
        } : Ignoring ${event}${actionText}, this type of event is automagically ignored`
      );
    }

    res.send(
      `${repo || org} : Received ${event}${actionText}, emitting to ${
        botChannels.length
      } channels (skipped ${skip.length})...`
    );

    return await sendToChannels({
      event,
      eventResponse,
      data,
      channels: new Map(botChannels.map((c) => [c, channelConfigs.get(c.id)])),
    });
  })
);

require('./setup')(app);

app.use(function (req, res, next) {
  next(new NotFoundError());
});

Log.configureExpressError(app);

app.use((err, req, res, next) => {
  const status = err?.status ?? (Number.isInteger(err) ? err : 500);

  err.sentry = res.sentry;

  if (status < 400 || status >= 500) Log.error(err);

  const isDev = req.app.get('env') === 'development';

  if (isDev) {
    res.status(status || 500);
  }

  const payload = {
    name: err.name,
    message: err.message,
    stack: isDev && err.stack,
    status: (isDev && status) || 500,
    sentry: res.sentry,
  };

  res.format({
    json: () => res.json(payload),
    html: () => res.render('error', payload),
    text: () =>
      res
        .type('txt')
        .send(`${status} ${err.name} ${err.message} -- ${res.sentry}`),
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
