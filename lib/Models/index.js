const mongoose = require('mongoose');

mongoose.connect(process.env.YAPPY_GITHUB_BETA_MONGODB || 'localhost', {
  useMongoClient: true,
})
.then(() => {
  Log.error(`MongoDB | Connected to DB`);
})
.catch((err) => {
  Log.error(`MongoDB |`, err);
  process.exit(err.code || 1);
});

module.exports = {
  ChannelConfig: require('./ChannelConfig'),
  ServerConfig: require('./ServerConfig'),
};
