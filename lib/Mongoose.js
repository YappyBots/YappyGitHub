const mongoose = require('mongoose');
mongoose.connect(encodeURIComponent(process.env.YAPPY_GITHUB_MONGODB));

mongoose.Promise = global.Promise;

module.exports = mongoose;
