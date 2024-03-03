require('dotenv').config();

global.Log = require('./Util/Log');

Log.info('Initializing');

require('./Web');
require('./Models');
require('./Util');
require('./Util/YappyGitHub');
require('./Discord');
require('./GitHub');

const logUnhandled = (type) => (err) => {
  try {
    Log.error(`Unhandled ${type}:`);
    Log.error(err);
  } catch (err) {
    console.error(`Unhandled ${type}:`);
    console.error(err);
  }
};

process.on('unhandledRejection', logUnhandled('Rejection'));
process.on('uncaughtException', logUnhandled('Exception'));
