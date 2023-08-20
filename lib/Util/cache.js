const pick = require('lodash/pick');
const DiscordChannels = require('discord.js/src/util/Channels');
const bot = require('../Discord');
const { LRUCache } = require('lru-cache');

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 60 * 12 });

const expireChannel = (id) => cache.delete(id);

const fetchChannel = async (id) => {
  // Snowflakes are at least 17 digits
  if (!id || id.length < 17 || !/^\d+$/.test(id)) return null;

  if (cache.has(id)) {
    return cache.get(id);
  }

  let channel;

  try {
    channel =
      bot.channels.cache.get(id) ||
      (await bot.channels.fetch(id, { allowUnknownGuild: true }));
  } catch (err) {
    cache.set(id, null, { ttl: 1000 * 60 * 60 * 1 });

    return null;
  }

  const reduced = pick(channel, [
    'guild.id',
    'guild.name',
    'guild.icon',
    'id',
    'name',
    'type',
  ]);

  cache.set(id, reduced);

  return reduced;
};

const resolveChannel = async (id) => {
  const channel = id.id ? id : await fetchChannel(id);

  if (!channel) return null;

  return DiscordChannels.createChannel(bot, channel, channel.guild, {
    allowUnknownGuild: true,
  });
};

module.exports = {
  channels: {
    fetch: fetchChannel,
    expire: expireChannel,
    resolve: resolveChannel,
  },
};
