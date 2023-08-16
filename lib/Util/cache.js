const pick = require('lodash/pick');
const bot = require('../Discord');
const redis = require('../Util/redis');

module.exports.fetchChannel = async (id) => {
  const cached = await redis.get('bot:channel', id);

  if (cached) {
    return JSON.parse(cached);
  }

  const channel = bot.channels.cache.get(id) || (await bot.channels.fetch(id));
  const reduced = pick(channel, [
    'guild.id',
    'guild.name',
    'guild.icon',
    'id',
    'name',
  ]);

  await redis.set('bot:channel', id, JSON.stringify(reduced), 60 * 60 * 12, {
    expire: true,
  });

  return reduced;
};
