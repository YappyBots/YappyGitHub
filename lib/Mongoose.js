const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL);

mongoose.Promise = global.Promise;

module.exports = mongoose;
