const mongoose = require('mongoose');

mongoose.connect(process.env.YAPPY_GITHUB__BETA_MONGODB || 'localhost');

module.exports = {
  ChannelConfig: require('./ChannelConfig'),
  ServerConfig: require('./ServerConfig'),
};
