const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

global.Log = require('./Util/Log');

require('./Web');
require('./Models');
require('./Discord');
require('./Github');
