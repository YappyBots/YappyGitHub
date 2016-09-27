const db = require('sqlite');
const path = require('path');
const dbPath = path.resolve(__dirname, '../db/channelconf.sqlite');
const Collection = require('./Collection');

const channelconf = new Collection();

exports.init = () => {
  db.open(dbPath).then(() => {
    return db.all(`SELECT * FROM channel_configs`);
  }).then(rows => {
    for (const row of rows) channelconf.set(row.channel_id, row);
  });
}

exports.add = (channel_id, repo) => {
  return new Promise((resolve, reject) => {
    if (channelconf.has(channel_id)) return reject('Channel already has github repo webhooks configured');
    db.open(dbPath).then(() => {
      db.run(`INSERT INTO "channel_configs" (channel_id, repo) VALUES (?, ?)`, [channel_id, repo]).then(() => {
        channelconf.set(channel_id, { channel_id, repo })
        resolve({ channel_id, repo });
      }).catch(reject);
    })
  });
}

exports.get = (repo) => {
  return channelconf.findAll('repo', repo);
}

exports.find = channelconf.find.bind(channelconf);
exports.array = channelconf.array.bind(channelconf);
exports.exists = channelconf.exists.bind(channelconf);
exports.filter = channelconf.filter.bind(channelconf);
