const mongoose = require('mongoose');
mongoose.connect(process.env.YAPPY_GITHUB_MONGODB);

mongoose.Promise = global.Promise;

module.exports = mongoose;
