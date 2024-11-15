const pick = require('lodash/pick');
const bot = require('../Discord');
const { LRUCache } = require('lru-cache');
const { Guild } = require('discord.js');

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
    'guild.ownerId',
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

  // Essentially just calls `createChannel` internal util
  // and doesn't use the internal djs cache (as intended)
  return bot.channels._add(channel, resolveGuild(channel.guild), {
    cache: false,
  });
};

const resolveGuild = (guild) => {
  if (!guild?.id) return null;

  guild.owner_id ??= guild.ownerId;

  return new Guild(bot, guild);
};

module.exports = {
  channels: {
    fetch: fetchChannel,
    expire: expireChannel,
    resolve: resolveChannel,
  },
};
