const express = require('express');
const bodyParser = require('body-parser');
const ChannelConfig = require('./Models/ChannelConfig');
const GithubEventHandler = require('./Github/EventHandler');
const bot = require('./Discord');
const addons = require('yappybots-addons');

const app = express();
const port = process.env.WEB_PORT || 8080;
const ip = process.env.WEB_IP || null;

app.set('view engine', 'hbs');

app.use(bodyParser.json({
  limit: '250kb',
}));
app.use(bodyParser.urlencoded({
  extended: false,
}));

app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded' && req.body && req.body.payload) {
    req.body = JSON.parse(req.body.payload);
  }
  next();
});

app.get('/', (req, res) => {
  const repos = new Set(ChannelConfig._data.reduce((a, b) => a.concat(b.repos), []));
  const status = bot.statuses[bot.status];
  const statusColor = bot.statusColors[bot.status];
  res.render('index', { bot, repos, status, statusColor });
});

app.post(['/', '/github'], (req, res) => {
  const event = req.headers['x-github-event'];
  const data = req.body;

  if (!event || !data || !data.repository) return res.status(403).send('Invalid data. Please use Github webhooks.');

  const repo = data.repository.full_name;
  const channels = ChannelConfig.findByRepo(repo);
  const actionText = data.action ? `/${data.action}` : '';
  Log.verbose(`Github | ${repo} - ${event}${actionText}`);

  const eventResponse = GithubEventHandler.use(data, event);

  if (!eventResponse) {
    res.send(`${repo} : Ignoring ${event}${actionText}, this type of event is automagically ignored`);
    return;
  }

  res.send(`${repo} : Received ${event}${actionText}, emitting to ${channels.size} channels...`);

  const handleError = (resp, channel) => {
    const err = resp && resp.body;
    const errors = ['Forbidden', 'Missing Access'];
    if (!res || !err) return;
    if (errors.includes(err.message) || (err.error && errors.includes(err.error.message))) {
      channel.guild.owner.send(`**ERROR:** Yappy Github doesn't have permissions to read/send messages in ${channel}`);
    } else {
      channel.guild.owner.send([
        `**ERROR:** An error occurred when trying to read/send messages in ${channel}.`,
        'Please report this to the bot\'s developer\n',
        '```js\n',
        err,
        '\n```',
      ].join(' '));
      Log.error(err);
    }
  };

  channels.forEach(conf => {
    const wantsEmbed = !!conf.embed;
    const { channelID, disabledEvents, ignoredUsers, ignoredBranches } = conf;
    const channel = bot.channels.get(channelID);
    const actor = {
      name: data.sender.name,
      login: data.sender.login,
    };
    const branch = data.ref && data.ref.split('/')[2];

    if (!channel) return;
    if (disabledEvents.includes(event) || disabledEvents.includes(`${event}${actionText}`)) return;
    if (ignoredUsers && (ignoredUsers.includes(actor.name) || ignoredUsers.includes(actor.login))) return;
    if (ignoredBranches && branch && ignoredBranches.includes(branch)) return;

    if (wantsEmbed) {
      channel.send({ embed: eventResponse.embed }).catch(err => handleError(err, channel));
    } else {
      channel.send(`**${repo}**: ${eventResponse.text}`).catch(err => handleError(err, channel));
    }
  });
});

app.use(addons.express.middleware(bot, require('./Models'), {
  CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  host: process.env.BDPW_KEY ? 'https://www.yappybots.tk/beta/github' : `http://localhost:${port}`,
}));

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err) Log.error(err);
  res.status(500);
  res.send(err.stack);
});

app.listen(port, ip, () => {
  Log.info(`Express | Listening on ${ip || 'localhost'}:${port}`);
});

module.exports = app;
