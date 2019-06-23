const bookshelf = require('.');

require('./Channel');

const ChannelRepo = bookshelf.Model.extend({
  tableName: 'channel_repos',

  channel() {
    return this.belongsTo('Channel');
  },
});

module.exports = bookshelf.model('ChannelRepo', ChannelRepo);
