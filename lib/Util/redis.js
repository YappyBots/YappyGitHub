const redis = require('redis');
const Log = require('./Log');
const client = redis.createClient(
  process.env.REDIS_HOST,
  process.env.REDIS_HOST
);

exports.get = (db, key) => client.get(`${db}:${key}`);
exports.set = (db, key, value, expiry = -1) =>
  client.set(`${db}:${key}`, value, {
    EX: expiry,
  });

exports.expire = (db, key, expiry) => client.expire(`${db}:${key}`, expiry);
exports.ttl = (db, key) => client.ttl(`${db}:${key}`);

exports.setHash = (db, key, data, expiry) =>
  client
    .hSet(`${db}:${key}`, data)
    .then(() => expiry && client.expire(`${db}:${key}`, expiry));
// exports.setHashKey = (db, key, hash, value) => client.hSet(`${db}:${key}`, hash, value);
exports.getHash = (db, key) => client.hGetAll(`${db}:${key}`);
exports.getHashKey = (db, key, hash) => client.hGet(`${db}:${key}`, hash);

client
  .connect()
  .then(() => Log.info('Redis | Connected'))
  .catch((err) => {
    Log.error('Redis | Failed to connect');
    Log.error(err);
  });
