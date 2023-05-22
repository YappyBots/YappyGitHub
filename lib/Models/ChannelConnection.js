const bookshelf = require('.');

require('./Channel');

const ChannelConnection = bookshelf.Model.extend({
  tableName: 'channel_connections',

  channel() {
    return this.belongsTo('Channel');
  },
});

module.exports = bookshelf.model('ChannelConnection', ChannelConnection);
