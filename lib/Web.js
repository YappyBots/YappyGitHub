const express = require('express');
const bodyParser = require('body-parser');
const ChannelConfig = require('./Models/ChannelConfig');

const app = express();
const port = process.env.YAPPY_GITHUB_PORT || process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
const ip = process.env.YAPPY_GITHUB_IP || process.env.OPENSHIFT_NODEJS_IP || process.env.IP || null;

app.use(bodyParser.json({
  limit: '250kb',
}));

app.post(['/', '/github'], (req, res) => {
  const event = req.headers['x-github-event'];
  const data = req.body;

  if (!event || !data || !data.repository) return res.status(403).send('Invalid data. Plz use GitHub webhooks.');

  const channels = ChannelConfig.FindByRepo(data.repository.full_name);
  res.send(`Channels listening for this repo: ${channels.map(e => e.channelId).join(',')}`);
});

app.listen(port, ip, () => {
  Log.info(`=> Express: Listening on ${ip || 'localhost'}:${port}`);
});

module.exports = app;
