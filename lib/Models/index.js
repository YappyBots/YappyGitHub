const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL || 'localhost')
.then(() => {
  Log.info(`MongoDB | Connected to DB`);
})
.catch((err) => {
  Log.error(`MongoDB |`, err);
  process.exit(err.code || 1);
});

module.exports = {
  ChannelConfig: require('./ChannelConfig'),
  ServerConfig: require('./ServerConfig'),
};
