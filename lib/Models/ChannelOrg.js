const bookshelf = require('.');

require('./Channel');

const ChannelOrg = bookshelf.Model.extend({
  tableName: 'channel_orgs',

  channel() {
    return this.belongsTo('Channel');
  },
});

module.exports = bookshelf.model('ChannelOrg', ChannelOrg);
