const Log = require('../lib/Logger').Logger;
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true
})
.then(() => Log.info('=> Connected to DB'))
.catch(() => Log.error(`=> Unable to connect to ${process.env.DB_URL}`));

mongoose.Promise = global.Promise;

module.exports = mongoose;
