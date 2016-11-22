const mongoose = require('mongoose');

mongoose.connect(process.env.YAPPY_GITHUB_MONGODB || 'localhost');

mongoose.Promise = global.Promise;

module.exports = {
  ChannelConfig: require('./ChannelConfig'),
};
