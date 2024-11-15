require('dotenv').config();

require('./instrument');

global.Log = require('./Util/Log');

async function initialize() {
  const components = [
    { name: 'models', import: () => require('./Models') },
    { name: 'github', import: () => require('./GitHub') },
    { name: 'discord', import: () => require('./Discord') },
    { name: 'web', import: () => require('./Web') },
  ];

  Log.info('* Initializing components...');

  try {
    for (const component of components) {
      const startTime = process.hrtime();

      try {
        await Promise.resolve(component.import());
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const ms = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
        Log.info(`* Loaded ${component.name} (${ms}ms)`);
      } catch (err) {
        Log.error(`* Failed to load ${component.name}:`, err);
        throw err; // Re-throw to stop initialization
      }
    }

    Log.info('* All components initialized successfully');
  } catch (err) {
    Log.error('* Initialization failed:', err);
    process.exit(1);
  }
}

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

// Start initialization
initialize().catch((err) => {
  Log.error('Fatal initialization error:', err);
  process.exit(1);
});
