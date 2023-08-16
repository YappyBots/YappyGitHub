const pick = require('lodash/pick');
const bot = require('../Discord');
const { LRUCache } = require('lru-cache');

const cache = new LRUCache({ max: 100, ttl: 1000 * 60 * 60 * 12 });

module.exports.expireChannel = (id) => cache.delete(id);

module.exports.fetchChannel = async (id) => {
  // Snowflakes are at least 17 digits
  if (id.length < 17 || !/^\d+$/.test(id)) return null;

  if (cache.has(id)) {
    return cache.get(id);
  }

  let channel;

  try {
    channel = bot.channels.cache.get(id) || (await bot.channels.fetch(id));
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
  ]);

  cache.set(id, reduced);

  return reduced;
};
