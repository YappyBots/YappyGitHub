const bookshelf = require('.');

require('./Channel');

const LegacyChannelOrg = bookshelf.Model.extend({
  tableName: 'channel_orgs',

  channel() {
    return this.belongsTo('Channel');
  },
});

module.exports = bookshelf.model('LegacyChannelOrg', LegacyChannelOrg);
