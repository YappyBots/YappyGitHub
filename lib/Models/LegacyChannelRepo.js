const bookshelf = require('.');

require('./Channel');

const LegacyChannelRepo = bookshelf.Model.extend({
  tableName: 'channel_repos',

  channel() {
    return this.belongsTo('Channel');
  },
});

module.exports = bookshelf.model('LegacyChannelRepo', LegacyChannelRepo);
