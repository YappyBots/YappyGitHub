const Collection = require('discord.js').Collection;
const GithubEvents = require('../Github/GithubEvents');
const ChannelConf = require('./ChannelConf');
const ServerConf = require('./ServerConf');
const GithubCache = require('./Util/GithubCache');
const WebhookUser = require('./Structures/WebhookUser');
const Util = require('./Util');
const Log = require('./Logger').Logger;
const moment = require('moment');

const FetchWebhooks = (channel, user) => {
  if (!channel.permissionsFor(user).has(`MANAGE_WEBHOOKS`)) return Promise.resolve(new Collection());
  return WebhookUser.fetchWebhooks(channel.id);
}
const ParseWebhookData = (data, body) => {
  body.avatar_url = 'https://cdn.discordapp.com/avatars/219218963647823872/db51d3838477022e0b04e8c4601f4ab3.jpg';

  if (!body.attachments) return body;

  body.attachments.map(e => {
    e.author_name = data.sender.login;
    e.author_link = data.sender.html_url;
    e.author_icon = data.sender.avatar_url;

    e.footer = data.repository.full_name;
    e.ts = new Date() / 1000;
  });

  return body;
}

const SendMessage = (bot, data) => {
  if (!bot || !data) return;
  
  let message = data.str;
  let repo = data.repo;

  if (!repo || !message) return false;

  let channelConfs = ChannelConf.FindByRepo(repo);

  if (!channelConfs.length) return false;

  let webhookData = message.webhook;
  let str = `**${repo}**: ${message.str || message}`

  channelConfs.forEach(channelConf => {
    let channel = bot.channels.get(channelConf.channelId);
    if (!channel) return false;

    FetchWebhooks(channel, bot.user).then(webhooks => {
      let webhook = webhooks.filter(e => {
        let name = e.name.toLowerCase();
        return name.includes('yappy') || name.includes('github');
      }).first();

      if (webhook && webhookData) return webhook.sendSlack(ParseWebhookData(message.payload, webhookData));
      if (webhook && str) return webhook.send(str);

      return channel.sendMessage(str);

    }).catch(err => {
      if (!err.body || JSON.parse(err.body).message !== "Missing Permissions") Log.error(err);

      return channel.sendMessage(str);
    });

  });

}

module.exports = bot => {
  
  ServerConf.addBotEvents(bot);

  bot.on('ready', () => {
    ServerConf.init(bot);
    GithubCache.init(ChannelConf);
  });

  GithubEvents.on('issues', data => SendMessage(bot, data));
  GithubEvents.on('issueComment', data => SendMessage(bot, data));
  GithubEvents.on('push', data => SendMessage(bot, data));
  GithubEvents.on('pr', data => SendMessage(bot, data));
  GithubEvents.on('release', data => SendMessage(bot, data));
  GithubEvents.on('fork', data => SendMessage(bot, data));
  GithubEvents.on('watch', data => SendMessage(bot, data));
  GithubEvents.on('branch', data => SendMessage(bot, data));
  GithubEvents.on('ping', data => SendMessage(bot, data));
  GithubEvents.on('repository', data => SendMessage(bot, data));
  GithubEvents.on('member', data => SendMessage(bot, data));
  GithubEvents.on('status', data => SendMessage(bot, data));
  GithubEvents.on('gollum', data => SendMessage(bot, data));

}
